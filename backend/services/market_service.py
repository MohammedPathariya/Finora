# backend/services/market_service.py

"""
Service Layer for Market Data and Financial Calculations.

This module is the central hub for accessing all market-related data from the
database cache and performing key financial calculations. It abstracts the
database interactions and complex formulas away from the API routes and other
services.

The functions are divided into two categories:
1. Data Retrieval: Functions that query the Supabase database.
2. Financial Calculations: Pure functions that perform mathematical operations
   on the retrieved data using libraries like pandas and numpy.
"""

import os
import requests
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Configuration ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY]):
    raise ValueError("Supabase credentials must be set in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Service Functions ---

def get_etf_metadata_from_db():
    """
    Fetches static metadata for all ETFs from the 'etfs' table.
    
    This includes descriptive, non-time-series data like name and expense ratio.
    
    Returns:
        list: A list of dictionaries, where each dictionary represents an ETF.
              Returns an empty list if no data is found.
    """
    response = supabase.table('etfs').select('symbol, name, expense_ratio').execute()
    return response.data if response.data else []

def get_latest_prices_from_db(symbols: list) -> dict:
    """
    Fetches the most recent closing price for each given symbol from the cache.

    Iterates through a list of symbols and queries the database for the latest
    price entry for each one.

    Args:
        symbols (list): A list of ETF symbols (e.g., ['VOO', 'QQQ']).

    Returns:
        dict: A dictionary mapping each symbol to its latest price.
              Example: {'VOO': 450.79, 'QQQ': 380.50}
    """
    if not symbols:
        return {}
    
    prices = {}
    # Note: For a very large number of symbols (1000+), this loop could be slow.
    # A more advanced implementation might use a single, more complex SQL query.
    for symbol in symbols:
        # For each symbol, get the latest entry by ordering by date descending.
        response = supabase.table('etf_historical_data') \
            .select('close_price') \
            .eq('symbol', symbol) \
            .order('date', desc=True) \
            .limit(1) \
            .execute()
        
        if response.data:
            prices[symbol] = float(response.data[0]['close_price'])
    
    print(f"Fetched latest prices for {len(prices)} symbols from DB cache.")
    return prices

def get_historical_data_for_period(symbol: str, days: int) -> list:
    """
    Gets cached historical data for a symbol for a specific past period.

    Args:
        symbol (str): The ETF symbol to fetch data for.
        days (int): The number of days of historical data to retrieve from today.

    Returns:
        list: A list of dictionaries, each with 'date' and 'close_price'.
              Data is sorted in ascending chronological order.
    """
    start_date = datetime.now().date() - timedelta(days=days)
    
    response = supabase.table('etf_historical_data') \
        .select('date, close_price') \
        .eq('symbol', symbol) \
        .gte('date', start_date.strftime('%Y-%m-%d')) \
        .order('date', desc=False) \
        .execute()
    return response.data if response.data else []

# --- Calculation Functions ---

def calculate_historical_return(historical_data: list) -> float:
    """
    Calculates the total percentage return over a given historical data period.

    Args:
        historical_data (list): A list of dictionaries sorted chronologically.

    Returns:
        float: The total return as a percentage (e.g., 18.21 for 18.21%).
    """
    if len(historical_data) < 2:
        return 0.0
    start_price = float(historical_data[0]['close_price'])
    end_price = float(historical_data[-1]['close_price'])
    if start_price == 0:
        return 0.0
    return round(((end_price - start_price) / start_price) * 100, 2)

def calculate_ytd_return(live_price: float, historical_data: list) -> float:
    """
    Calculates the Year-to-Date (YTD) return.

    This compares the price at the start of the year with the current live price.

    Args:
        live_price (float): The current price of the security.
        historical_data (list): Data from the start of the year to the present.

    Returns:
        float: The YTD return as a percentage.
    """
    if not historical_data or live_price is None:
        return 0.0
    start_price = float(historical_data[0]['close_price'])
    if start_price == 0:
        return 0.0
    ytd_return = ((live_price - start_price) / start_price) * 100
    return round(ytd_return, 2)

def calculate_volatility(historical_data: list) -> float:
    """
    Calculates the annualized volatility of a security.

    Volatility is a statistical measure of the dispersion of returns, commonly
    used as a measure of risk. It is calculated as the standard deviation of
    the daily percentage changes in price. This daily volatility is then
    annualized by multiplying by the square root of 252 (the approximate
    number of trading days in a year).

    Args:
        historical_data (list): A list of dictionaries with 'close_price'.

    Returns:
        float: The annualized volatility as a percentage (e.g., 15.88).
    """
    if len(historical_data) < 2:
        return 0.0
    prices = pd.Series([float(p['close_price']) for p in historical_data])
    daily_returns = prices.pct_change().dropna()
    # Annualize the daily standard deviation by multiplying by sqrt(252).
    volatility = daily_returns.std() * np.sqrt(252) 
    return round(volatility * 100, 2)

def calculate_sharpe_ratio(historical_data: list, risk_free_rate: float = 0.04) -> float:
    """
    Calculates the Sharpe Ratio, a measure of risk-adjusted return.

    The Sharpe Ratio indicates how much excess return an investor receives for
    taking on additional risk. A higher Sharpe Ratio (e.g., > 1) is generally
    considered better. It is calculated as the average excess return (portfolio
    return minus the risk-free rate) divided by the portfolio's volatility.

    Args:
        historical_data (list): A list of dictionaries with 'close_price'.
        risk_free_rate (float, optional): The annualized risk-free rate,
                                           representing the return on a "zero-risk"
                                           investment (e.g., a U.S. Treasury bill).
                                           Defaults to 0.04 (4%).

    Returns:
        float: The annualized Sharpe Ratio (e.g., 1.25).
    """
    if len(historical_data) < 2:
        return 0.0
    prices = pd.Series([float(p['close_price']) for p in historical_data])
    daily_returns = prices.pct_change().dropna()
    if daily_returns.std() == 0:
        return 0.0
    
    # Calculate the average daily return in excess of the daily risk-free rate.
    excess_returns = daily_returns - (risk_free_rate / 252)
    
    # Annualize the result by multiplying the daily Sharpe ratio by sqrt(252).
    sharpe_ratio = (excess_returns.mean() / excess_returns.std()) * np.sqrt(252)
    return round(sharpe_ratio, 2)