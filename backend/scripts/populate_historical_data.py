"""
Offline Data Caching Script for Finora.

This script is designed to be run independently (e.g., via a daily cron job)
to populate and maintain a cache of historical ETF price data in a Supabase
database. It fetches the list of ETFs to track from the 'etfs' table and
intelligently scrapes only the new, missing data for each one from Yahoo Finance.

This caching strategy ensures the live application remains fast and reliable,
without being dependent on slow, external APIs for historical data requests.
"""

import os
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# --- Configuration ---
# Load environment variables from the .env file and initialize the Supabase client.
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in .env file")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Set a historical start date for the very first scrape of a new ETF.
# This ensures a consistent baseline of data for all tracked securities.
INITIAL_SCRAPE_START_DATE = "2020-01-01"

def run_scraper():
    """
    Executes the main data scraping and caching logic.

    This function performs a series of steps for each ETF tracked in the database:
    1. Fetches the master list of ETF symbols.
    2. For each symbol, determines the last date for which data is cached.
    3. Calculates the required date range for fetching new data.
    4. Downloads the missing historical data from Yahoo Finance.
    5. Formats the data and upserts it into the 'etf_historical_data' table.

    The process is idempotent, meaning it can be run multiple times without
    creating duplicate entries or causing errors.
    """
    # 1. Get the list of symbols to track directly from our 'etfs' table
    print("Fetching list of ETFs to track from the database...")
    etfs_response = supabase.table('etfs').select('symbol').execute()
    if not etfs_response.data:
        print("No ETFs found in the database. Please populate the 'etfs' table first.")
        return
    
    symbols_to_track = [item['symbol'] for item in etfs_response.data]
    print(f"Found {len(symbols_to_track)} ETFs to process.")

    for symbol in symbols_to_track:
        print(f"--- Processing: {symbol} ---")
        
        # 2. Find the most recent date we have for this symbol in our database.
        # This makes the script efficient and idempotent. By finding the last entry,
        # we ensure that we only fetch data that is genuinely new.
        response = supabase.table('etf_historical_data') \
            .select('date') \
            .eq('symbol', symbol) \
            .order('date', desc=True) \
            .limit(1) \
            .execute()

        latest_date_in_db = None
        if response.data:
            # If data exists, the next scrape should start the day after the latest record.
            latest_date_in_db = datetime.strptime(response.data[0]['date'], '%Y-%m-%d').date()
            print(f"Latest data in database: {latest_date_in_db}")
            start_date = latest_date_in_db + timedelta(days=1)
        else:
            # If no data exists for this symbol, start from the initial fixed date.
            print("No existing data found. Starting initial scrape from 2020.")
            start_date = datetime.strptime(INITIAL_SCRAPE_START_DATE, '%Y-%m-%d').date()

        # 3. Scrape new data from Yahoo Finance
        today = datetime.now().date()
        if start_date >= today:
            print(f"Data for {symbol} is already up to date. Skipping scrape.")
            continue

        print(f"Scraping new data for {symbol} from {start_date} to {today}...")
        # yf.download fetches the data. auto_adjust=True is important as it
        # adjusts prices for stock splits and dividends, ensuring historical accuracy.
        df = yf.download(symbol, start=start_date, end=today, progress=False, auto_adjust=True)

        if df.empty:
            print(f"No new data found from Yahoo Finance for {symbol}.")
            continue

        # 4. Prepare and insert the new records into Supabase.
        # The yfinance library returns a pandas DataFrame, which we must convert
        # into a list of dictionaries that matches our Supabase table schema.
        records_to_insert = []
        for date, row in df.iterrows():
            record = {
                "symbol": symbol,
                "date": date.strftime('%Y-%m-%d'),
                "close_price": round(float(row['Close']), 2)
            }
            records_to_insert.append(record)

        if records_to_insert:
            print(f"Found {len(records_to_insert)} new records to insert.")
            try:
                # We use .upsert() as a robust way to insert data. While our date logic
                # should prevent any duplicate primary keys (symbol, date), upsert
                # provides an extra layer of safety against potential conflicts.
                _, count = supabase.table('etf_historical_data').upsert(records_to_insert).execute()
                print(f"Successfully inserted/updated records for {symbol}.")
            except Exception as e:
                print(f"An error occurred during insert for {symbol}: {e}")

    print("\n--- Scraping process complete. ---")

if __name__ == "__main__":
    # This block allows the script to be run directly from the command line.
    run_scraper()