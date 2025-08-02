import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DashboardPage.css';

export default function DashboardPage() {
  const [etfs, setEtfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/etfs')
      .then(res => {
        setEtfs(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center">Loading…</p>;
  if (error)   return <p className="text-center">Error: {error}</p>;

  return (
    <div className="dashboard-container">
      <h1 className="h1 text-center mb-md">Top US ETFs</h1>
      <table className="etf-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Price</th>
            <th>YTD Return</th>
            <th>Expense Ratio</th>
          </tr>
        </thead>
        <tbody>
          {etfs.map(e => (
            <tr key={e.ticker}>
              <td>{e.ticker}</td>
              <td>${e.current_price.toFixed(2)}</td>
              <td>{(e.ytd_return * 100).toFixed(2)}%</td>
              <td>{(e.expense_ratio * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
