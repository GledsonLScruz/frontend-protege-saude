import React, { Dispatch, SetStateAction } from 'react';
import './progress-bar-style.css';
import { Step, StepIndicator } from './components/step-indicator';

interface ProgressBarProps {
  currentStep: number;
  onTap: (step: number) => void;
  steps: Step[];
  stepsValidation: Record<number, boolean>;
  error: { hasError: boolean; step: number; };
  setError: Dispatch<SetStateAction<{ hasError: boolean; step: number; }>>
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  onTap,
  steps,
  stepsValidation,
  error,
  setError,
}) => {
  const isStepClickable = (stepNumber: number) => {
    if (stepNumber <= currentStep) return true;

    return Array.from({ length: stepNumber - 1 }, (_, i) => i + 1)
      .every(prevStep => stepsValidation[prevStep]);
  };

  return (
    <div className="progress-bar-container">
      <div className="progress-track">
        <div
          className="progress-bar"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`
          }}
        />
      </div>
      <div className="step-indicators">
        {steps.map(step => (
          <StepIndicator
            key={step.number}
            stepNumber={step.number}
            currentStep={currentStep}
            label={step.label}
            isActive={currentStep >= step.number}
            isCurrent={currentStep === step.number}
            onTap={onTap}
            isClickable={isStepClickable(step.number)}
            error={step.number === error.step && error.hasError}
            setError={setError}
          />
        ))}
      </div>
    </div>
  );
};
