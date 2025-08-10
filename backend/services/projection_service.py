import numpy as np
from .market_service import get_historical_data_for_period, calculate_volatility, calculate_historical_return

def run_monte_carlo_simulation(portfolio: list, initial_investment: float, years: int = 20, simulations: int = 500):
    """
    Runs a Monte Carlo simulation to project portfolio growth.
    """
    # 1. Calculate the weighted average return and volatility of the entire portfolio
    portfolio_return = 0
    portfolio_volatility = 0
    
    for etf in portfolio:
        symbol = etf['symbol']
        allocation = etf['allocation'] / 100.0
        
        # We use 5 years of data for a stable long-term average
        historical_data = get_historical_data_for_period(symbol, 365 * 5)
        
        # Calculate annualized return and volatility for each ETF
        annual_return = calculate_historical_return(historical_data) / 5 # Average annual return
        volatility = calculate_volatility(historical_data)
        
        portfolio_return += allocation * (annual_return / 100)
        portfolio_volatility += allocation * (volatility / 100)

    # 2. Run the simulations
    final_values = []
    for _ in range(simulations):
        yearly_values = [initial_investment]
        for _ in range(years):
            # Generate a random return based on the portfolio's average return and volatility
            random_return = np.random.normal(portfolio_return, portfolio_volatility)
            next_year_value = yearly_values[-1] * (1 + random_return)
            yearly_values.append(next_year_value)
        final_values.append(yearly_values[-1])

    # 3. Determine the scenarios by picking percentiles from the simulation results
    projections = []
    for year in [5, 10, 15, 20]:
        yearly_outcomes = []
        # This is a simplified approach; a full MC would track each year's distribution
        # For our purpose, we'll project from the final values percentiles
        
        p10 = np.percentile(final_values, 10)
        p50 = np.percentile(final_values, 50)
        p90 = np.percentile(final_values, 90)

        # Project back to the target year based on the final outcome's implied growth rate
        conservative_rate = (p10 / initial_investment) ** (1/years) - 1
        expected_rate = (p50 / initial_investment) ** (1/years) - 1
        optimistic_rate = (p90 / initial_investment) ** (1/years) - 1

        projections.append({
            "year": year,
            "conservative": round(initial_investment * ((1 + conservative_rate) ** year)),
            "expected": round(initial_investment * ((1 + expected_rate) ** year)),
            "optimistic": round(initial_investment * ((1 + optimistic_rate) ** year)),
        })
        
    return projections