import React, { useEffect, useState } from 'react';

export function Dashboard() {
  const [etfs, setEtfs] = useState([]);

  useEffect(() => {
    fetch('/etfs')
      .then((res) => res.json())
      .then(setEtfs)
      .catch(console.error);
  }, []);

  return (
    <div className="card">
      <h2>ETF Dashboard</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Price ($)</th>
            <th>YTD Return (%)</th>
            <th>Expense Ratio (%)</th>
          </tr>
        </thead>
        <tbody>
          {etfs.map((e) => (
            <tr key={e.symbol}>
              <td>{e.symbol}</td>
              <td>{e.price.toFixed(2)}</td>
              <td>{e.ytd_return?.toFixed(2) ?? '-'}</td>
              <td>{e.expense_ratio.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
);
}