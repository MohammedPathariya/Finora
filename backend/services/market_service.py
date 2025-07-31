import requests
from datetime import datetime
from .av_client import API_KEY, BASE_URL

def get_current_price(symbol: str) -> float:
    """Returns latest price via GLOBAL_QUOTE."""
    resp = requests.get(BASE_URL, params={
        "function": "GLOBAL_QUOTE",
        "symbol": symbol,
        "apikey": API_KEY
    })
    resp.raise_for_status()
    data = resp.json().get("Global Quote", {})
    price = data.get("05. price") or data.get("5. price")
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