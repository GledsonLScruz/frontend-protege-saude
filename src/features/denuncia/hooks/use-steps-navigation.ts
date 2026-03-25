import { useEffect, useState } from 'react';
import { StepValidation } from './use-step-validation';

export const useStepsNavigation = (
  totalSteps: number,
  stepsValidation: StepValidation
) => {
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (currentStep > totalSteps) {
      setCurrentStep(1);
    }
  }, [currentStep, totalSteps]);

  const goToSpecificStep = (step: number) => {
    const canGoToStep = Array.from({ length: step - 1 }, (_, i) => i + 1).every(
      (prevStep) => stepsValidation[prevStep]
    );

    if (step > 0 && step <= totalSteps && canGoToStep) {
      setCurrentStep(step);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    goToSpecificStep,
  };
};
