import { useState } from 'react';
import { LandingPage } from './components/LandingPage.tsx';
import { Onboarding, UserData } from './components/Onboarding.tsx';
import { Dashboard } from './components/Dashboard.tsx';

type AppState = 'landing' | 'onboarding' | 'dashboard';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleGetStarted = () => {
    setCurrentState('onboarding');
  };

  const handleOnboardingComplete = (data: UserData) => {
    setUserData(data);
    setCurrentState('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentState('landing');
    setUserData(null);
  };

  const handleBackToOnboarding = () => {
    setCurrentState('onboarding');
  };

  switch (currentState) {
    case 'landing':
      return <LandingPage onGetStarted={handleGetStarted} />;
    
    case 'onboarding':
      return (
        <Onboarding 
          onComplete={handleOnboardingComplete}
          onBack={handleBackToLanding}
        />
      );
    
    case 'dashboard':
      return userData ? (
        <Dashboard 
          userData={userData}
          onBack={handleBackToOnboarding}
        />
      ) : null;
    
    default:
      return <LandingPage onGetStarted={handleGetStarted} />;
  }
}