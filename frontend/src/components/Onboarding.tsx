import { useState } from "react";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select.tsx";
import { Progress } from "./ui/progress.tsx";
import { ArrowLeft, ArrowRight } from "lucide-react";
import './Onboarding.css';

interface OnboardingProps {
  onComplete: (userData: UserData) => void;
  onBack: () => void;
}

export interface UserData {
  name: string;
  age: number;
  income: number;
  investmentAmount: number;
  timeHorizon: string;
  riskTolerance: string;
  investmentGoals: string[];
  experience: string;
}

const getIncomeRange = (income: number): string => {
    if (income < 50000) return "Less than $50,000";
    if (income >= 50000 && income < 100000) return "$50,000 - $99,999";
    if (income >= 100000 && income < 200000) return "$100,000 - $199,999";
    return "$200,000 or more";
};

export function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<Partial<UserData>>({
    investmentGoals: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const totalSteps = 7;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  
  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;
    switch (step) {
      case 0:
        if (!userData.name || userData.name.trim().length < 2) {
          newErrors.name = "Please enter a valid name.";
          isValid = false;
        }
        break;
      case 1:
        if (!userData.age) {
          newErrors.age = "Age is required.";
          isValid = false;
        } else if (userData.age < 18 || userData.age > 100) {
          newErrors.age = "Please enter an age between 18 and 100.";
          isValid = false;
        }
        break;
      case 2:
        if (userData.income === undefined || userData.income === null) {
            newErrors.income = "Annual income is required.";
            isValid = false;
        } else if (userData.income < 0) {
            newErrors.income = "Income cannot be negative.";
            isValid = false;
        }
        break;
      case 3:
        if (!userData.investmentAmount) {
            newErrors.investmentAmount = "Investment amount is required.";
            isValid = false;
        } else if (userData.investmentAmount <= 0) {
            newErrors.investmentAmount = "Investment amount must be greater than zero.";
            isValid = false;
        }
        break;
    }
    setFormErrors(newErrors);
    return isValid;
  };

  const submitOnboardingData = async () => {
    setIsLoading(true);
    setApiError(null);

    // This payload now perfectly matches the final database schema and backend API
    const payload = {
      name: userData.name,
      age: userData.age,
      income_range: getIncomeRange(userData.income!),
      investment_amount: userData.investmentAmount,
      time_horizon: userData.timeHorizon,
      risk_tolerance: userData.riskTolerance,
      investment_goals: userData.investmentGoals?.join(', '),
      experience: userData.experience,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong on the server.');
      }
      onComplete(userData as UserData);
    } catch (err: any) {
      console.error("Failed to submit onboarding data:", err);
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        submitOnboardingData();
      }
    }
  };

  const handlePrevious = () => {
    setFormErrors({});
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return userData.name && userData.name.trim().length >= 2;
      case 1: return userData.age && userData.age >= 18 && userData.age <= 100;
      case 2: return userData.income !== undefined && userData.income >= 0;
      case 3: return userData.investmentAmount && userData.investmentAmount > 0;
      case 4: return !!userData.timeHorizon;
      case 5: return !!userData.riskTolerance;
      case 6: return userData.investmentGoals && userData.investmentGoals.length > 0 && !!userData.experience;
      default: return false;
    }
  };

  const updateGoals = (goal: string, checked: boolean) => {
    const currentGoals = userData.investmentGoals || [];
    if (checked) {
      setUserData({ ...userData, investmentGoals: [...currentGoals, goal] });
    } else {
      setUserData({ ...userData, investmentGoals: currentGoals.filter(g => g !== goal) });
    }
  };
  
  const stepTitles = [
    "Welcome to Finora!",
    "Let's start with the basics",
    "Tell us about your income",
    "How much to invest?",
    "What's your timeline?",
    "Risk assessment",
    "Goals and experience"
  ];

  const stepDescriptions = [
    "Let's get started by learning a bit about you. What should we call you?",
    "We need some basic information to personalize your investment plan",
    "Understanding your income helps us recommend appropriate investment amounts",
    "Start with any amount - you can always add more later",
    "Your investment timeline affects our recommendations",
    "Help us understand your comfort level with market fluctuations",
    "Let's understand what you're investing for"
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="step-content">
            <div>
              <Label htmlFor="name" className="input-label">What is your full name?</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={userData.name || ''}
                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                className="input-field"
              />
              {formErrors.name && <p className="error-text">{formErrors.name}</p>}
            </div>
            <p className="helper-text">
              We'll use this to personalize your experience.
            </p>
          </div>
        );
      case 1:
        return (
          <div className="step-content">
            <div>
              <Label htmlFor="age" className="input-label">How old are you, {userData.name}?</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={userData.age || ''}
                onChange={(e) => setUserData({ ...userData, age: parseInt(e.target.value) || undefined })}
                className="input-field"
              />
              {formErrors.age && <p className="error-text">{formErrors.age}</p>}
            </div>
            <p className="helper-text">
              Your age helps us determine the appropriate investment timeline.
            </p>
          </div>
        );
      case 2:
        return (
            <div className="step-content">
            <div>
              <Label htmlFor="income" className="input-label">What's your annual income?</Label>
              <Input
                id="income"
                type="number"
                placeholder="Enter your annual income in USD"
                value={userData.income || ''}
                onChange={(e) => setUserData({ ...userData, income: parseInt(e.target.value) || undefined })}
                className="input-field"
              />
              {formErrors.income && <p className="error-text">{formErrors.income}</p>}
            </div>
            <p className="helper-text">
              This helps us understand your financial capacity. We'll store this as a range to protect your privacy.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="step-content">
            <div>
              <Label htmlFor="investment" className="input-label">How much would you like to invest initially?</Label>
              <Input
                id="investment"
                type="number"
                placeholder="Enter initial investment amount"
                value={userData.investmentAmount || ''}
                onChange={(e) => setUserData({ ...userData, investmentAmount: parseInt(e.target.value) || undefined })}
                className="input-field"
              />
              {formErrors.investmentAmount && <p className="error-text">{formErrors.investmentAmount}</p>}
            </div>
            <p className="helper-text">
              Start with any amount you're comfortable with.
            </p>
          </div>
        );
      case 4:
        return (
          <div className="step-content">
            <Label className="input-label">What's your investment timeline?</Label>
            <Select value={userData.timeHorizon} onValueChange={(value) => setUserData({ ...userData, timeHorizon: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your investment timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short-term (1-3 years)</SelectItem>
                <SelectItem value="medium">Medium-term (3-10 years)</SelectItem>
                <SelectItem value="long">Long-term (10+ years)</SelectItem>
              </SelectContent>
            </Select>
            <p className="helper-text">
              Longer timelines generally allow for higher-risk, higher-growth strategies.
            </p>
          </div>
        );
      case 5:
        return (
          <div className="step-content">
            <Label className="input-label">How do you feel about investment risk?</Label>
            <RadioGroup
              value={userData.riskTolerance}
              onValueChange={(value) => setUserData({ ...userData, riskTolerance: value })}
              className="radio-group"
            >
              <div className="radio-item-container">
                <RadioGroupItem value="conservative" id="conservative" />
                <Label htmlFor="conservative" className="radio-label">
                  <div className="radio-label-title">Conservative</div>
                  <div className="radio-label-description">I prefer steady, predictable returns with minimal risk</div>
                </Label>
              </div>
              <div className="radio-item-container">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate" className="radio-label">
                  <div className="radio-label-title">Moderate</div>
                  <div className="radio-label-description">I'm comfortable with some ups and downs for potentially higher returns</div>
                </Label>
              </div>
              <div className="radio-item-container">
                <RadioGroupItem value="aggressive" id="aggressive" />
                <Label htmlFor="aggressive" className="radio-label">
                  <div className="radio-label-title">Aggressive</div>
                  <div className="radio-label-description">I'm willing to accept significant volatility for maximum growth potential</div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        );
      case 6:
        return (
          <div className="step-content" style={{gap: '1.5rem'}}>
            <div className="step-content">
              <Label className="input-label">What are your investment goals? (Select all that apply)</Label>
              <div className="goals-grid">
                {[
                  'Retirement planning',
                  'Emergency fund',
                  'Buying a home',
                  'Education funding',
                  'General wealth building',
                  'Short-term savings goals'
                ].map((goal) => (
                  <label key={goal} className="goal-label">
                    <input
                      type="checkbox"
                      checked={userData.investmentGoals?.includes(goal) || false}
                      onChange={(e) => updateGoals(goal, e.target.checked)}
                      className="goal-checkbox"
                    />
                    <span>{goal}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="step-content">
              <Label className="input-label">What's your investment experience?</Label>
              <Select value={userData.experience} onValueChange={(value) => setUserData({ ...userData, experience: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner - I'm new to investing</SelectItem>
                  <SelectItem value="intermediate">Intermediate - I have some experience</SelectItem>
                  <SelectItem value="advanced">Advanced - I'm an experienced investor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <Card className="onboarding-card">
        <CardHeader>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                <Progress value={progress} className="progress-bar" />
                <div className="onboarding-header">
                    <CardTitle>{stepTitles[currentStep]}</CardTitle>
                    <CardDescription style={{marginTop: '0.5rem'}}>
                        {stepDescriptions[currentStep]}
                    </CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          {renderStep()}
          {apiError && (
            <div className="error-text" style={{textAlign: 'center'}}>
              API Error: {apiError}
            </div>
          )}
          <div className="onboarding-footer">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="nav-button"
              disabled={isLoading}
            >
              <ArrowLeft className="arrow-icon" />
              <span>Back</span>
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid() || isLoading}
              className="nav-button nav-button-next"
            >
              <span>
                {isLoading 
                  ? 'Saving...' 
                  : currentStep === totalSteps - 1 
                  ? 'Generate My Plan' 
                  : 'Next'}
              </span>
              <ArrowRight className="arrow-icon" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}