from flask import Blueprint, jsonify
from services.market_service import (
    get_etf_metadata_from_db,
    get_live_prices_from_fmp,
    get_historical_data_for_period,
    calculate_ytd_return,
    calculate_historical_return,
    calculate_volatility,
    calculate_sharpe_ratio
)

etfs_bp = Blueprint("etfs", __name__)

@etfs_bp.route("/api/etfs/market-data", methods=["GET"])
def get_top_etf_data():
    try:
        etf_metadata = get_etf_metadata_from_db()
        if not etf_metadata:
            return jsonify({"error": "No ETFs found in database."}), 404
        
        symbols = [etf['symbol'] for etf in etf_metadata]
        live_prices = get_live_prices_from_fmp(symbols)
        
        response_data = []
        for etf in etf_metadata:
            symbol = etf['symbol']
            current_price = live_prices.get(symbol)
            
            # Fetch data for the last year (365 days) and for YTD
            historical_data_1yr = get_historical_data_for_period(symbol, 365)
            historical_data_ytd = get_historical_data_for_period(symbol, 240) # Approx days in year so far

            # Perform calculations
            one_year_return = calculate_historical_return(historical_data_1yr)
            ytd_return = calculate_ytd_return(current_price, historical_data_ytd)
            volatility = calculate_volatility(historical_data_1yr)
            sharpe_ratio = calculate_sharpe_ratio(historical_data_1yr)

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
        print(f"An error occurred in the market data endpoint: {e}")
        return jsonify({"error": "An internal server error occurred."}), 500