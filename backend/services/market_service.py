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
FMP_API_KEY = os.getenv("FMP_API_KEY")

if not all([SUPABASE_URL, SUPABASE_KEY, FMP_API_KEY]):
    raise ValueError("API keys and Supabase credentials must be set in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Service Functions ---

def get_etf_metadata_from_db():
    """Fetches all ETF metadata (symbol, name, expense_ratio) from our db."""
    response = supabase.table('etfs').select('symbol, name, expense_ratio').execute()
    return response.data if response.data else []

def get_live_prices_from_fmp(symbols: list) -> dict:
    """Fetches the current price for a list of symbols from FMP in a single call."""
    if not symbols:
        return {}
    symbol_str = ",".join(symbols)
    url = f"https://financialmodelingprep.com/api/v3/quote-short/{symbol_str}?apikey={FMP_API_KEY}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        return {item['symbol']: item['price'] for item in data}
    except requests.exceptions.RequestException as e:
        print(f"Error fetching live prices from FMP: {e}")
        return {}

def get_historical_data_for_period(symbol: str, days: int) -> list:
    """Gets cached historical data for a symbol for a specific past period."""
    start_date = datetime.now().date() - timedelta(days=days)
    
    response = supabase.table('etf_historical_data') \
        .select('date, close_price') \
        .eq('symbol', symbol) \
        .gte('date', start_date.strftime('%Y-%m-%d')) \
        .order('date', asc=True) \
        .execute()
    return response.data if response.data else []

# --- Calculation Functions ---

def calculate_historical_return(historical_data: list) -> float:
    """Calculates the total return over the given historical data period."""
    if len(historical_data) < 2:
        return 0.0
    start_price = float(historical_data[0]['close_price'])
    end_price = float(historical_data[-1]['close_price'])
    if start_price == 0:
        return 0.0
    return round(((end_price - start_price) / start_price) * 100, 2)

def calculate_ytd_return(live_price: float, historical_data: list) -> float:
    """Calculates the Year-to-Date return from a series of historical prices."""
    if not historical_data or live_price is None:
        return 0.0
    start_price = float(historical_data[0]['close_price'])
    if start_price == 0:
        return 0.0
    ytd_return = ((live_price - start_price) / start_price) * 100
    return round(ytd_return, 2)

def calculate_volatility(historical_data: list) -> float:
    """Calculates the annualized volatility (standard deviation of daily returns)."""
    if len(historical_data) < 2:
        return 0.0
    prices = pd.Series([float(p['close_price']) for p in historical_data])
    daily_returns = prices.pct_change().dropna()
    volatility = daily_returns.std() * np.sqrt(252) 
    return round(volatility * 100, 2)

def calculate_sharpe_ratio(historical_data: list, risk_free_rate: float = 0.04) -> float:
    """Calculates the Sharpe Ratio, assuming a risk-free rate (e.g., 4%)."""
    if len(historical_data) < 2:
        return 0.0
    prices = pd.Series([float(p['close_price']) for p in historical_data])
    daily_returns = prices.pct_change().dropna()
    if daily_returns.std() == 0:
        return 0.0
    excess_returns = daily_returns - (risk_free_rate / 252)
    sharpe_ratio = (excess_returns.mean() / excess_returns.std()) * np.sqrt(252)
    return round(sharpe_ratio, 2)