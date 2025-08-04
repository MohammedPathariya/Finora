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

  // NEW: Function to fetch user #1 and skip to the dashboard
  const handleSkipToDashboard = async () => {
    try {
      // Fetch the data from your backend for the user with id = 1
      const response = await fetch('http://127.0.0.1:5000/onboard/1');
      if (!response.ok) {
        throw new Error('Could not fetch profile for user 1. Make sure the user exists in your database.');
      }
      const profileData = await response.json();

      // Transform the snake_case data from the DB to the camelCase UserData interface
      const transformedData: UserData = {
        name: profileData.name,
        age: profileData.age,
        investmentAmount: profileData.investment_amount,
        timeHorizon: profileData.time_horizon,
        riskTolerance: profileData.risk_tolerance,
        investmentGoals: profileData.investment_goals.split(', '), // Convert string back to array
        experience: profileData.experience,
        // The `income` field in the form is a number, but we store a range.
        // For this dev shortcut, we'll just use a placeholder value.
        income: 50000, 
      };

      // Set the state to render the dashboard
      setUserData(transformedData);
      setCurrentState('dashboard');

    } catch (error) {
      console.error(error);
      alert(error); // Show an alert if something goes wrong
    }
  };

  switch (currentState) {
    case 'landing':
      // MODIFIED: Pass the new handler function to the LandingPage
      return <LandingPage onGetStarted={handleGetStarted} onSkipToDashboard={handleSkipToDashboard} />;
    
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
      return <LandingPage onGetStarted={handleGetStarted} onSkipToDashboard={handleSkipToDashboard} />;
  }
}