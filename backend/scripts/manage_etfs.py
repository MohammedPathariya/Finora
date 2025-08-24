import os
import argparse
from dotenv import load_dotenv
from supabase import create_client, Client

# --- Configuration ---
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Supabase credentials not found in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Service Functions for DB Operations ---

def list_etfs():
    """Prints all ETFs currently in the database."""
    print("Fetching all ETFs from the database...")
    response = supabase.table('etfs').select('symbol, name, expense_ratio').order('symbol').execute()
    if response.data:
        for etf in response.data:
            print(f"- {etf['symbol']:<6} | {etf['name']:<60} | ER: {etf['expense_ratio']}%")
    else:
        print("No ETFs found.")

def add_etf(symbol: str, name: str, expense_ratio: float):
    """Adds a new ETF to the etfs table."""
    print(f"Adding ETF '{symbol}'...")
    try:
        response = supabase.table('etfs').insert({
            'symbol': symbol.upper(),
            'name': name,
            'expense_ratio': expense_ratio
        }).execute()
        if response.data:
            print(f"✅ Successfully added {symbol}.")
    except Exception as e:
        print(f"❌ Error adding {symbol}: {e}")

def remove_etf(symbol: str):
    """Removes an ETF and all its associated historical data."""
    symbol = symbol.upper()
    print(f"Removing ETF '{symbol}' and all its historical data...")
    try:
        # Important: Because of the foreign key, we must delete the historical data first.
        print(f"Deleting historical data for {symbol}...")
        supabase.table('etf_historical_data').delete().eq('symbol', symbol).execute()
        
        print(f"Deleting metadata for {symbol}...")
        response = supabase.table('etfs').delete().eq('symbol', symbol).execute()

        if response.data:
            print(f"✅ Successfully removed {symbol}.")
        else:
            print(f"⚠️  Warning: ETF {symbol} not found in the metadata table.")
            
    except Exception as e:
        print(f"❌ Error removing {symbol}: {e}")

def update_etf(symbol: str, name: str = None, expense_ratio: float = None):
    """Updates the name or expense ratio of an existing ETF."""
    symbol = symbol.upper()
    print(f"Updating ETF '{symbol}'...")
    
    update_data = {}
    if name:
        update_data['name'] = name
    if expense_ratio is not None:
        update_data['expense_ratio'] = expense_ratio
        
    if not update_data:
        print("Nothing to update. Please provide a --name and/or --expense.")
        return
        
    try:
        response = supabase.table('etfs').update(update_data).eq('symbol', symbol).execute()
        if response.data:
            print(f"✅ Successfully updated {symbol}.")
        else:
            print(f"⚠️  Warning: ETF {symbol} not found. No update was made.")
    except Exception as e:
        print(f"❌ Error updating {symbol}: {e}")

# --- Main CLI Logic ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Admin script to manage ETFs in the Supabase database.")
    subparsers = parser.add_subparsers(dest="command", required=True, help="Available commands")

    # `list` command
    parser_list = subparsers.add_parser('list', help='List all ETFs in the database.')

    # `add` command
    parser_add = subparsers.add_parser('add', help='Add a new ETF.')
    parser_add.add_argument('symbol', type=str, help='The stock symbol of the ETF (e.g., VOO).')
    parser_add.add_argument('name', type=str, help='The full name of the ETF (e.g., "Vanguard S&P 500 ETF").')
    parser_add.add_argument('expense_ratio', type=float, help='The expense ratio as a float (e.g., 0.03).')

    # `remove` command
    parser_remove = subparsers.add_parser('remove', help='Remove an ETF and its historical data.')
    parser_remove.add_argument('symbol', type=str, help='The symbol of the ETF to remove.')

    # `update` command
    parser_update = subparsers.add_parser('update', help='Update an existing ETF.')
    parser_update.add_argument('symbol', type=str, help='The symbol of the ETF to update.')
    parser_update.add_argument('--name', type=str, help='The new full name for the ETF.')
    parser_update.add_argument('--expense', type=float, dest='expense_ratio', help='The new expense ratio.')

    args = parser.parse_args()

    # Execute the appropriate function based on the command
    if args.command == 'list':
        list_etfs()
    elif args.command == 'add':
        add_etf(args.symbol, args.name, args.expense_ratio)
    elif args.command == 'remove':
        remove_etf(args.symbol)
    elif args.command == 'update':
        update_etf(args.symbol, args.name, args.expense_ratio)