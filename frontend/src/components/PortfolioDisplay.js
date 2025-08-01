import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Tooltip, Legend } from 'recharts';

export function PortfolioDisplay({ risk, amount }) {
  const [alloc, setAlloc] = useState(null);

  useEffect(() => {
    fetch('/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ risk_level: risk, investment_amount: amount }),
    })
      .then((res) => res.json())
      .then((data) => setAlloc(data.allocation))
      .catch(console.error);
  }, [risk, amount]);

  if (!alloc) return <div className="card">Loading portfolio...</div>;

  const chartData = Object.entries(alloc).map(([symbol, info]) => ({
    name: symbol,
    value: info.percentage,
  }));

  return (
    <div className="card">
      <h2>Recommended Portfolio</h2>
      <PieChart width={400} height={300}>
        <Pie
          dataKey="value"
          data={chartData}
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        />
        <Tooltip />
        <Legend />
      </PieChart>
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Allocation %</th>
            <th>Dollar Amount</th>
            <th>Shares</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(alloc).map(([symbol, info]) => (
            <tr key={symbol}>
              <td>{symbol}</td>
              <td>{info.percentage}%</td>
              <td>${info.dollar_amount.toFixed(2)}</td>
              <td>{info.shares.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
);
}