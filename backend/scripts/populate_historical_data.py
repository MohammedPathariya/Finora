import os
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client

# --- Configuration ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in .env file")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Set a historical start date for the very first scrape
INITIAL_SCRAPE_START_DATE = "2020-01-01"

def run_scraper():
    """
    Fetches the list of ETFs from the database and then scrapes and caches
    any new historical data for each one.
    """
    # 1. Get the list of symbols to track directly from our new 'etfs' table
    print("Fetching list of ETFs to track from the database...")
    etfs_response = supabase.table('etfs').select('symbol').execute()
    if not etfs_response.data:
        print("No ETFs found in the database. Please populate the 'etfs' table first.")
        return
    
    symbols_to_track = [item['symbol'] for item in etfs_response.data]
    print(f"Found {len(symbols_to_track)} ETFs to process.")

    for symbol in symbols_to_track:
        print(f"--- Processing: {symbol} ---")
        
        # 2. Find the most recent date we have for this symbol in our database
        response = supabase.table('etf_historical_data') \
            .select('date') \
            .eq('symbol', symbol) \
            .order('date', desc=True) \
            .limit(1) \
            .execute()

        latest_date_in_db = None
        if response.data:
            latest_date_in_db = datetime.strptime(response.data[0]['date'], '%Y-%m-%d').date()
            print(f"Latest data in database: {latest_date_in_db}")
            start_date = latest_date_in_db + timedelta(days=1)
        else:
            print("No existing data found. Starting initial scrape from 2020.")
            start_date = datetime.strptime(INITIAL_SCRAPE_START_DATE, '%Y-%m-%d').date()

        # 3. Scrape new data from Yahoo Finance
        today = datetime.now().date()
        if start_date >= today:
            print(f"Data for {symbol} is already up to date. Skipping scrape.")
            continue

        print(f"Scraping new data for {symbol} from {start_date} to {today}...")
        df = yf.download(symbol, start=start_date, end=today, progress=False, auto_adjust=True)

        if df.empty:
            print(f"No new data found from Yahoo Finance for {symbol}.")
            continue

        # 4. Prepare and insert the new records into Supabase
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
                # Use upsert to handle any potential conflicts gracefully, though the date logic should prevent them.
                _, count = supabase.table('etf_historical_data').upsert(records_to_insert).execute()
                print(f"Successfully inserted/updated records for {symbol}.")
            except Exception as e:
                print(f"An error occurred during insert for {symbol}: {e}")

    print("\n--- Scraping process complete. ---")

if __name__ == "__main__":
    run_scraper()
