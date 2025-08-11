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

# ... (ETF_CATEGORIES and ASSET_ALLOCATION_MODELS are unchanged) ...
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
    Helper function to get all data and calculate metrics for all ETFs.
    """
    etf_metadata = get_etf_metadata_from_db()
    all_metrics = {}

    for etf in etf_metadata:
        symbol = etf['symbol']
        historical_data_1yr = get_historical_data_for_period(symbol, 365)
        
        # 1. ADD THE 1-YEAR RETURN TO THE METRICS WE GATHER FOR EACH ETF
        all_metrics[symbol] = {
            "name": etf['name'],
            "expense_ratio": float(etf['expense_ratio']),
            "volatility": calculate_volatility(historical_data_1yr),
            "sharpe_ratio": calculate_sharpe_ratio(historical_data_1yr),
            "one_year_return": calculate_historical_return(historical_data_1yr) # <-- NEW
        }
    return all_metrics

def _find_best_etf_for_category(category: str, all_metrics: dict, risk_tolerance: str) -> dict:
    # ... (this function is unchanged) ...
    symbols_in_category = ETF_CATEGORIES.get(category, [])
    candidate_etfs = {s: m for s, m in all_metrics.items() if s in symbols_in_category}
    if not candidate_etfs: return None
    if risk_tolerance == "conservative": weights = {"sharpe": 0.6, "volatility": -0.3, "expense": -0.1}
    elif risk_tolerance == "aggressive": weights = {"sharpe": 0.8, "volatility": -0.1, "expense": -0.1}
    else: weights = {"sharpe": 0.7, "volatility": -0.2, "expense": -0.1}
    best_etf, max_score = None, -float('inf')
    for symbol, metrics in candidate_etfs.items():
        score = (metrics['sharpe_ratio'] * weights['sharpe'] + metrics['volatility'] * weights['volatility'] + metrics['expense_ratio'] * weights['expense'])
        if score > max_score:
            max_score, best_etf = score, {"symbol": symbol, **metrics}
    return best_etf

# The only change is in the main `generate_recommendation` function
def generate_recommendation(profile: dict) -> dict:
    """
    The main function to generate a fully personalized, data-driven recommendation.
    """
    risk_score = _calculate_nuanced_risk_score(profile)
    dynamic_allocation_model = _generate_dynamic_allocation(risk_score)
    all_etf_metrics = _fetch_and_calculate_all_etf_metrics()
    
    recommended_portfolio = []
    investment_amount = profile.get("investment_amount", 0)
    risk_tolerance = profile.get("risk_tolerance")

    for category, percentage in dynamic_allocation_model.items():
        best_etf = _find_best_etf_for_category(category, all_etf_metrics, risk_tolerance)
        if best_etf:
            # --- NEW: Fetch 1 year of historical data for the chart ---
            chart_data = get_historical_data_for_period(best_etf['symbol'], 365)

            recommended_portfolio.append({
                "symbol": best_etf['symbol'],
                "name": best_etf['name'],
                "category": category,
                "allocation": round(percentage * 100),
                "investment_amount": round(investment_amount * percentage, 2),
                "historical_data": chart_data # <-- ADD THIS to the object
            })
            
    portfolio_expected_return = 0.0
    for etf in recommended_portfolio:
        symbol = etf['symbol']
        allocation_pct = etf['allocation'] / 100.0
        etf_return = all_etf_metrics.get(symbol, {}).get('one_year_return', 0.0)
        portfolio_expected_return += allocation_pct * etf_return

    return {
        "nuanced_risk_score": round(risk_score, 2),
        "risk_tolerance_original": risk_tolerance,
        "expected_annual_return": round(portfolio_expected_return, 2),
        "recommended_portfolio": recommended_portfolio
    }

def _calculate_nuanced_risk_score(profile: dict) -> float:
    # ... (this function is unchanged) ...
    base_score = {"conservative": 3.0, "moderate": 6.0, "aggressive": 9.0}.get(profile.get("risk_tolerance"), 5.0)
    adjustment = 0.0
    age = profile.get("age", 40)
    if age < 30: adjustment += 1.0
    elif age > 50: adjustment -= 1.0
    time_horizon = profile.get("time_horizon", "medium")
    if time_horizon == "long": adjustment += 1.0
    elif time_horizon == "short": adjustment -= 1.0
    investment_amount = profile.get("investment_amount", 0)
    income = profile.get("income", 0)
    if income > 0 and (investment_amount / income) > 0.20: adjustment -= 1.0
    experience = profile.get("experience", "intermediate")
    if experience == "advanced": adjustment += 0.5
    elif experience == "beginner": adjustment -= 0.5
    final_score = base_score + adjustment
    return max(1.0, min(10.0, final_score))

def _generate_dynamic_allocation(risk_score: float) -> dict:
    # ... (this function is unchanged) ...
    safest_portfolio = {"Bonds": 0.70, "US Large Cap": 0.20, "International Developed": 0.10}
    riskiest_portfolio = {"US Large Cap": 0.50, "International Developed": 0.25, "International Emerging": 0.15, "Technology": 0.10}
    risk_percent = (risk_score - 1) / 9.0
    final_allocation = {}
    all_categories = set(safest_portfolio.keys()) | set(riskiest_portfolio.keys())
    for category in all_categories:
        safe_pct = safest_portfolio.get(category, 0)
        risky_pct = riskiest_portfolio.get(category, 0)
        final_pct = safe_pct + (risky_pct - safe_pct) * risk_percent
        if final_pct > 0:
            final_allocation[category] = final_pct
    total_pct = sum(final_allocation.values())
    return {category: pct / total_pct for category, pct in final_allocation.items()}