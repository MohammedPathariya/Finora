# backend/routes/etfs.py

"""
API Endpoint for ETF Market Data.

This blueprint serves the '/api/etfs/market-data' route, which provides a
comprehensive, calculated dataset for all ETFs tracked by the Finora application.

It orchestrates calls to the `market_service` to fetch raw data and then
computes key performance indicators like returns, volatility, and Sharpe ratio
before returning the enriched data to the client. This endpoint powers the
"Market Data" page in the frontend application.
"""

from flask import Blueprint, jsonify
from datetime import datetime
from services.market_service import (
    get_etf_metadata_from_db,
    get_latest_prices_from_db,
    get_historical_data_for_period,
    calculate_ytd_return,
    calculate_historical_return,
    calculate_volatility,
    calculate_sharpe_ratio
)

etfs_bp = Blueprint("etfs", __name__)

@etfs_bp.route("/api/etfs/market-data", methods=["GET"])
def get_top_etf_data():
    """
    Fetches and computes market data for all tracked ETFs.

    This endpoint retrieves the master list of ETFs, fetches their latest prices
    and historical data from the database cache, and then calculates several
    key performance and risk metrics for each one.

    Returns:
        A JSON response containing a list of ETF data objects.
        On success (200):
            [
                {
                    "symbol": "VOO",
                    "name": "Vanguard S&P 500 ETF",
                    "price": 450.79,
                    "ytd_return": 15.45,
                    "expense_ratio": 0.03,
                    "one_year_return": 18.21,
                    "volatility": 14.88,
                    "sharpe_ratio": 1.25
                },
                ...
            ]
        On error (404 or 500):
            { "error": "Error message details..." }
    """
    try:
        # 1. Fetch static metadata for all ETFs (name, symbol, expense ratio).
        etf_metadata = get_etf_metadata_from_db()
        if not etf_metadata:
            return jsonify({"error": "No ETFs found in database."}), 404
        
        symbols = [etf['symbol'] for etf in etf_metadata]
        
        # 2. Fetch the most recent closing price for all symbols. This is more
        # efficient than querying the price for each ETF inside the loop.
        latest_prices = get_latest_prices_from_db(symbols)
        
        response_data = []
        # 3. For each ETF, fetch its historical data and compute performance metrics.
        for etf in etf_metadata:
            symbol = etf['symbol']
            current_price = latest_prices.get(symbol)
            
            # Fetch the last 365 days of data for 1-year return and volatility calculations.
            historical_data_1yr = get_historical_data_for_period(symbol, 365)
            # Use the helper to get data from Jan 1st of this year for YTD calculations.
            historical_data_ytd = get_yearly_historical_data_from_db(symbol)

            # Perform calculations by delegating to the market_service.
            one_year_return = calculate_historical_return(historical_data_1yr)
            ytd_return = calculate_ytd_return(current_price, historical_data_ytd)
            volatility = calculate_volatility(historical_data_1yr)
            sharpe_ratio = calculate_sharpe_ratio(historical_data_1yr)

            # 4. Assemble the final data object for this ETF and add it to the list.
            response_data.append({
                'symbol': symbol,
                'name': etf['name'],
                'price': current_price or 0.0,
                'ytd_return': ytd_return,
                'expense_ratio': float(etf['expense_ratio']),
                'one_year_return': one_year_return,
                'volatility': volatility,
                'sharpe_ratio': sharpe_ratio
            })
            
        return jsonify(response_data)

    except Exception as e:
        # A general exception handler to catch any errors during the complex
        # data fetching and calculation process.
        print(f"An error occurred in the market data endpoint: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500


def get_yearly_historical_data_from_db(symbol: str) -> list:
    """
    Helper function to get historical data from the beginning of the current year.

    It calculates the number of days that have passed since January 1st of the
    current year and then calls the main historical data service function to
    retrieve the relevant data slice.

    Args:
        symbol (str): The ETF symbol to fetch data for.

    Returns:
        list: A list of historical data points for the year-to-date period.
    """
    today = datetime.now().date()
    start_of_year = datetime(today.year, 1, 1).date()
    days_since_start_of_year = (today - start_of_year).days
    # Reuse the existing service function to get data for the calculated number of days.
    return get_historical_data_for_period(symbol, days_since_start_of_year)