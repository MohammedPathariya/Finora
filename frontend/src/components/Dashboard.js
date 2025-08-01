// src/components/Dashboard.js
import React, { useEffect, useState } from "react";

export function Dashboard() {
  const [etfs, setEtfs] = useState([]);

  useEffect(() => {
    fetch("/etfs")
      .then((res) => res.json())
      .then(setEtfs)
      .catch(console.error);
  }, []);

  return (
    <section className="max-w-3xl mx-auto mt-8 font-serif">
      <h2 className="text-2xl mb-4 text-gray-800">ETF Dashboard</h2>
      <div className="overflow-x-auto">
        <table className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left text-gray-600">Symbol</th>
              <th className="p-3 text-right text-gray-600">Price ($)</th>
              <th className="p-3 text-right text-gray-600">YTD Return (%)</th>
              <th className="p-3 text-right text-gray-600">Expense Ratio (%)</th>
            </tr>
          </thead>
          <tbody>
            {etfs.map((e) => (
              <tr key={e.symbol} className="border-t border-gray-100">
                <td className="p-3 text-gray-800">{e.symbol}</td>
                <td className="p-3 text-right text-gray-800">{e.price.toFixed(2)}</td>
                <td className="p-3 text-right text-gray-800">{e.ytd_return?.toFixed(2) ?? "-"}</td>
                <td className="p-3 text-right text-gray-800">{e.expense_ratio.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
}