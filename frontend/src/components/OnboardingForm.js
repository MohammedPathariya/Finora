// src/components/OnboardingForm.js
import React, { useState } from "react";

export function OnboardingForm({ onComplete }) {
  const [age, setAge] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [monthlyAmount, setMonthlyAmount] = useState("");
  const [riskAppetite, setRiskAppetite] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

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
      const res = await fetch("/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(`Error: ${data.error || "Unknown error"}`);
      } else {
        setStatusMessage(`🎉 Profile created! ID: ${data.profile_id}`);
        onComplete({ profile_id: data.profile_id, ...payload });
      }
    } catch (err) {
      setStatusMessage(`Network error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 font-serif">
      <h2 className="text-2xl mb-4 text-gray-800">User Onboarding</h2>

      <label className="block mb-3">
        <span className="text-gray-600">Age</span>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </label>

      <label className="block mb-3">
        <span className="text-gray-600">Income Range</span>
        <select
          value={incomeRange}
          onChange={(e) => setIncomeRange(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="" disabled>Select…</option>
          <option value="<50k">&lt;50k</option>
          <option value="50k-75k">50k–75k</option>
          <option value="75k-100k">75k–100k</option>
          <option value=">100k">&gt;100k</option>
        </select>
      </label>

      <label className="block mb-3">
        <span className="text-gray-600">Investment Goal</span>
        <select
          value={investmentGoal}
          onChange={(e) => setInvestmentGoal(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="" disabled>Select…</option>
          <option value="retirement">Retirement</option>
          <option value="emergency">Emergency</option>
          <option value="growth">Growth</option>
        </select>
      </label>

      <label className="block mb-3">
        <span className="text-gray-600">Monthly Investment Amount</span>
        <input
          type="number"
          step="0.01"
          value={monthlyAmount}
          onChange={(e) => setMonthlyAmount(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </label>

      <label className="block mb-5">
        <span className="text-gray-600">Risk Appetite</span>
        <select
          value={riskAppetite}
          onChange={(e) => setRiskAppetite(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-xl p-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="" disabled>Select…</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>

      <button
        type="submit"
        className="w-full bg-emerald-800 hover:bg-emerald-700 text-white py-2 rounded-xl transition"
      >
        Create Profile
      </button>

      {statusMessage && <p className="mt-4 text-center text-gray-700">{statusMessage}</p>}
    </form>
  );
}