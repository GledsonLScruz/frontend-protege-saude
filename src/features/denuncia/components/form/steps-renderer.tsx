import React from 'react';
import {
  CepValidationResponse,
  ComplaintDraft,
  ComplaintStepDefinition,
  DynamicAnswerValue,
} from '../../types/denuncia';
import { AddressStep } from '../form/address/address-step';
import { ComplaintSummary } from '../form/resumo-denuncia/resumo-denuncia';
import { DynamicFormStep } from './dynamic-form-step';

interface StepsRendererProps {
  currentStep: number;
  steps: ComplaintStepDefinition[];
  complaint: ComplaintDraft;
  validateCep: (cep: string) => Promise<CepValidationResponse>;
  onAddressUpdate: (address: ComplaintDraft['address']) => void;
  onDynamicAnswerUpdate: (
    stepId: number,
    fieldId: number,
    value: DynamicAnswerValue
  ) => void;
  onValidationChange: (isValid: boolean) => void;
}

export const StepsRenderer: React.FC<StepsRendererProps> = ({
  currentStep,
  steps,
  complaint,
  validateCep,
  onAddressUpdate,
  onDynamicAnswerUpdate,
  onValidationChange
}) => {
  if (!complaint.loadedForm) {
    return null;
  }

  if (currentStep === 1) {
    return (
      <AddressStep
        address={complaint.address}
        validateCep={validateCep}
        onChange={onAddressUpdate}
        onValidationChange={onValidationChange}
      />
    );
  }

  if (currentStep === steps.length) {
    return <ComplaintSummary complaint={complaint} onValidationChange={onValidationChange} />;
  }

  const dynamicStep = complaint.loadedForm.passos[currentStep - 2];

  if (!dynamicStep) {
    return null;
  }

  return (
    <DynamicFormStep
      key={dynamicStep.id}
      step={dynamicStep}
      dynamicAnswers={complaint.dynamicAnswers}
      onChange={(stepId, fieldId, value) =>
        onDynamicAnswerUpdate(stepId, fieldId, value)
      }
      onValidationChange={onValidationChange}
    />
  );
};
