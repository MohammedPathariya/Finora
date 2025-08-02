from .market_service import get_current_price, fetch_daily_history
from datetime import date

# Static metadata for your top ETFs
ETF_INFO = [
    {"ticker": "VTI", "expense_ratio": 0.03},
    {"ticker": "QQQ", "expense_ratio": 0.20},
    {"ticker": "SPY", "expense_ratio": 0.09},
    {"ticker": "BND", "expense_ratio": 0.035},
]

def get_top_etfs():
    today = date.today()
    start_of_year = date(today.year, 1, 1)
    etfs = []

    for info in ETF_INFO:
        symbol = info["ticker"]
        price = get_current_price(symbol)
        history = fetch_daily_history(symbol, output_size="full")
        # Compute YTD return
        ytd_start_price = history.get(start_of_year, {}).get("close", price)
        ytd_return = (price - ytd_start_price) / ytd_start_price if ytd_start_price else 0

        etfs.append({
            "ticker": symbol,
            "current_price": price,
            "ytd_return": ytd_return,
            "expense_ratio": info["expense_ratio"]
        })

    return etfs
