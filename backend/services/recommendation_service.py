# backend/services/recommendation_service.py

def recommend_portfolio(risk: str) -> dict:
    """
    Map a user’s risk level to a simple ETF allocation.
    risk: "low", "medium", or "high"
    """
    if risk == "low":
        return {"BND": 70, "VTI": 20, "SHY": 10}
    if risk == "medium":
        return {"VTI": 50, "QQQ": 30, "BND": 20}
    if risk == "high":
        return {"QQQ": 60, "VTI": 30, "SPY": 10}

    # Fallback if no recognized risk
    return {"VTI": 100}