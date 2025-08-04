import { useState } from "react";
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
  Lightbulb
} from "lucide-react";
import { UserData } from "./Onboarding.tsx";
import './Dashboard.css';

interface DashboardProps {
  userData: UserData;
  onBack: () => void;
  onGoHome: () => void;
}

interface ETFRecommendation {
  symbol: string;
  name: string;
  allocation: number;
  expense_ratio: number;
  description: string;
  category: string;
  risk_level: 'Low' | 'Medium' | 'High';
  why_recommended: string;
}

interface PortfolioProjection {
  year: number;
  conservative: number;
  expected: number;
  optimistic: number;
}

export function Dashboard({ userData, onBack, onGoHome }: DashboardProps) {
  const [activeView, setActiveView] = useState("overview");

  // Get the user's first name from the full name
  const firstName = userData.name.split(' ')[0];

  // Mock data - in a real app, this would come from your backend/API
  const generateRecommendations = (): ETFRecommendation[] => {
    const riskLevel = userData.riskTolerance;
    
    if (riskLevel === 'conservative') {
      return [
        {
          symbol: "BND",
          name: "Vanguard Total Bond Market ETF",
          allocation: 40,
          expense_ratio: 0.03,
          description: "Broad exposure to U.S. investment-grade bonds",
          category: "Bonds",
          risk_level: "Low",
          why_recommended: "Provides stability and steady income for conservative investors"
        },
        {
          symbol: "VTI",
          name: "Vanguard Total Stock Market ETF",
          allocation: 35,
          expense_ratio: 0.03,
          description: "Complete exposure to the U.S. stock market",
          category: "U.S. Stocks",
          risk_level: "Medium",
          why_recommended: "Diversified U.S. equity exposure with low fees"
        },
        {
          symbol: "VXUS",
          name: "Vanguard Total International Stock ETF",
          allocation: 15,
          expense_ratio: 0.08,
          description: "International stock market diversification",
          category: "International Stocks",
          risk_level: "Medium",
          why_recommended: "Geographic diversification to reduce concentration risk"
        },
        {
          symbol: "VNQ",
          name: "Vanguard Real Estate ETF",
          allocation: 10,
          expense_ratio: 0.12,
          description: "Real estate investment trusts (REITs)",
          category: "Real Estate",
          risk_level: "Medium",
          why_recommended: "Inflation hedge and portfolio diversification"
        }
      ];
    } else if (riskLevel === 'moderate') {
      return [
        {
          symbol: "VTI",
          name: "Vanguard Total Stock Market ETF",
          allocation: 50,
          expense_ratio: 0.03,
          description: "Complete exposure to the U.S. stock market",
          category: "U.S. Stocks",
          risk_level: "Medium",
          why_recommended: "Core holding for long-term growth with broad diversification"
        },
        {
          symbol: "VXUS",
          name: "Vanguard Total International Stock ETF",
          allocation: 25,
          expense_ratio: 0.08,
          description: "International stock market diversification",
          category: "International Stocks",
          risk_level: "Medium",
          why_recommended: "International diversification for global exposure"
        },
        {
          symbol: "BND",
          name: "Vanguard Total Bond Market ETF",
          allocation: 20,
          expense_ratio: 0.03,
          description: "Broad exposure to U.S. investment-grade bonds",
          category: "Bonds",
          risk_level: "Low",
          why_recommended: "Provides stability and reduces overall portfolio volatility"
        },
        {
          symbol: "VNQ",
          name: "Vanguard Real Estate ETF",
          allocation: 5,
          expense_ratio: 0.12,
          description: "Real estate investment trusts (REITs)",
          category: "Real Estate",
          risk_level: "Medium",
          why_recommended: "Inflation protection and additional diversification"
        }
      ];
    } else { // aggressive
      return [
        {
          symbol: "VTI",
          name: "Vanguard Total Stock Market ETF",
          allocation: 60,
          expense_ratio: 0.03,
          description: "Complete exposure to the U.S. stock market",
          category: "U.S. Stocks",
          risk_level: "Medium",
          why_recommended: "Maximum growth potential with broad market exposure"
        },
        {
          symbol: "VXUS",
          name: "Vanguard Total International Stock ETF",
          allocation: 30,
          expense_ratio: 0.08,
          description: "International stock market diversification",
          category: "International Stocks",
          risk_level: "Medium",
          why_recommended: "Global growth opportunities and diversification"
        },
        {
          symbol: "VGT",
          name: "Vanguard Information Technology ETF",
          allocation: 10,
          expense_ratio: 0.10,
          description: "Technology sector focused growth",
          category: "Technology",
          risk_level: "High",
          why_recommended: "High growth potential from technology innovation"
        }
      ];
    }
  };

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

  const recommendations = generateRecommendations();
  const projections = generateProjections();
  const riskScore = userData.riskTolerance === 'conservative' ? 3 : userData.riskTolerance === 'moderate' ? 6 : 9;

  const getRiskBadgeClass = (riskLevel: ETFRecommendation['risk_level']) => {
    if (riskLevel === 'Low') return 'risk-badge-low';
    if (riskLevel === 'Medium') return 'risk-badge-medium';
    return 'risk-badge-high';
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container header-content">
          <div className="header-left">
            <div className="logo" onClick={onGoHome} style={{ cursor: 'pointer' }}>
              <img src="/logo10.png" alt="Finora Logo" style={{ height: '42px' }} />
            </div>
            <Button variant="ghost" onClick={onBack}>
              ← Back to Onboarding
            </Button>
          </div>
          <Badge className="status-badge">
            Plan Generated
          </Badge>
        </div>
      </header>

      <div className="container dashboard-body">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">
            {firstName}'s Personalized Investment Plan
          </h1>
          <p className="welcome-subtitle">
            Welcome back! Based on your profile, we've created a customized portfolio to help you reach your financial goals.
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="metrics-grid">
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

        {/* Main Content Tabs */}
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
                  {recommendations.map((etf) => (
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


              <Card>
                <CardHeader>
                  <CardTitle className="card-title-flex">
                    <Lightbulb className="card-title-icon" />
                    <span>Key Insights</span>
                  </CardTitle>
                </CardHeader>
                {/* REPLACE THE CardContent with this new version */}
                <CardContent>
                  <ul className="insights-list">
                    <li className="insight-item dot-blue">
                      <div>
                        <p className="insight-text-title">Diversified Approach</p>
                        <p className="insight-text-desc">Your portfolio spans multiple asset classes to reduce risk</p>
                      </div>
                    </li>
                    <li className="insight-item dot-green">
                      <div>
                        <p className="insight-text-title">Low Cost Strategy</p>
                        <p className="insight-text-desc">Average expense ratio of 0.06% keeps more money working for you</p>
                      </div>
                    </li>
                    <li className="insight-item dot-purple">
                      <div>
                        <p className="insight-text-title">Age-Appropriate Risk</p>
                        <p className="insight-text-desc">Risk level matches your age and investment timeline</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className="portfolio-list">
              {recommendations.map((etf) => (
                <Card key={etf.symbol}>
                  <CardHeader>
                    <div className="etf-card-header">
                      <div>
                        <CardTitle className="etf-card-title">{etf.symbol} - {etf.name}</CardTitle>
                        <CardDescription>{etf.description}</CardDescription>
                      </div>
                      <Badge className={getRiskBadgeClass(etf.risk_level)}>
                        {etf.risk_level} Risk
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="etf-details-grid">
                      <div>
                        <p className="etf-detail-label">Allocation</p>
                        <p className="etf-detail-value etf-detail-value-blue">{etf.allocation}%</p>
                      </div>
                      <div>
                        <p className="etf-detail-label">Expense Ratio</p>
                        <p className="etf-detail-value etf-detail-value-green">{etf.expense_ratio}%</p>
                      </div>
                      <div>
                        <p className="etf-detail-label">Investment Amount</p>
                        <p className="etf-detail-value">${((userData.investmentAmount * etf.allocation) / 100).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="recommendation-box">
                      <h4 className="recommendation-title">
                        <Info className="recommendation-icon" />
                        <span>Why we recommend this ETF</span>
                      </h4>
                      <p className="recommendation-text">{etf.why_recommended}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="projections">
             <Card>
                <CardHeader>
                    <CardTitle>Growth Projections</CardTitle>
                    <CardDescription>
                    Potential portfolio value over time based on different market scenarios
                    </CardDescription>
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
                            <div className="scenario-box scenario-conservative">
                                <p className="scenario-title">Conservative</p>
                                <p>${projection.conservative.toLocaleString()}</p>
                            </div>
                            <div className="scenario-box scenario-expected">
                                <p className="scenario-title">Expected</p>
                                <p>${projection.expected.toLocaleString()}</p>
                            </div>
                            <div className="scenario-box scenario-optimistic">
                                <p className="scenario-title">Optimistic</p>
                                <p>${projection.optimistic.toLocaleString()}</p>
                            </div>
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </CardContent>
                </Card>
          </TabsContent>

          <TabsContent value="education">
             <div className="education-grid">
                <Card style={{ gap: '0.75rem' }}>
                  <CardHeader>
                    <CardTitle>Understanding ETFs</CardTitle>
                  </CardHeader>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <p className="education-text">
                      Exchange-Traded Funds (ETFs) are investment funds that trade on stock exchanges like individual stocks. They offer instant diversification by holding many different stocks or bonds.
                    </p>
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Benefits of ETFs:</h4>
                      <ul className="education-list" style={{ paddingLeft: '20px' }}>
                        <li>Low fees compared to mutual funds</li>
                        <li>Instant diversification</li>
                        <li>Easy to buy and sell</li>
                        <li>Transparent holdings</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Investment Principles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="insights-list">
                      <li className="insight-item dot-blue">
                        <div>
                          <p className="insight-text-title">Diversification</p>
                          <p className="insight-text-desc">Don't put all your eggs in one basket. Spread risk across different investments.</p>
                        </div>
                      </li>
                      <li className="insight-item dot-green">
                        <div>
                          <p className="insight-text-title">Time in Market</p>
                          <p className="insight-text-desc">Focus on time in the market, not timing it. Patient investing yields better results.</p>
                        </div>
                      </li>
                      <li className="insight-item dot-purple">
                        <div>
                          <p className="insight-text-title">Keep Costs Low</p>
                          <p className="insight-text-desc">High fees are a drag on performance. Prioritize low-cost funds to maximize returns.</p>
                        </div>
                      </li>
                      <li className="insight-item dot-orange">
                        <div>
                          <p className="insight-text-title">Invest Consistently</p>
                          <p className="insight-text-desc">Make investing a regular habit. This discipline is the key to long-term growth.</p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
            </div>
          </TabsContent>

        </Tabs>

        {/* Action Section */}
        <Card style={{marginTop: '2rem'}}>
          <CardHeader>
            <CardTitle>Ready to Start Investing?</CardTitle>
            <CardDescription>
              Your personalized plan is ready. Here's how to get started with your investment journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="action-buttons">
              <Button className="action-btn-primary">
                Connect Your Brokerage Account
              </Button>
              <Button variant="outline">
                Download Plan PDF
              </Button>
              <Button variant="outline">
                Schedule a Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}