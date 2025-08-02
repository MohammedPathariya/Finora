# backend/services/av_client.py

import os
from dotenv import load_dotenv, find_dotenv

# this will walk up from this file and load the first .env it finds
load_dotenv(find_dotenv())

API_KEY  = os.getenv("ALPHA_VANTAGE_KEY")
BASE_URL = "https://www.alphavantage.co/query"

if not API_KEY:
    raise RuntimeError("⚠️  ALPHA_VANTAGE_KEY not found in environment")