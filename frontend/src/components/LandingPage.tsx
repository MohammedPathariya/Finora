import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card.tsx";
import { Badge } from "./ui/badge.tsx";
import { TrendingUp, Shield, Brain, BarChart3, Users } from "lucide-react";
import './LandingPage.css';

// The props interface accepts both functions from App.tsx
interface LandingPageProps {
  onGetStarted: () => void;
  onSkipToDashboard: () => void;
  onNavigateToMarket: () => void;
}

export function LandingPage({ onGetStarted, onSkipToDashboard, onNavigateToMarket }: LandingPageProps) {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img src="/logo10.png" alt="Finora Logo" style={{ height: '42px' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button onClick={onNavigateToMarket} variant="ghost">
                Market Data
              </Button>
              {/* Development-only button to skip onboarding */}
              <Button onClick={onSkipToDashboard} variant="outline">
                Dev: Go to Dashboard
              </Button>
              <Button onClick={onGetStarted} className="get-started-btn">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container hero-section">
        <h1 className="hero-title" style={{ lineHeight: 1.2 }}>
          Personalized Wealth Planning, Powered by AI
        </h1>
        <p className="hero-subtitle">
          Your path to clear, confident investing
        </p>
        <p className="hero-description">
          AI-powered guidance, real market data, and personalized financial planning — built for people, not portfolios.
        </p>
        <div className="hero-actions">
          <Button
            onClick={onGetStarted}
            size="lg"
            className="get-started-btn large-btn"
          >
            Start Your Financial Journey
          </Button>
          <Button variant="outline" size="lg" className="large-btn">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container features-section">
        <div className="section-title">
          <h2 className="section-heading">
            Why Choose Finora?
          </h2>
          <p className="section-subheading">
            We make investing accessible for everyone, from first-time investors to experienced professionals.
          </p>
        </div>

        <div className="features-grid">
          <Card className="feature-card">
            <CardHeader style={{textAlign: 'center'}}>
              <div className="feature-icon-wrapper icon-brain">
                <Brain className="feature-icon" />
              </div>
              <CardTitle>AI-Powered Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription style={{textAlign: 'center'}}>
                Get personalized investment recommendations based on your goals, risk tolerance, and financial situation using advanced AI analysis.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="feature-card">
            <CardHeader style={{textAlign: 'center'}}>
              <div className="feature-icon-wrapper icon-chart">
                <BarChart3 className="feature-icon" />
              </div>
              <CardTitle>Real Market Data</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription style={{textAlign: 'center'}}>
                Access live US market data and ETF information to make informed decisions with up-to-date financial insights.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="feature-card">
            <CardHeader style={{textAlign: 'center'}}>
              <div className="feature-icon-wrapper icon-shield">
                <Shield className="feature-icon" />
              </div>
              <CardTitle>Simple & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription style={{textAlign: 'center'}}>
                Easy-to-understand explanations and secure platform designed for everyday people, not just financial experts.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-title">
            <h2 className="section-heading">
              How Finora Works
            </h2>
            <p className="section-subheading">
              Get started with personalized wealth planning in just a few simple steps.
            </p>
          </div>

          <div className="how-it-works-grid">
            <div className="step">
              <div className="step-icon-wrapper step-icon-1">
                <Users className="step-icon" />
              </div>
              <h3 className="step-title">1. Tell Us About You</h3>
              <p className="step-description">Share your age, income, financial goals, and risk preferences.</p>
            </div>

            <div className="step">
              <div className="step-icon-wrapper step-icon-2">
                <Brain className="step-icon" />
              </div>
              <h3 className="step-title">2. AI Analysis</h3>
              <p className="step-description">Our AI analyzes your profile and market conditions to create your plan.</p>
            </div>

            <div className="step">
              <div className="step-icon-wrapper step-icon-3">
                <BarChart3 className="step-icon" />
              </div>
              <h3 className="step-title">3. Get Your Plan</h3>
              <p className="step-description">Receive personalized ETF recommendations with clear explanations.</p>
            </div>

            <div className="step">
              <div className="step-icon-wrapper step-icon-4">
                <TrendingUp className="step-icon" />
              </div>
              <h3 className="step-title">4. Start Investing</h3>
              <p className="step-description">Follow your plan and track your progress with ongoing guidance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container cta-section">
        <h2 className="section-heading">
          Ready to Start Building Your Wealth?
        </h2>
        <p className="section-subheading" style={{marginBottom: '2rem'}}>
          Join thousands of people who are already using Finora to make smarter investment decisions.
        </p>
        <Button
          onClick={onGetStarted}
          size="lg"
          className="get-started-btn large-btn"
        >
          Get Started for Free
        </Button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-content">
          <div className="footer-logo">
            <div className="footer-logo-icon-wrapper">
              <TrendingUp className="footer-logo-icon" />
            </div>
            <span style={{fontWeight: 600}}>Finora</span>
          </div>
          <p className="footer-text">
            © 2025 Finora. AI-powered wealth planning for everyone.
          </p>
        </div>
      </footer>
    </div>
  );
}