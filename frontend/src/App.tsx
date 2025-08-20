import { useState } from 'react';
import { LandingPage } from './components/LandingPage.tsx';
import { Onboarding, UserData } from './components/Onboarding.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { MarketDataPage, ETFData } from './components/MarketDataPage.tsx';
import { ChatPage } from './components/ChatPage.tsx';
import { AppHeader } from './components/AppHeader.tsx';

type AppState = 'landing' | 'onboarding' | 'dashboard' | 'marketData' | 'chat';

export default function App() {
  const [currentState, setCurrentState] = useState<AppState>('landing');
  const [userData, setUserData] = useState<UserData | null>(null);

  const [marketData, setMarketData] = useState<ETFData[]>([]);
  const [isMarketDataLoading, setIsMarketDataLoading] = useState(false);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);

  const fetchMarketData = async () => {
    setIsMarketDataLoading(true);
    setMarketDataError(null);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/etfs/market-data');
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.error || 'Failed to fetch data from the backend.');
      }
      const data = await response.json();
      setMarketData(data);
    } catch (err: any) {
      setMarketDataError(err.message);
    } finally {
      setIsMarketDataLoading(false);
    }
  };
  
  const handleGoToMarketData = () => {
    if (marketData.length === 0 && !marketDataError) {
      fetchMarketData();
    }
    setCurrentState('marketData');
  };

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

  const handleGoToDashboard = () => {
    if (userData) {
      setCurrentState('dashboard');
    } else {
      setCurrentState('onboarding');
    }
  };

  const handleGoToChat = () => {
    setCurrentState('chat');
  };

  // The developer shortcut function is restored here
  const handleSkipToDashboard = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/onboard/1');
      if (!response.ok) {
        throw new Error('Could not fetch profile for user 1. Make sure the user exists in your database.');
      }
      const profileData = await response.json();
      const transformedData: UserData = {
        name: profileData.name,
        age: profileData.age,
        investmentAmount: profileData.investment_amount,
        timeHorizon: profileData.time_horizon,
        riskTolerance: profileData.risk_tolerance,
        investmentGoals: profileData.investment_goals.split(', '),
        experience: profileData.experience,
        income: 50000, 
      };
      setUserData(transformedData);
      setCurrentState('dashboard');
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };
  
  const renderContent = () => {
    switch (currentState) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      
      case 'onboarding':
        return <Onboarding onComplete={handleOnboardingComplete} onBack={handleBackToLanding} />;
      
      case 'dashboard':
        return userData ? <Dashboard userData={userData} /> : <LandingPage onGetStarted={handleGetStarted} />;

      case 'marketData':
        return <MarketDataPage etfs={marketData} isLoading={isMarketDataLoading} error={marketDataError} />;
      
      case 'chat':
        return <ChatPage />;

      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <>
      {currentState !== 'onboarding' && (
        <AppHeader
          variant={!userData ? 'landing' : 'loggedIn'}
          onGoHome={handleBackToLanding}
          onGetStarted={handleGetStarted}
          onNavigateToMarket={handleGoToMarketData}
          onNavigateToChat={handleGoToChat}
          onGoToDashboard={handleGoToDashboard}
          onSkipToDashboard={handleSkipToDashboard} // Pass the function to the header
          showRefreshButton={currentState === 'marketData'}
          isRefreshing={isMarketDataLoading}
          onRefresh={fetchMarketData}
        />
      )}
      <main>
        {renderContent()}
      </main>
    </>
  );
}