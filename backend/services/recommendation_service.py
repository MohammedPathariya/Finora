# backend/services/recommendation_service.py

from .market_service import get_current_price


def _get_pct_alloc(risk: str) -> dict:
    """
    Maps a user’s risk level to a simple ETF percentage allocation.
    """
    if risk == "low":
        return {"BND": 70, "VTI": 20, "SHY": 10}
    if risk == "medium":
        return {"VTI": 50, "QQQ": 30, "BND": 20}
    if risk == "high":
        return {"QQQ": 60, "VTI": 30, "SPY": 10}
    # Fallback if no recognized risk
    return {"VTI": 100}


def recommend_portfolio(risk: str, total_amount: float) -> dict:
    """
    Builds a detailed portfolio recommendation based on risk and total investment.

    Returns a dict with:
      - risk_level (str)
      - investment_amount (float)
      - allocation (dict of ticker -> { percentage, dollar_amount, price, shares })
    """
    # 1) Get static percentage allocation
    pct_alloc = _get_pct_alloc(risk)

    # 2) Build detailed allocation
    detailed = {}
    for ticker, pct in pct_alloc.items():
        # Dollar slice for this ticker
        dollar_amt = round(total_amount * (pct / 100), 2)
        # Live price lookup
        price = get_current_price(ticker)
        # Compute share count
        shares = round(dollar_amt / price, 4) if price > 0 else 0

        detailed[ticker] = {
            "percentage": pct,
            "dollar_amount": dollar_amt,
            "price": price,
            "shares": shares
        }

    return {
        "risk_level": risk,
        "investment_amount": total_amount,
        "allocation": detailed
    }