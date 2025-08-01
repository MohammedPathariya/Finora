import React, { useState } from 'react';

export function OnboardingForm({ onComplete }) {
  const [age, setAge] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [investmentGoal, setInvestmentGoal] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [riskAppetite, setRiskAppetite] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      age: parseInt(age, 10),
      income_range: incomeRange,
      investment_goal: investmentGoal,
      monthly_amount: parseFloat(monthlyAmount),
      risk_appetite: riskAppetite,
    };
    try {
      const res = await fetch('/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(`Error: ${data.error || 'Unknown error'}`);
      } else {
        setStatusMessage(`🎉 Profile created! ID: ${data.profile_id}`);
        onComplete({ profile_id: data.profile_id, ...payload });
      }
    } catch (err) {
      setStatusMessage(`Network error: ${err.message}`);
    }
  };

  return (
    <div className="card">
      <h2>User Onboarding</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Age
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </label>
        <label>
          Income Range
          <select
            value={incomeRange}
            onChange={(e) => setIncomeRange(e.target.value)}
            required
          >
            <option value="">Select…</option>
            <option value="<50k">&lt;50k</option>
            <option value="50k-75k">50k–75k</option>
            <option value="75k-100k">75k–100k</option>
            <option value=">100k">&gt;100k</option>
          </select>
        </label>
        <label>
          Investment Goal
          <select
            value={investmentGoal}
            onChange={(e) => setInvestmentGoal(e.target.value)}
            required
          >
            <option value="">Select…</option>
            <option value="retirement">Retirement</option>
            <option value="emergency">Emergency</option>
            <option value="growth">Growth</option>
          </select>
        </label>
        <label>
          Monthly Investment Amount
          <input
            type="number"
            step="0.01"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(e.target.value)}
            required
          />
        </label>
        <label>
          Risk Appetite
          <select
            value={riskAppetite}
            onChange={(e) => setRiskAppetite(e.target.value)}
            required
          >
            <option value="">Select…</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <button type="submit">Create Profile</button>
      </form>
      {statusMessage && <p>{statusMessage}</p>}
    </div>
);
}