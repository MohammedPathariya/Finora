# backend/services/market_service.py

import logging
from datetime import datetime
from .av_client import API_KEY, BASE_URL
import requests

logging.basicConfig(level=logging.DEBUG)

def get_current_price(symbol: str) -> float:
    params = {
        "function": "GLOBAL_QUOTE",
        "symbol":   symbol,
        "apikey":   API_KEY
    }
    resp = requests.get(BASE_URL, params=params)
    resp.raise_for_status()
    data = resp.json()
    logging.debug("AlphaVantage GLOBAL_QUOTE for %s → %s", symbol, data)
    quote = data.get("Global Quote", {})
    price = quote.get("05. price") or quote.get("5. price")
    return float(price) if price else 0.0


def fetch_daily_history(symbol: str, output_size: str="compact") -> dict:
    """Returns date→{open,high,low,close,volume} via TIME_SERIES_DAILY."""
    resp = requests.get(BASE_URL, params={
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "outputsize": output_size,
        "apikey": API_KEY
    })
    resp.raise_for_status()
    ts = resp.json().get("Time Series (Daily)", {})
    return {
        datetime.strptime(d, "%Y-%m-%d").date(): {
            "open":  float(vals["1. open"]),
            "high":  float(vals["2. high"]),
            "low":   float(vals["3. low"]),
            "close": float(vals["4. close"]),
            "volume":int(vals["5. volume"])
        }
        for d, vals in ts.items()
    }