import { useCallback, useEffect, useState } from 'react';

export type StepValidation = Record<number, boolean>;

const buildInitialStepsValidation = (totalSteps: number): StepValidation =>
  Array.from({ length: totalSteps }, (_, index) => index + 1).reduce<StepValidation>(
    (accumulator, step) => {
      accumulator[step] = false;
      return accumulator;
    },
    {}
  );

export const useStepsValidation = (totalSteps: number) => {
  const [stepsValidation, setStepsValidation] = useState<StepValidation>(
    buildInitialStepsValidation(totalSteps)
  );

  useEffect(() => {
    setStepsValidation((prev) => {
      const next = buildInitialStepsValidation(totalSteps);

      Object.entries(prev).forEach(([step, value]) => {
        const numericStep = Number(step);
        if (numericStep <= totalSteps) {
          next[numericStep] = value;
        }
      });

      return next;
    });
  }, [totalSteps]);

  const updateStepValidation = useCallback((step: number, isValid: boolean) => {
    setStepsValidation((prev) => {
      if (prev[step] === isValid) {
        return prev;
      }

      return {
        ...prev,
        [step]: isValid,
      };
    });
  }, []);

  const resetStepsValidation = useCallback(() => {
    setStepsValidation(buildInitialStepsValidation(totalSteps));
  }, [totalSteps]);

  const isStepValid = useCallback((step: number) => Boolean(stepsValidation[step]), [stepsValidation]);

  return {
    stepsValidation,
    updateStepValidation,
    resetStepsValidation,
    isStepValid,
  };
};
