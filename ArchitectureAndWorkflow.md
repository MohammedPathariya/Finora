Finora: Technical Architecture & Workflow Deep Dive
This document provides a comprehensive technical overview of the Finora project. It is intended for developers who want to understand the application's architecture, data flow, and the logic behind its core components. While the main README.md provides a general overview and setup instructions, this file explains how everything works together.




1. High-Level Architecture: A Decoupled System
Finora is built as a modern, decoupled full-stack application. This means the frontend (client) and backend (server) are two separate, independent applications that communicate with each other over a network via a JSON API.

Backend (Flask, Python): A powerful Python server responsible for all business logic, data processing, financial calculations, and communication with the database and external AI models. It is the single source of truth for all data and intelligence.

Frontend (React, TypeScript): A modern, responsive single-page application (SPA) that runs in the user's web browser. Its sole responsibility is to present the user interface, capture user input, and communicate with the backend to fetch or submit data.

This decoupled architecture is the industry standard for a reason: it allows for a clean separation of concerns. The backend team can focus on data and logic, while the frontend team can focus on the user experience, and they can be developed and deployed independently.




2. A User's Journey: The End-to-End Data Flow
To understand how the system works, let's trace a complete user journey from landing on the page to receiving a personalized investment plan.

Landing & Onboarding:

Frontend: The user starts at the LandingPage.tsx component. When they click "Get Started," the main App.tsx component changes its internal state to render the Onboarding.tsx component.

The user proceeds through the multi-step form. All data is held in the React component's state.

Connection: On the final step, the frontend makes a POST request to the /onboard endpoint on the backend, sending the user's profile data as a JSON payload.

Backend: The /onboard route in onboarding.py receives the data, validates it, and passes it to the onboarding_service.py to be saved in the Supabase profiles table.

Generating the Plan:

Frontend: After a successful onboarding submission, App.tsx navigates the user to the Dashboard.tsx component.

Connection: The Dashboard.tsx component immediately triggers a useEffect hook, which makes a POST request to the /api/recommend endpoint, sending the user's profile.

Backend: This is the core workflow. The /api/recommend route in recommend.py receives the profile. It then orchestrates calls to two key services:

recommendation_service.py is called to generate the ETF portfolio.

projection_service.py is called with that new portfolio to run the Monte Carlo simulation.

The backend combines both results into a single, large JSON object and sends it back to the frontend.

Displaying the Plan:

Frontend: The Dashboard.tsx component receives the JSON response. It updates its state, which triggers a re-render.

The page now displays the user's risk score, the allocation breakdown, the growth projections, and the interactive charts (using the HistoricalChart.tsx component and the historical data provided in the API response). The user's journey to their personalized plan is complete.





3. Backend Deep Dive: The Brains of the Operation
The backend is structured into distinct layers to ensure modularity and maintainability.

The Data Pipeline: An Offline Caching Strategy
Before the web server even runs, the most important process is the offline data caching, handled by scripts/populate_historical_data.py.

What it does: This script fetches historical price data from an external source (Yahoo Finance) and saves it into our Supabase database.

How it works: It intelligently checks the last date it has data for and only fetches the missing days. This makes it fast and efficient.

Why it's important: This architectural choice is critical. It means our live application does not depend on a slow, external API for its core data. It queries our own fast, reliable database, making the user experience much better and protecting us from external service outages or rate limits.

The Layers of the Web Server
Entry Point (app.py): This is the conductor. It initializes the Flask app, sets up CORS (to allow the frontend to talk to it), and registers all the route "Blueprints." It's the file you run to start the server.

Routes (/routes): This is the API layer, or the "traffic controllers." Each file in this directory defines a set of related API endpoints. Their job is simple:

Define the URL path (e.g., /chat).

Receive the incoming HTTP request.

Validate the request (e.g., make sure the JSON body has the right fields).

Call the appropriate service to do the real work.

Format the service's response as JSON and send it back to the client.
They contain no business logic.

Services (/services): This is the business logic layer—the "brains" of the application.

market_service.py: The gateway to all financial data. It contains functions for querying the database cache and for performing pure financial calculations (e.g., calculate_volatility, calculate_sharpe_ratio).

recommendation_service.py: The core engine. It uses the market_service to get data and then runs the multi-step algorithm to generate a portfolio. This is where the nuanced risk scoring, dynamic allocation, and ETF selection logic lives.

projection_service.py: The forecasting engine. It takes a completed portfolio and runs the complex Monte Carlo simulation to project future growth.

llm_service.py: A dedicated wrapper for the OpenAI API. It handles formatting the prompts and parsing the responses from the AI model.





4. Frontend Deep Dive: The User Experience
The frontend is a modern React application built with TypeScript for type safety and Vite for a fast development experience.

State Management & Navigation
The application uses a simple but effective finite state machine for navigation, managed in App.tsx.

A single state variable, currentState, determines which "page" is shown ('landing', 'onboarding', 'dashboard').

Functions like handleGetStarted are simple state setters that trigger a re-render to the new view.

App.tsx also acts as a "provider" for global data, like the market data fetched for the MarketDataPage.tsx, preventing redundant API calls.

Component Architecture
The component structure is highly organized:

Page Components (e.g., Dashboard.tsx, Onboarding.tsx): These are the main view containers. They are "smart" components that are responsible for their own data fetching and state management.

UI Components (/components/ui): These are "dumb," reusable components that form the design system (e.g., Button.tsx, Card.tsx, Table.tsx). They receive data as props and don't manage their own state. This makes them highly reusable and easy to test. This library is built on top of Radix UI, which provides a powerful, accessible foundation for all interactive elements.





5. Example: A Full API Interaction
Let's trace the /api/recommend call from end to end.

Frontend (Dashboard.tsx): The component makes the API call.

// In Dashboard.tsx
useEffect(() => {
  const fetchDashboardData = async () => {
    const response = await fetch('[http://127.0.0.1:5000/api/recommend](http://127.0.0.1:5000/api/recommend)', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ /* ...userData */ }),
    });
    const data = await response.json();
    setPortfolio(data);
  };
  fetchDashboardData();
}, [userData]);

Backend Route (recommend.py): The route receives the request, validates it, and calls the services.

# In routes/recommend.py
@recommend_bp.route("/api/recommend", methods=["POST"])
def recommend():
    profile_from_request = request.get_json()
    # ... validation ...
    service_profile = { /* ... structured data ... */ }

    # Call the first service
    recommendation = generate_recommendation(service_profile)
    # Call the second service
    projections = run_monte_carlo_simulation(...)

    final_response = {**recommendation, "projections": projections}
    return jsonify(final_response)

Backend Services: The recommendation_service and projection_service perform their complex calculations using data from the market_service.

The Response: The backend sends a single JSON object back.

{
  "nuanced_risk_score": 7.5,
  "recommended_portfolio": [
    { "symbol": "VOO", "allocation": 60, ... },
    { "symbol": "BND", "allocation": 40, ... }
  ],
  "projections": [
    { "year": 5, "expected": 15000, ... },
    ...
  ]
}

Frontend (Dashboard.tsx): The component receives the data and updates its state, causing the UI to render the personalized plan.

// In Dashboard.tsx
const [portfolio, setPortfolio] = useState(null);
// When the API call finishes, setPortfolio(data) is called.
// The component re-renders, and JSX like this now has data:
// <h1>Your Risk Score: {portfolio.nuanced_risk_score}</h1>

This flow demonstrates the clean separation of concerns and the clear, predictable communication between the frontend and backend.