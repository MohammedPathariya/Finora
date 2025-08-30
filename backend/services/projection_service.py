# backend/services/projection_service.py

"""
Service for Projecting Long-Term Portfolio Growth via Monte Carlo Simulation.

This module provides the functionality to simulate the potential future value of a
given investment portfolio. A Monte Carlo simulation is a computational model that
relies on repeated random sampling to model the probability of different outcomes.
In this context, it simulates thousands of possible economic futures to provide a
probabilistic forecast of investment returns, rather than a single deterministic one.
"""

import numpy as np
from .market_service import get_historical_data_for_period, calculate_volatility, calculate_historical_return

def run_monte_carlo_simulation(portfolio: list, initial_investment: float, years: int = 20, simulations: int = 500):
    """
    Runs a Monte Carlo simulation to project the growth of a given portfolio.

    The simulation follows three main steps:
    1.  Calculates the weighted average annual return and volatility for the entire
        portfolio based on 5 years of historical data for its constituent ETFs.
    2.  Runs thousands of simulations, each projecting the portfolio's value over a
        set number of years. Each year's return is a random variable drawn from a
        normal distribution defined by the portfolio's average return and volatility.
    3.  Analyzes the distribution of final outcomes to determine conservative (10th
        percentile), expected (50th percentile), and optimistic (90th percentile)
        scenarios for specific time horizons.

    Note:
        The projection for intermediate years (5, 10, 15) is a simplified
        approximation. It derives an implied compound annual growth rate (CAGR)
        from the final 20-year outcomes and applies that rate back to the
        intermediate years.

    Args:
        portfolio (list): The list of recommended ETF objects.
        initial_investment (float): The starting value of the investment.
        years (int, optional): The total number of years to simulate. Defaults to 20.
        simulations (int, optional): The number of simulation runs. Defaults to 500.

    Returns:
        list: A list of dictionaries, each representing a projection for a specific year.
              Example:
              [
                  {
                      "year": 5,
                      "conservative": 12000,
                      "expected": 15000,
                      "optimistic": 18000
                  },
                  ...
              ]
    """
    # 1. Calculate the weighted average return and volatility of the entire portfolio.
    # This creates a single statistical profile for the user's diversified portfolio.
    portfolio_return = 0
    portfolio_volatility = 0
    
    for etf in portfolio:
        symbol = etf['symbol']
        allocation = etf['allocation'] / 100.0
        
        # We use 5 years of historical data to establish a stable, long-term
        # average for return and volatility, making the simulation less sensitive
        # to short-term market anomalies.
        historical_data = get_historical_data_for_period(symbol, 365 * 5)
        
        # Calculate annualized return and volatility for each individual ETF.
        # The historical return is divided by 5 to get the average annual return.
        annual_return = calculate_historical_return(historical_data) / 5
        volatility = calculate_volatility(historical_data)
        
        # Add the ETF's contribution to the portfolio's overall metrics, weighted by its allocation.
        portfolio_return += allocation * (annual_return / 100)
        portfolio_volatility += allocation * (volatility / 100)

    # 2. Run the simulations. Each simulation represents one possible future.
    final_values = []
    for _ in range(simulations):
        yearly_values = [initial_investment]
        for _ in range(years):
            # For each year, simulate a return by drawing a random sample from a normal
            # distribution (a bell curve) defined by the portfolio's mean return and volatility.
            random_return = np.random.normal(portfolio_return, portfolio_volatility)
            next_year_value = yearly_values[-1] * (1 + random_return)
            yearly_values.append(next_year_value)
        # We only store the final value at the end of the simulation period.
        final_values.append(yearly_values[-1])

    # 3. Determine the scenarios by analyzing the distribution of the final values.
    # A percentile is the value below which a given percentage of observations fall.
    # e.g., the 10th percentile is the outcome that was better than only 10% of all simulations.
    projections = []
    for year in [5, 10, 15, 20]:
        
        p10 = np.percentile(final_values, 10) # Conservative outcome
        p50 = np.percentile(final_values, 50) # Expected outcome (median)
        p90 = np.percentile(final_values, 90) # Optimistic outcome

        # NOTE: This is a simplified approach. We calculate the implied Compound Annual
        # Growth Rate (CAGR) for each final percentile outcome over the full period...
        conservative_rate = (p10 / initial_investment) ** (1/years) - 1
        expected_rate = (p50 / initial_investment) ** (1/years) - 1
        optimistic_rate = (p90 / initial_investment) ** (1/years) - 1

        # ...and then use that consistent rate to project the value at intermediate years.
        projections.append({
            "year": year,
            "conservative": round(initial_investment * ((1 + conservative_rate) ** year)),
            "expected": round(initial_investment * ((1 + expected_rate) ** year)),
            "optimistic": round(initial_investment * ((1 + optimistic_rate) ** year)),
        })
        
    return projections