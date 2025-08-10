import json
from .market_service import get_etf_metadata_from_db, get_historical_data_for_period, calculate_volatility, calculate_sharpe_ratio

# 1. Define the base "recipes" for each risk level
ASSET_ALLOCATION_MODELS = {
    "conservative": {
        "US Large Cap": 0.25,
        "International Developed": 0.10,
        "Bonds": 0.65,
    },
    "moderate": {
        "US Large Cap": 0.40,
        "US Mid Cap": 0.10,
        "International Developed": 0.15,
        "International Emerging": 0.05,
        "Bonds": 0.25,
        "Alternatives": 0.05,
    },
    "aggressive": {
        "US Large Cap": 0.45,
        "US Mid Cap": 0.15,
        "US Small Cap": 0.05,
        "International Developed": 0.20,
        "International Emerging": 0.10,
        "Technology": 0.05,
    }
}

# 2. Categorize the ETFs you are tracking. This is crucial for the logic.
ETF_CATEGORIES = {
    "US Large Cap": ["VOO", "SPY", "IVV", "VTI", "VUG", "VTV", "SCHX", "SCHG", "VV", "IWF", "IVW", "IWD", "IWB"],
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
    In a real app, this data would be cached to avoid re-calculation on every request.
    """
    etf_metadata = get_etf_metadata_from_db()
    all_metrics = {}

    for etf in etf_metadata:
        symbol = etf['symbol']
        historical_data = get_historical_data_for_period(symbol, 365)
        
        all_metrics[symbol] = {
            "name": etf['name'],
            "expense_ratio": float(etf['expense_ratio']),
            "volatility": calculate_volatility(historical_data),
            "sharpe_ratio": calculate_sharpe_ratio(historical_data)
        }
    return all_metrics

def _find_best_etf_for_category(category: str, all_metrics: dict, risk_tolerance: str) -> dict:
    """
    Scores and selects the best ETF within a category based on user's risk tolerance.
    """
    symbols_in_category = ETF_CATEGORIES.get(category, [])
    
    # Filter the metrics to only include ETFs in our target category
    candidate_etfs = {s: m for s, m in all_metrics.items() if s in symbols_in_category}

    if not candidate_etfs:
        return None

    # Define scoring weights based on risk
    if risk_tolerance == "conservative":
        weights = {"sharpe": 0.6, "volatility": -0.3, "expense": -0.1} # Prioritize stability
    elif risk_tolerance == "aggressive":
        weights = {"sharpe": 0.8, "volatility": -0.1, "expense": -0.1} # Prioritize return
    else: # moderate
        weights = {"sharpe": 0.7, "volatility": -0.2, "expense": -0.1} # Balanced approach

    best_etf = None
    max_score = -float('inf')

    for symbol, metrics in candidate_etfs.items():
        score = (
            metrics['sharpe_ratio'] * weights['sharpe'] +
            metrics['volatility'] * weights['volatility'] + # volatility is a cost, so its weight is negative
            metrics['expense_ratio'] * weights['expense']   # expense is a cost, so its weight is negative
        )
        if score > max_score:
            max_score = score
            best_etf = {"symbol": symbol, **metrics}
            
    return best_etf

def generate_recommendation(risk_tolerance: str, investment_amount: float) -> dict:
    """
    The main function to generate a data-driven portfolio recommendation.
    """
    # 1. Select the appropriate asset allocation model
    model = ASSET_ALLOCATION_MODELS.get(risk_tolerance, ASSET_ALLOCATION_MODELS['moderate'])
    
    # 2. Fetch and calculate metrics for ALL ETFs once
    all_etf_metrics = _fetch_and_calculate_all_etf_metrics()
    
    # 3. Build the recommended portfolio
    recommended_portfolio = []
    for category, percentage in model.items():
        best_etf = _find_best_etf_for_category(category, all_etf_metrics, risk_tolerance)
        if best_etf:
            recommended_portfolio.append({
                "symbol": best_etf['symbol'],
                "name": best_etf['name'],
                "category": category,
                "allocation": int(percentage * 100),
                "investment_amount": round(investment_amount * percentage, 2)
            })
            
    return {
        "risk_tolerance": risk_tolerance,
        "recommended_portfolio": recommended_portfolio
    }