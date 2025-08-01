// src/App.js
import React, { useState } from "react";
import { OnboardingForm } from "./components/OnboardingForm";
import { Dashboard } from "./components/Dashboard";
import { PortfolioDisplay } from "./components/PortfolioDisplay";
import { ChatInterface } from "./components/ChatInterface";

function App() {
  const [profile, setProfile] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6 font-serif">
      <h1 className="text-3xl text-center font-bold mb-8">Finora</h1>
      {!profile ? (
        <OnboardingForm onComplete={setProfile} />
      ) : (
        <>
          <Dashboard />
          <PortfolioDisplay risk={profile.risk_appetite} amount={profile.monthly_amount} />
          <ChatInterface />
        </>
      )}
    </div>
  );
}

export default App;