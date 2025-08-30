# backend/services/recommendation_service.py

"""
Core Recommendation Engine for the Finora Application.

This service is the "brain" of Finora, responsible for generating a personalized,
data-driven investment portfolio for a user. It follows a sophisticated,
multi-step process:

1.  **Nuanced Risk Scoring**: It analyzes a user's full profile (age, income,
    experience, etc.) to calculate a holistic risk score from 1 to 10.
2.  **Dynamic Asset Allocation**: It uses this risk score to generate a custom
    asset allocation model by blending predefined conservative and aggressive portfolios.
3.  **Data-Driven Security Selection**: For each asset class in the custom model,
    it selects the "best" ETF from a predefined universe based on a weighted
    analysis of its Sharpe ratio, volatility, and expense ratio.
4.  **Portfolio Assembly**: It combines the selected ETFs and allocations into a
    final, actionable investment plan.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from .market_service import (
    get_etf_metadata_from_db, 
    get_historical_data_for_period, 
    calculate_volatility, 
    calculate_sharpe_ratio,
    calculate_historical_return
)

# A mapping of broad investment categories to a universe of corresponding ETF symbols.
ETF_CATEGORIES = {
    "US Large Cap": ["VOO", "VTI", "SPY", "IVV", "VTV", "VUG", "SCHX", "SCHG", "VV", "IWF", "IVW", "IWD", "IWB"],
    "US Mid Cap": ["IJH", "VO", "IWR", "MDY"],
    "US Small Cap": ["IJR", "VB", "VBR", "VXF", "IWM"],
    "International Developed": ["VEA", "IEFA", "EFA", "SCHF", "SPDW", "EFV", "VGK", "VEU"],
    "International Emerging": ["IEMG", "VWO"],
    "Bonds": ["BND", "AGG", "BNDX", "VCIT", "BSV", "VTEB", "VCSH", "IEF", "GOVT", "LQD", "IUSB", "VGIT", "BIV"],
    "Technology": ["QQQ", "VGT", "XLK", "QQQM", "IYW", "SMH"],
    "Alternatives": ["GLD", "VNQ", "IBIT", "IAU", "FBTC"],
}


def _fetch_and_calculate_all_etf_metrics():
    """
    Pre-computes key financial metrics for every ETF in the database.

    This is a data-intensive helper function that gathers all necessary performance
    and risk data upfront. This prevents redundant calculations and database
    calls later in the process.

    Returns:
        dict: A dictionary where keys are ETF symbols and values are their calculated metrics.
    """
    etf_metadata = get_etf_metadata_from_db()
    all_metrics = {}

    for etf in etf_metadata:
        symbol = etf['symbol']
        historical_data_1yr = get_historical_data_for_period(symbol, 365)
        
        # Gathers key metrics used for the selection process.
        all_metrics[symbol] = {
            "name": etf['name'],
            "expense_ratio": float(etf['expense_ratio']),
            "volatility": calculate_volatility(historical_data_1yr),
            "sharpe_ratio": calculate_sharpe_ratio(historical_data_1yr),
            "one_year_return": calculate_historical_return(historical_data_1yr)
        }
    return all_metrics

def _find_best_etf_for_category(category: str, all_metrics: dict, risk_tolerance: str) -> dict:
    """
    Selects the best ETF for a given asset category based on a weighted score.

    The scoring formula adjusts its weights based on the user's risk tolerance.
    For example, a "conservative" user's score will more heavily favor a high
    Sharpe ratio and low volatility.

    Args:
        category (str): The asset category (e.g., "US Large Cap").
        all_metrics (dict): The dictionary of pre-computed metrics for all ETFs.
        risk_tolerance (str): The user's self-reported risk tolerance.

    Returns:
        dict or None: The data for the highest-scoring ETF in the category, or None if none are found.
    """
    symbols_in_category = ETF_CATEGORIES.get(category, [])
    candidate_etfs = {s: m for s, m in all_metrics.items() if s in symbols_in_category}
    if not candidate_etfs: return None

    # Define the weights for the scoring formula based on risk tolerance.
    # Note: Volatility and expense are negative because lower is better.
    if risk_tolerance == "conservative": weights = {"sharpe": 0.6, "volatility": -0.3, "expense": -0.1}
    elif risk_tolerance == "aggressive": weights = {"sharpe": 0.8, "volatility": -0.1, "expense": -0.1}
    else: weights = {"sharpe": 0.7, "volatility": -0.2, "expense": -0.1} # Moderate
    
    best_etf, max_score = None, -float('inf')
    for symbol, metrics in candidate_etfs.items():
        # The weighted score combines risk-adjusted return (Sharpe), risk (volatility), and cost (expense).
        score = (metrics['sharpe_ratio'] * weights['sharpe'] + metrics['volatility'] * weights['volatility'] + metrics['expense_ratio'] * weights['expense'])
        if score > max_score:
            max_score, best_etf = score, {"symbol": symbol, **metrics}
    return best_etf

def generate_recommendation(profile: dict) -> dict:
    """
    The main orchestrator function to generate a personalized recommendation.

    This function executes the full recommendation pipeline: calculating a risk score,
    generating a dynamic asset allocation, selecting the best ETF for each allocation,
    and assembling the final portfolio object.

    Args:
        profile (dict): The user's financial profile from the onboarding process.

    Returns:
        dict: A comprehensive dictionary containing the full recommendation details.
    """
    # 1. Analyze the user's profile to get a holistic risk score.
    risk_score = _calculate_nuanced_risk_score(profile)
    # 2. Generate a custom asset allocation based on the risk score.
    dynamic_allocation_model = _generate_dynamic_allocation(risk_score)
    # 3. Fetch and calculate metrics for all available ETFs.
    all_etf_metrics = _fetch_and_calculate_all_etf_metrics()
    
    # 4. Build the final portfolio by selecting the best ETF for each asset class.
    recommended_portfolio = []
    investment_amount = profile.get("investment_amount", 0)
    risk_tolerance = profile.get("risk_tolerance")

    for category, percentage in dynamic_allocation_model.items():
        best_etf = _find_best_etf_for_category(category, all_etf_metrics, risk_tolerance)
        if best_etf:
            # Also fetch the 1-year historical data for the selected ETF to be used
            # for charting in the frontend.
            chart_data = get_historical_data_for_period(best_etf['symbol'], 365)

            recommended_portfolio.append({
                "symbol": best_etf['symbol'],
                "name": best_etf['name'],
                "category": category,
                "allocation": round(percentage * 100),
                "investment_amount": round(investment_amount * percentage, 2),
                "historical_data": chart_data
            })
            
    # 5. Calculate the weighted average expected return of the final portfolio.
    portfolio_expected_return = 0.0
    for etf in recommended_portfolio:
        symbol = etf['symbol']
        allocation_pct = etf['allocation'] / 100.0
        # Uses the 1-year historical return as a proxy for expected future return.
        etf_return = all_etf_metrics.get(symbol, {}).get('one_year_return', 0.0)
        portfolio_expected_return += allocation_pct * etf_return

    # 6. Return the complete, structured recommendation object.
    return {
        "nuanced_risk_score": round(risk_score, 2),
        "risk_tolerance_original": risk_tolerance,
        "expected_annual_return": round(portfolio_expected_return, 2),
        "recommended_portfolio": recommended_portfolio
    }

def _calculate_nuanced_risk_score(profile: dict) -> float:
    """
    Calculates a holistic risk score for a user on a scale of 1-10.

    This function goes beyond the user's self-reported risk tolerance by applying
    adjustments based on other profile factors that influence risk capacity, such
    as age and investment time horizon. A younger user with a long time horizon,
    for example, will have their risk score adjusted upwards.

    Args:
        profile (dict): The user's financial profile.

    Returns:
        float: A nuanced risk score between 1.0 (most conservative) and 10.0 (most aggressive).
    """
    base_score = {"conservative": 3.0, "moderate": 6.0, "aggressive": 9.0}.get(profile.get("risk_tolerance"), 5.0)
    adjustment = 0.0
    
    # Adjust score based on age and time horizon (risk capacity).
    age = profile.get("age", 40)
    if age < 30: adjustment += 1.0 # Younger investors have more time to recover from downturns.
    elif age > 50: adjustment -= 1.0 # Older investors should generally take less risk.
    
    time_horizon = profile.get("time_horizon", "medium")
    if time_horizon == "long": adjustment += 1.0 # A longer timeline allows for more risk.
    elif time_horizon == "short": adjustment -= 1.0 # A shorter timeline requires more caution.
    
    # Adjust score based on financial situation and experience.
    investment_amount = profile.get("investment_amount", 0)
    income = profile.get("income", 0)
    if income > 0 and (investment_amount / income) > 0.20: adjustment -= 1.0 # Investing a large portion of income suggests less capacity for loss.
    
    experience = profile.get("experience", "intermediate")
    if experience == "advanced": adjustment += 0.5 # More experienced investors may be comfortable with more risk.
    elif experience == "beginner": adjustment -= 0.5 # Beginners should be introduced to risk more gradually.
    
    final_score = base_score + adjustment
    # Clamp the final score to be within the 1-10 range.
    return max(1.0, min(10.0, final_score))

def _generate_dynamic_allocation(risk_score: float) -> dict:
    """
    Generates a dynamic asset allocation model by blending two portfolios.

    This function creates a custom portfolio by interpolating between a predefined
    "safest" portfolio (heavy on bonds) and a "riskiest" portfolio (heavy on equities),
    based on the user's nuanced risk score.

    Args:
        risk_score (float): The user's risk score from 1-10.

    Returns:
        dict: A dictionary representing the custom asset allocation model (e.g., {"Bonds": 0.5, ...}).
    """
    safest_portfolio = {"Bonds": 0.70, "US Large Cap": 0.20, "International Developed": 0.10}
    riskiest_portfolio = {"US Large Cap": 0.50, "International Developed": 0.25, "International Emerging": 0.15, "Technology": 0.10}
    
    # Convert the 1-10 risk score to a 0.0-1.0 percentage.
    risk_percent = (risk_score - 1) / 9.0
    
    final_allocation = {}
    all_categories = set(safest_portfolio.keys()) | set(riskiest_portfolio.keys())
    
    # Linearly interpolate the percentage for each asset class.
    for category in all_categories:
        safe_pct = safest_portfolio.get(category, 0)
        risky_pct = riskiest_portfolio.get(category, 0)
        final_pct = safe_pct + (risky_pct - safe_pct) * risk_percent
        if final_pct > 0:
            final_allocation[category] = final_pct
            
    # Normalize the final allocation to ensure it sums to 100%.
    total_pct = sum(final_allocation.values())
    return {category: pct / total_pct for category, pct in final_allocation.items()}