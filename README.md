How Finora Works: The End-to-End Flow
The application's workflow is a seamless integration of its frontend, backend, and data pipeline.

Offline Data Caching: The entire process begins with an offline script (populate_historical_data.py). This script runs independently to fetch historical stock data from Yahoo Finance and populates a Supabase database. This ensures the live application always queries a fast, reliable data cache instead of slow external APIs.

User Onboarding: A new user starts on the LandingPage and proceeds to the multi-step Onboarding form. The React frontend captures their profile (age, income, risk tolerance, etc.), performs client-side validation, and sends the completed profile to the /onboard endpoint on the Flask backend, which saves it to the database.

Generating the Personalized Plan: This is the core of the application.

After onboarding, the user is directed to the Dashboard. The dashboard component immediately sends the user's profile to the backend's /api/recommend endpoint.

The backend's recommendation_service kicks in, calculating a nuanced risk score, generating a dynamic asset allocation, and selecting the best-performing ETF for each category based on real data from the Supabase cache.

The projection_service then takes this newly created portfolio and runs a Monte Carlo simulation to forecast its long-term growth under conservative, expected, and optimistic scenarios.

Crucially, the backend returns the full recommendation, projections, and historical chart data in a single, efficient API response.

Displaying the Plan: The React frontend receives this rich data object and renders the Dashboard. The user can explore their personalized allocation, view 1-year performance charts for each ETF (powered by Recharts), and see their long-term growth projections.

Exploring and Interacting: From the global header, the user can navigate to:

Market Data Page: This page hits the /api/etfs/market-data endpoint to display a searchable and sortable table of all ETFs tracked by the system.

Chat with AI: This page uses the /chat endpoint to send user questions directly to an LLM (GPT-4o-mini) and displays the formatted response.