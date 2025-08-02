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

// ... the rest of the file remains the same
interface OnboardingProps {
  onComplete: (userData: UserData) => void;
  onBack: () => void;
}

export interface UserData {
  age: number;
  income: number;
  investmentAmount: number;
  timeHorizon: string;
  riskTolerance: string;
  investmentGoals: string[];
  experience: string;
}

export function Onboarding({ onComplete, onBack }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<Partial<UserData>>({
    investmentGoals: []
  });

  const totalSteps = 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(userData as UserData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return userData.age && userData.age > 0;
      case 1: return userData.income && userData.income > 0;
      case 2: return userData.investmentAmount && userData.investmentAmount > 0;
      case 3: return !!userData.timeHorizon;
      case 4: return !!userData.riskTolerance;
      case 5: return userData.investmentGoals && userData.investmentGoals.length > 0 && !!userData.experience;
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
    "Let's start with the basics",
    "Tell us about your income",
    "How much to invest?",
    "What's your timeline?",
    "Risk assessment",
    "Goals and experience"
  ];

  const stepDescriptions = [
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
              <Label htmlFor="age" className="input-label">What's your age?</Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={userData.age || ''}
                onChange={(e) => setUserData({ ...userData, age: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <p className="helper-text">
              Your age helps us determine the appropriate investment timeline and risk level for your portfolio.
            </p>
          </div>
        );

      case 1:
        return (
          <div className="step-content">
            <div>
              <Label htmlFor="income" className="input-label">What's your annual income?</Label>
              <Input
                id="income"
                type="number"
                placeholder="Enter your annual income"
                value={userData.income || ''}
                onChange={(e) => setUserData({ ...userData, income: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <p className="helper-text">
              This helps us understand your financial capacity and recommend appropriate investment amounts.
            </p>
          </div>
        );

      case 2:
        return (
          <div className="step-content">
            <div>
              <Label htmlFor="investment" className="input-label">How much would you like to invest initially?</Label>
              <Input
                id="investment"
                type="number"
                placeholder="Enter initial investment amount"
                value={userData.investmentAmount || ''}
                onChange={(e) => setUserData({ ...userData, investmentAmount: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <p className="helper-text">
              Start with any amount you're comfortable with. You can always invest more later.
            </p>
          </div>
        );

      case 3:
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
              Your timeline affects the types of investments we'll recommend and the level of risk we suggest.
            </p>
          </div>
        );
      case 4:
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
      case 5:
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
          
          <div className="onboarding-footer">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="nav-button"
            >
              <ArrowLeft className="arrow-icon" />
              <span>Back</span>
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="nav-button nav-button-next"
            >
              <span>{currentStep === totalSteps - 1 ? 'Generate My Plan' : 'Next'}</span>
              <ArrowRight className="arrow-icon" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}