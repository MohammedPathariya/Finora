import { useState, useEffect } from "react";
import { Button } from "./ui/button.tsx";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "./ui/table.tsx";
import './Dashboard.css'; // Reuse dashboard styles for consistency
import './MarketDataPage.css'; // Add our specific styles

interface MarketDataPageProps {
  onBack: () => void;
}

interface ETFData {
  symbol: string;
  name: string;
  price: number;
  ytd_return: number;
  expense_ratio: number;
}

// Mock function to simulate fetching data from an API
const fetchTopETFs = async (): Promise<ETFData[]> => {
  console.log("Fetching mock ETF data...");
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // In a real app, this would be an actual API call.
  // For now, we return hardcoded data.
  return [
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', price: 485.60, ytd_return: 15.2, expense_ratio: 0.03 },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', price: 252.18, ytd_return: 14.8, expense_ratio: 0.03 },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 450.79, ytd_return: 20.5, expense_ratio: 0.20 },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', price: 528.15, ytd_return: 15.1, expense_ratio: 0.09 },
    { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', price: 530.25, ytd_return: 15.3, expense_ratio: 0.03 },
    { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', price: 97.45, ytd_return: -1.2, expense_ratio: 0.03 },
  ];
};

export function MarketDataPage({ onBack }: MarketDataPageProps) {
  const [etfs, setEtfs] = useState<ETFData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTopETFs();
        setEtfs(data);
      } catch (err) {
        setError("Failed to load market data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []); // The empty array [] means this effect runs once when the component mounts

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-container">Loading Market Data...</div>;
    }

    if (error) {
      return <div className="error-container">{error}</div>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Name</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Price</TableHead>
            <TableHead style={{ textAlign: 'right' }}>YTD Return</TableHead>
            <TableHead style={{ textAlign: 'right' }}>Expense Ratio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {etfs.map((etf) => (
            <TableRow key={etf.symbol}>
              <TableCell style={{ fontWeight: 500 }}>{etf.symbol}</TableCell>
              <TableCell>{etf.name}</TableCell>
              <TableCell style={{ textAlign: 'right' }}>${etf.price.toFixed(2)}</TableCell>
              <TableCell 
                className={etf.ytd_return >= 0 ? 'positive-return' : 'negative-return'}
                style={{ textAlign: 'right' }}
              >
                {etf.ytd_return.toFixed(2)}%
              </TableCell>
              <TableCell style={{ textAlign: 'right' }}>{etf.expense_ratio.toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="container header-content">
          <div className="header-left">
            <Button variant="ghost" onClick={onBack}>
              ← Back to Home
            </Button>
            <div className="logo">
               <img src="/logo10.png" alt="Finora Logo" style={{ height: '36px' }} />
            </div>
          </div>
        </div>
      </header>
      <div className="container dashboard-body">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Top US ETFs
          </h1>
          <p className="welcome-subtitle">
            A snapshot of leading Exchange-Traded Funds in the US market.
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}