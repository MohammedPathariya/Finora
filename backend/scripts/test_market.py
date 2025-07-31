#!/usr/bin/env python

from services.market_service import fetch_quote, fetch_daily_history

def main():
    tickers = ["VTI", "QQQ", "BND"]
    print("=== Latest Quotes ===")
    for t in tickers:
        price = fetch_quote(t)
        print(f"{t}: ${price:.2f}")

    print("\n=== Recent History (last 5 days for VTI) ===")
    hist = fetch_daily_history("VTI", output_size="compact")
    # sort dates descending and pick top 5
    recent = sorted(hist.items(), reverse=True)[:5]
    for date, data in recent:
        print(f"{date} → close: ${data['close']:.2f}, volume: {data['volume']}")

if __name__ == "__main__":
    main()
