// src/components/PortfolioDisplay.js
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Tooltip, Legend } from "recharts";

export function PortfolioDisplay({ risk, amount }) {
  const [alloc, setAlloc] = useState(null);

  useEffect(() => {
    fetch("/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ risk_level: risk, investment_amount: amount }),
    })
      .then((res) => res.json())
      .then((data) => setAlloc(data.allocation))
      .catch(console.error);
  }, [risk, amount]);

  if (!alloc) return <p className="text-center mt-4 font-serif">Loading portfolio...</p>;

  const chartData = Object.entries(alloc).map(([symbol, info]) => ({ name: symbol, value: info.percentage }));

  return (
    <section className="max-w-3xl mx-auto mt-8 font-serif">
      <h2 className="text-2xl mb-4 text-gray-800">Recommended Portfolio</h2>
      <div className="flex flex-col items-center">
        <PieChart width={300} height={300}>
          <Pie dataKey="value" data={chartData} nameKey="name" cx="50%" cy="50%" outerRadius={100} label />
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
        <table className="mt-6 bg-white border border-gray-200 rounded-2xl overflow-hidden w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-gray-600">Ticker</th>
              <th className="p-3 text-right text-gray-600">%</th>
              <th className="p-3 text-right text-gray-600">Amount ($)</th>
              <th className="p-3 text-right text-gray-600">Shares</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(alloc).map(([symbol, info]) => (
              <tr key={symbol} className="border-t border-gray-100">
                <td className="p-3 text-gray-800">{symbol}</td>
                <td className="p-3 text-right text-gray-800">{info.percentage}%</td>
                <td className="p-3 text-right text-gray-800">{info.dollar_amount.toFixed(2)}</td>
                <td className="p-3 text-right text-gray-800">{info.shares.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
}