import React from 'react';
import './HomePage.css';

export default function HomePage() {
  return (
    <main className="home-container">
      <h1 className="home-title">Finora</h1>
      <p className="home-subtitle">
        Your AI-powered financial advisor for personalized ETF portfolios.
      </p>

      <section className="home-section">
        <h2>What We Do</h2>
        <ul>
          <li><strong>Onboarding:</strong> Build your risk profile in seconds.</li>
          <li><strong>Portfolio Recommend:</strong> Get a tailored ETF allocation.</li>
          <li><strong>Live Chat:</strong> Ask questions and get instant advice.</li>
        </ul>
      </section>

      <section className="home-section">
        <h2>How It Works</h2>
        <ol>
          <li>Tell us a bit about your goals and risk appetite.</li>
          <li>We allocate across assets like VTI, QQQ, BND based on your profile.</li>
          <li>Track prices in real time, see share counts, and chat with our LLM.</li>
        </ol>
      </section>

      <footer className="home-footer">
        <p>🚀 Built with Flask & OpenAI • © {new Date().getFullYear()} Finora</p>
      </footer>
    </main>
  );
}