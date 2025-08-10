import { useState, useEffect } from "react"; // 1. Import useEffect
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { Button } from "./ui/button.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs.tsx";
import { Progress } from "./ui/progress.tsx";
import {
  TrendingUp,
  Shield,
  DollarSign,
  Target,
  PieChart,
  Info,
  Lightbulb,
  MessageSquare
} from "lucide-react";
import { UserData } from "./Onboarding.tsx";
import './Dashboard.css';

// --- 2. Define TypeScript interfaces to match the new API response ---
interface RecommendedETF {
  symbol: string;
  name: string;
  category: string;
  allocation: number;
  investment_amount: number;
}

interface PortfolioResponse {
  risk_tolerance: string;
  recommended_portfolio: RecommendedETF[];
}
// --- End of new interfaces ---

interface DashboardProps {
  userData: UserData;
  onBack: () => void;
  onGoHome: () => void;
  onNavigateToMarket: () => void;
  onNavigateToChat: () => void;
}

// Projections are still mocked for now, as they have their own logic
interface PortfolioProjection {
  year: number;
  conservative: number;
  expected: number;
  optimistic: number;
}

export function Dashboard({ userData, onBack, onGoHome, onNavigateToMarket, onNavigateToChat }: DashboardProps) {
  const [activeView, setActiveView] = useState("overview");
  const firstName = userData.name.split(' ')[0];

  // --- 3. Add state for loading, error, and the fetched portfolio ---
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 4. Use useEffect to fetch the real recommendation from the backend ---
  useEffect(() => {
    const fetchRecommendation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('http://127.0.0.1:5000/api/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            risk_tolerance: userData.riskTolerance,
            investment_amount: userData.investmentAmount
          }),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to fetch recommendation.");
        }
        const data: PortfolioResponse = await response.json();
        setPortfolio(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendation();
  }, [userData.riskTolerance, userData.investmentAmount]); // Re-fetch if key user data changes

  // --- 5. DELETE the old mock generateRecommendations function ---
  // The generateRecommendations function has been removed.

  // The generateProjections function is kept for now as its logic is separate.
  const generateProjections = (): PortfolioProjection[] => {
    const baseAmount = userData.investmentAmount;
    const projections: PortfolioProjection[] = [];
    const rates = userData.riskTolerance === 'conservative' 
      ? { conservative: 0.04, expected: 0.06, optimistic: 0.08 }
      : userData.riskTolerance === 'moderate'
      ? { conservative: 0.05, expected: 0.07, optimistic: 0.10 }
      : { conservative: 0.06, expected: 0.09, optimistic: 0.12 };
    for (let year = 1; year <= 20; year++) {
      projections.push({
        year,
        conservative: Math.round(baseAmount * Math.pow(1 + rates.conservative, year)),
        expected: Math.round(baseAmount * Math.pow(1 + rates.expected, year)),
        optimistic: Math.round(baseAmount * Math.pow(1 + rates.optimistic, year))
      });
    }
    return projections;
  };

  const projections = generateProjections();
  const riskScore = userData.riskTolerance === 'conservative' ? 3 : userData.riskTolerance === 'moderate' ? 6 : 9;

  // --- 6. Add conditional rendering for loading and error states ---
  if (isLoading) {
    return <div className="loading-container">Generating Your Personalized Plan...</div>;
  }

  if (error || !portfolio) {
    return <div className="error-container">Error: {error || "Could not load portfolio."}</div>;
  }
  
  // --- The main return block now uses the 'portfolio' state object ---
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="container header-content">
          <div className="header-left">
            <div className="logo" onClick={onGoHome} style={{ cursor: 'pointer' }}>
              <img src="/logo.png" alt="Finora Logo" style={{ height: '36px' }} />
            </div>
            <Button variant="ghost" onClick={onBack}>
              ← Back to Onboarding
            </Button>
            <Button variant="ghost" onClick={onNavigateToMarket}>
              Market Data
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button variant="outline" onClick={onNavigateToChat}>
                <MessageSquare style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                Chat with AI
            </Button>
            <Badge className="status-badge">
              Plan Generated
            </Badge>
          </div>
        </div>
      </header>

      <div className="container dashboard-body">
        <div className="welcome-section">
          <h1 className="welcome-title">{firstName}'s Personalized Investment Plan</h1>
          <p className="welcome-subtitle">Welcome back! Based on your profile, we've created a customized portfolio to help you reach your financial goals.</p>
        </div>

        <div className="metrics-grid">
          {/* ... The metric cards are unchanged and still work correctly ... */}
          <Card>
            <CardHeader className="metric-card-header">
              <CardTitle className="metric-card-title">Investment Amount</CardTitle>
              <DollarSign className="metric-card-icon" />
            </CardHeader>
            <CardContent>
              <div className="metric-card-value">${userData.investmentAmount.toLocaleString()}</div>
              <p className="metric-card-subtext">Initial investment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="metric-card-header">
              <CardTitle className="metric-card-title">Risk Level</CardTitle>
              <Shield className="metric-card-icon" />
            </CardHeader>
            <CardContent>
              <div className="metric-card-value">{riskScore}/10</div>
              <p className="metric-card-subtext">{userData.riskTolerance}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="metric-card-header">
              <CardTitle className="metric-card-title">Time Horizon</CardTitle>
              <Target className="metric-card-icon" />
            </CardHeader>
            <CardContent>
              <div className="metric-card-value">
                {userData.timeHorizon === 'short' ? '1-3' : userData.timeHorizon === 'medium' ? '3-10' : '10+'} yrs
              </div>
              <p className="metric-card-subtext">Investment timeline</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="metric-card-header">
              <CardTitle className="metric-card-title">Expected Annual Return</CardTitle>
              <TrendingUp className="metric-card-icon" />
            </CardHeader>
            <CardContent>
              <div className="metric-card-value">
                {userData.riskTolerance === 'conservative' ? '6%' : userData.riskTolerance === 'moderate' ? '7%' : '9%'}
              </div>
              <p className="metric-card-subtext">Projected return</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeView} onValueChange={setActiveView} className="tabs-container">
          <TabsList className="tabs-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="projections">Projections</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="overview-grid">
              <Card>
                <CardHeader>
                  <CardTitle className="card-title-flex">
                    <PieChart className="card-title-icon" />
                    <span>Portfolio Allocation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {/* 7. Update JSX to use the new 'portfolio' state object */}
                  {portfolio.recommended_portfolio.map((etf) => (
                    <div key={etf.symbol} className="allocation-item">
                      <div className="allocation-labels">
                        <span className="allocation-category">{etf.category}</span>
                        <span className="allocation-percentage">{etf.allocation}%</span>
                      </div>
                      <Progress value={etf.allocation} className="allocation-progress" />
                    </div>
                  ))}
                </CardContent>
              </Card>
              {/* Key Insights card is unchanged */}
              <Card>
                <CardHeader>
                  <CardTitle className="card-title-flex">
                    <Lightbulb className="card-title-icon" />
                    <span>Key Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="insights-list">
                    <li className="insight-item dot-blue"><div><p className="insight-text-title">Data-Driven</p><p className="insight-text-desc">This portfolio is generated based on historical data analysis.</p></div></li>
                    <li className="insight-item dot-green"><div><p className="insight-text-title">Personalized</p><p className="insight-text-desc">The asset mix is tailored to your specific risk tolerance.</p></div></li>
                    <li className="insight-item dot-purple"><div><p className="insight-text-title">Diversified</p><p className="insight-text-desc">Your investment is spread across different asset classes to manage risk.</p></div></li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="portfolio-list">
              {/* 7. Update JSX to use the new 'portfolio' state object */}
              {portfolio.recommended_portfolio.map((etf) => (
                <Card key={etf.symbol}>
                  <CardHeader>
                    <CardTitle className="etf-card-title">{etf.symbol} - {etf.name}</CardTitle>
                    <CardDescription>{etf.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="etf-details-grid">
                      <div>
                        <p className="etf-detail-label">Allocation</p>
                        <p className="etf-detail-value etf-detail-value-blue">{etf.allocation}%</p>
                      </div>
                      <div>
                        <p className="etf-detail-label">Investment Amount</p>
                        <p className="etf-detail-value">${etf.investment_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="projections">
             {/* Projections tab is unchanged and still uses its mock data */}
             <Card>
                <CardHeader>
                    <CardTitle>Growth Projections</CardTitle>
                    <CardDescription>Potential portfolio value over time based on different market scenarios</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="projections-list">
                    {[5, 10, 15, 20].map((year) => {
                        const projection = projections.find(p => p.year === year);
                        if (!projection) return null;
                        return (
                        <div key={year} className="projection-item">
                            <div className="projection-header">
                            <span className="projection-year">Year {year}</span>
                            <span className="projection-expected">Expected: ${projection.expected.toLocaleString()}</span>
                            </div>
                            <div className="projection-scenarios-grid">
                            <div className="scenario-box scenario-conservative"><p className="scenario-title">Conservative</p><p>${projection.conservative.toLocaleString()}</p></div>
                            <div className="scenario-box scenario-expected"><p className="scenario-title">Expected</p><p>${projection.expected.toLocaleString()}</p></div>
                            <div className="scenario-box scenario-optimistic"><p className="scenario-title">Optimistic</p><p>${projection.optimistic.toLocaleString()}</p></div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </CardContent>
                </Card>
          </TabsContent>

          <TabsContent value="education">
             {/* Education tab is unchanged */}
             <div className="education-grid">
                <Card style={{ gap: '0.75rem' }}><CardHeader><CardTitle>Understanding ETFs</CardTitle></CardHeader><CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}><p className="education-text">Exchange-Traded Funds (ETFs) are investment funds that trade on stock exchanges like individual stocks. They offer instant diversification by holding many different stocks or bonds.</p><div><h4 style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Benefits of ETFs:</h4><ul className="education-list" style={{ paddingLeft: '20px' }}><li>Low fees compared to mutual funds</li><li>Instant diversification</li><li>Easy to buy and sell</li><li>Transparent holdings</li></ul></div></CardContent></Card>
                <Card><CardHeader><CardTitle>Investment Principles</CardTitle></CardHeader><CardContent><ul className="insights-list"><li className="insight-item dot-blue"><div><p className="insight-text-title">Diversification</p><p className="insight-text-desc">Don't put all your eggs in one basket. Spread risk across different investments.</p></div></li><li className="insight-item dot-green"><div><p className="insight-text-title">Time in Market</p><p className="insight-text-desc">Focus on time in the market, not timing it. Patient investing yields better results.</p></div></li><li className="insight-item dot-purple"><div><p className="insight-text-title">Keep Costs Low</p><p className="insight-text-desc">High fees are a drag on performance. Prioritize low-cost funds to maximize returns.</p></div></li><li className="insight-item dot-orange"><div><p className="insight-text-title">Invest Consistently</p><p className="insight-text-desc">Make investing a regular habit. This discipline is the key to long-term growth.</p></div></li></ul></CardContent></Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card style={{marginTop: '2rem'}}>
          <CardHeader><CardTitle>Ready to Start Investing?</CardTitle><CardDescription>Your personalized plan is ready. Here's how to get started with your investment journey.</CardDescription></CardHeader>
          <CardContent><div className="action-buttons"><Button className="action-btn-primary">Connect Your Brokerage Account</Button><Button variant="outline">Download Plan PDF</Button><Button variant="outline">Schedule a Call</Button></div></CardContent>
        </Card>
      </div>
    </div>
  );
}