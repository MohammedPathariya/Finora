import { useState, useEffect, useMemo } from "react";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "./ui/table.tsx";
import './Dashboard.css';
import './MarketDataPage.css';

interface MarketDataPageProps {
  onBack: () => void;
}

interface ETFData {
  symbol: string;
  name: string;
  price: number;
  ytd_return: number;
  expense_ratio: number;
  one_year_return: number;
  volatility: number;
  sharpe_ratio: number;
}

const fetchTopETFs = async (): Promise<ETFData[]> => {
  console.log("Fetching real ETF data from backend...");
  const response = await fetch('http://127.0.0.1:5000/api/etfs/market-data');
  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error || 'Failed to fetch data from the backend.');
  }
  return await response.json();
};

export function MarketDataPage({ onBack }: MarketDataPageProps) {
  const [etfs, setEtfs] = useState<ETFData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NEW: State for interactivity ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof ETFData; direction: 'ascending' | 'descending' } | null>({
    key: 'symbol',
    direction: 'ascending',
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTopETFs();
        setEtfs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- NEW: Logic to filter and sort the data ---
  const filteredAndSortedEtfs = useMemo(() => {
    let sortableEtfs = [...etfs];

    // 1. Filtering Logic
    if (searchTerm) {
      sortableEtfs = sortableEtfs.filter(etf =>
        etf.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etf.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Sorting Logic
    if (sortConfig !== null) {
      sortableEtfs.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableEtfs;
  }, [etfs, searchTerm, sortConfig]);
  
  // --- NEW: Function to handle clicking on headers ---
  const requestSort = (key: keyof ETFData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof ETFData) => {
      if (!sortConfig || sortConfig.key !== key) return null;
      return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading-container">Analyzing Historical Data...</div>;
    }
    if (error) {
      return <div className="error-container">{error}</div>;
    }
    return (
      <>
        {/* --- NEW: Search Bar --- */}
        <div className="toolbar-container">
            <Input 
                type="text"
                placeholder="Search by symbol or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: '400px' }}
            />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              {/* --- MODIFIED: Headers are now clickable buttons with tooltips --- */}
              <TableHead>
                <button onClick={() => requestSort('symbol')} className="sortable-header" title="The stock market symbol for the ETF">
                  Symbol <span className="sort-indicator">{getSortIndicator('symbol')}</span>
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => requestSort('name')} className="sortable-header" title="The full name of the Exchange-Traded Fund">
                  Name <span className="sort-indicator">{getSortIndicator('name')}</span>
                </button>
              </TableHead>
              <TableHead style={{ textAlign: 'right' }}>
                <button onClick={() => requestSort('price')} className="sortable-header" title="The most recent trading price">
                  Price <span className="sort-indicator">{getSortIndicator('price')}</span>
                </button>
              </TableHead>
              <TableHead style={{ textAlign: 'right' }}>
                <button onClick={() => requestSort('ytd_return')} className="sortable-header" title="The investment return from the start of the current year to today">
                  YTD % <span className="sort-indicator">{getSortIndicator('ytd_return')}</span>
                </button>
              </TableHead>
              <TableHead style={{ textAlign: 'right' }}>
                <button onClick={() => requestSort('one_year_return')} className="sortable-header" title="The total investment return over the last 365 days">
                  1-Yr Return % <span className="sort-indicator">{getSortIndicator('one_year_return')}</span>
                </button>
              </TableHead>
              <TableHead style={{ textAlign: 'right' }}>
                <button onClick={() => requestSort('volatility')} className="sortable-header" title="A measure of risk; how much the daily price swings. Higher is riskier.">
                  Volatility % <span className="sort-indicator">{getSortIndicator('volatility')}</span>
                </button>
              </TableHead>
              <TableHead style={{ textAlign: 'right' }}>
                <button onClick={() => requestSort('sharpe_ratio')} className="sortable-header" title="Measures return compared to risk. A higher number (e.g., >1) is generally better.">
                  Sharpe Ratio <span className="sort-indicator">{getSortIndicator('sharpe_ratio')}</span>
                </button>
              </TableHead>
              <TableHead style={{ textAlign: 'right' }}>
                <button onClick={() => requestSort('expense_ratio')} className="sortable-header" title="The annual fee charged by the fund, expressed as a percentage.">
                  Expense Ratio % <span className="sort-indicator">{getSortIndicator('expense_ratio')}</span>
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* --- MODIFIED: Map over the new filteredAndSortedEtfs array --- */}
            {filteredAndSortedEtfs.map((etf) => (
              <TableRow key={etf.symbol}>
                <TableCell style={{ fontWeight: 500 }}>{etf.symbol}</TableCell>
                <TableCell>{etf.name}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>${etf.price.toFixed(2)}</TableCell>
                <TableCell className={etf.ytd_return >= 0 ? 'positive-return' : 'negative-return'} style={{ textAlign: 'right' }}>
                  {etf.ytd_return.toFixed(2)}%
                </TableCell>
                <TableCell className={etf.one_year_return >= 0 ? 'positive-return' : 'negative-return'} style={{ textAlign: 'right' }}>
                  {etf.one_year_return.toFixed(2)}%
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>{etf.volatility.toFixed(2)}%</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{etf.sharpe_ratio.toFixed(2)}</TableCell>
                <TableCell style={{ textAlign: 'right' }}>{etf.expense_ratio.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
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
               <img src="/logo.png" alt="Finora Logo" style={{ height: '36px' }} />
            </div>
          </div>
        </div>
      </header>
      <div className="container dashboard-body">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Live US ETF Market Data
          </h1>
          <p className="welcome-subtitle">
            Key metrics calculated from historical and live market data.
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}