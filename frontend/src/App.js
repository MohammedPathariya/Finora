import React, { useState } from 'react';
import { OnboardingForm } from './components/OnboardingForm';
import { Dashboard } from './components/Dashboard';
import { PortfolioDisplay } from './components/PortfolioDisplay';
import { ChatInterface } from './components/ChatInterface';

function App() {
  const [profile, setProfile] = useState(null);

  return (
    <div className="App">
      <h1>Finora</h1>
      {!profile ? (
        <OnboardingForm onComplete={setProfile} />
      ) : (
        <>
          <Dashboard />
          <PortfolioDisplay
            risk={profile.risk_appetite}
            amount={profile.monthly_amount}
          />
          <ChatInterface />
        </>
      )}
    </div>
  );
}

export default App;