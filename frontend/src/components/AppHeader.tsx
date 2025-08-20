import { Button } from "./ui/button.tsx";
import { MessageSquare, RefreshCw } from "lucide-react";
import './AppHeader.css';

// The props interface is updated to accept the developer shortcut function
interface AppHeaderProps {
  variant: 'landing' | 'loggedIn';
  onGoHome: () => void;
  onNavigateToMarket?: () => void;
  onNavigateToChat?: () => void;
  onGetStarted?: () => void;
  onGoToDashboard?: () => void;
  onSkipToDashboard?: () => void; // For the dev button
  showRefreshButton?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export function AppHeader({
  variant,
  onGoHome,
  onNavigateToMarket,
  onNavigateToChat,
  onGetStarted,
  onGoToDashboard,
  onSkipToDashboard,
  showRefreshButton,
  isRefreshing,
  onRefresh
}: AppHeaderProps) {

  const LoggedInButtons = () => (
    <>
      <Button variant="ghost" onClick={onGoToDashboard}>Dashboard</Button>
      <Button variant="ghost" onClick={onNavigateToMarket}>Market Data</Button>
      <Button variant="outline" onClick={onNavigateToChat}>
        <MessageSquare style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
        Chat
      </Button>
      {showRefreshButton && (
        <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      )}
    </>
  );

  const LandingButtons = () => (
    <>
      <Button variant="ghost" onClick={onNavigateToMarket}>Market Data</Button>
      {/* The "Dev: Go to Dashboard" button is now part of this component */}
      <Button variant="outline" onClick={onSkipToDashboard}>Dev: Go to Dashboard</Button>
      <Button onClick={onGetStarted} className="get-started-btn">Get Started</Button>
    </>
  );

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo" onClick={onGoHome}>
          <img src="/logo.png" alt="Finora Logo" style={{ height: '36px' }} />
        </div>
        <div className="header-actions">
          {variant === 'landing' ? <LandingButtons /> : <LoggedInButtons />}
        </div>
      </div>
    </header>
  );
}