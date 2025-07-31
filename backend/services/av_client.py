import os
from dotenv import load_dotenv

load_dotenv()
API_KEY    = os.getenv("ALPHA_VANTAGE_KEY")
BASE_URL   = "https://www.alphavantage.co/query"