import { useState } from 'react';
import { LandingPage } from './components/LandingPage.tsx';
import { Onboarding, UserData } from './components/Onboarding.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { MarketDataPage, ETFData } from './components/MarketDataPage.tsx';
import { ChatPage } from './components/ChatPage.tsx';




// 1. Add 'chat' to the possible app states
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

  const handleBackToOnboarding = () => {
    setCurrentState('onboarding');
  };

  // 2. Add handlers for chat navigation
  const handleGoToChat = () => {
    setCurrentState('chat');
  };
  const handleBackToDashboard = () => {
    setCurrentState('dashboard');
  };

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

  switch (currentState) {
    case 'landing':
      return <LandingPage onGetStarted={handleGetStarted} onSkipToDashboard={handleSkipToDashboard} onNavigateToMarket={handleGoToMarketData} />;
    
    case 'onboarding':
      return <Onboarding onComplete={handleOnboardingComplete} onBack={handleBackToLanding} />;
    
    case 'dashboard':
      // 3. Pass the new chat handler to the Dashboard
      return userData ? <Dashboard userData={userData} onBack={handleBackToOnboarding} onGoHome={handleBackToLanding} onNavigateToMarket={handleGoToMarketData} onNavigateToChat={handleGoToChat} /> : null;

    case 'marketData':
      return (
        <MarketDataPage 
          onBack={handleBackToLanding}
          etfs={marketData}
          isLoading={isMarketDataLoading}
          error={marketDataError}
          onRefresh={fetchMarketData}
        />
      );

    // 4. Add a new case to render the ChatPage
    case 'chat':
      return <ChatPage onBack={handleBackToDashboard} />;
    
    default:
      return <LandingPage onGetStarted={handleGetStarted} onSkipToDashboard={handleSkipToDashboard} onNavigateToMarket={handleGoToMarketData} />;
  }
}