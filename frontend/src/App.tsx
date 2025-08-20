import { useState } from 'react';
import { LandingPage } from './components/LandingPage.tsx';
import { Onboarding, UserData } from './components/Onboarding.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { MarketDataPage, ETFData } from './components/MarketDataPage.tsx';
import { ChatPage } from './components/ChatPage.tsx';
import { AppHeader } from './components/AppHeader.tsx'; // Import the new header

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
      // Fallback in case user data is lost
      setCurrentState('onboarding');
    }
  };

  const handleGoToChat = () => {
    setCurrentState('chat');
  };
  
  // This function now just renders the main content area for the current page
  const renderContent = () => {
    switch (currentState) {
      case 'landing':
        return <LandingPage onGetStarted={handleGetStarted} />;
      
      case 'onboarding':
        // The onboarding form is a full-screen experience
        return <Onboarding onComplete={handleOnboardingComplete} onBack={handleBackToLanding} />;
      
      case 'dashboard':
        // The dashboard now only needs the user's data
        return userData ? <Dashboard userData={userData} /> : <LandingPage onGetStarted={handleGetStarted} />;

      case 'marketData':
        // The market page only needs the data itself
        return <MarketDataPage etfs={marketData} isLoading={isMarketDataLoading} error={marketDataError} />;
      
      case 'chat':
        return <ChatPage />;

      default:
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <>
      {/* The AppHeader is now rendered here, outside the pages.
        It is conditionally hidden during the onboarding flow.
      */}
      {currentState !== 'onboarding' && (
        <AppHeader
          variant={!userData ? 'landing' : 'loggedIn'}
          onGoHome={handleBackToLanding}
          onGetStarted={handleGetStarted}
          onNavigateToMarket={handleGoToMarketData}
          onNavigateToChat={handleGoToChat}
          onGoToDashboard={handleGoToDashboard}
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