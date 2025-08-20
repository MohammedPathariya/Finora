import { Button } from "./ui/button.tsx";
import { MessageSquareMore, RefreshCw, BarChart3 } from "lucide-react";
import './AppHeader.css';

interface AppHeaderProps {
  isLoggedIn: boolean;
  onGoHome: () => void;
  onNavigateToMarket: () => void;
  onNavigateToChat: () => void;
  onGetStarted: () => void;
  onGoToDashboard: () => void;
  onSkipToDashboard: () => void;
}

export function AppHeader({
  isLoggedIn,
  onGoHome,
  onNavigateToMarket,
  onNavigateToChat,
  onGetStarted,
  onGoToDashboard,
  onSkipToDashboard
}: AppHeaderProps) {

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-logo" onClick={onGoHome}>
          <img src="/logo.png" alt="Finora Logo" style={{ height: '36px' }} />
        </div>
        <div className="header-actions">
          <Button variant="ghost" onClick={onNavigateToMarket}><BarChart3 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Market Data</Button>
          <Button variant="ghost" onClick={onNavigateToChat}>
            <MessageSquareMore style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Chat with AI
          </Button>
          
          {isLoggedIn ? (
            // MODIFIED: Changed variant from 'outline' to 'ghost' for consistency
            <Button variant="ghost" onClick={onGoToDashboard}>Dashboard</Button>
          ) : (
            <>
              {/* Dev button is kept as 'outline' to distinguish it */}
              <Button variant="outline" onClick={onSkipToDashboard}>Dev: Go to Dashboard</Button>
              <Button onClick={onGetStarted} className="get-started-btn">Get Started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}