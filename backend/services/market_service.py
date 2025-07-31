import os
from datetime import datetime

import requests
from dotenv import load_dotenv

# Load .env so ALPHA_VANTAGE_KEY is available in os.environ
load_dotenv()

API_KEY = os.getenv("ALPHA_VANTAGE_KEY")
BASE_URL = "https://www.alphavantage.co/query"


def fetch_quote(symbol: str) -> float:
    """
    Returns the latest close price for `symbol` via Alpha Vantage GLOBAL_QUOTE.
    """
    params = {
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": API_KEY
    }
    resp = requests.get(BASE_URL, params=params)
    resp.raise_for_status()
    data = resp.json().get("Global Quote", {})
    price_str = data.get("05. price") or data.get("5. price")
    return float(price_str) if price_str else 0.0


def fetch_daily_history(symbol: str, output_size: str = "compact") -> dict:
    """
    Returns a dict mapping date → { open, high, low, close, volume }.
    output_size: "compact" (last 100 days) or "full" (full history).
    """
    params = {
        "function": "TIME_SERIES_DAILY",
        "symbol": symbol,
        "outputsize": output_size,
        "apikey": API_KEY
    }
    resp = requests.get(BASE_URL, params=params)
    resp.raise_for_status()
    ts = resp.json().get("Time Series (Daily)", {})
    history = {}
    for date_str, vals in ts.items():
        date = datetime.strptime(date_str, "%Y-%m-%d").date()
        history[date] = {
            "open":   float(vals["1. open"]),
            "high":   float(vals["2. high"]),
            "low":    float(vals["3. low"]),
            "close":  float(vals["4. close"]),
            "volume": int(vals["5. volume"])
        }
    return history