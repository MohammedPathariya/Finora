# backend/services/stock_service.py

import os, requests

API_KEY = os.getenv("ALPHA_VANTAGE_KEY")
BASE_URL = "https://www.alphavantage.co/query"

def get_current_price(symbol: str) -> float:
    """Fetch latest price for a ticker via Alpha Vantage."""
    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": API_KEY
    }
    data = requests.get(BASE_URL, params=params).json()
    quote = data.get("Global Quote", {})
    # sometimes keys include leading/trailing spaces, so:
    price = quote.get("05. price") or quote.get("5. price")
    return float(price) if price else 0.0