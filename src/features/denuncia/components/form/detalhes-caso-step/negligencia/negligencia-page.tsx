import React from 'react'
import { CaseDetails } from '../../../../types/denuncia'

import './negligencia.css'

interface NegligenciaPsicologicaStepProps {
  caseDetails: CaseDetails
  onChange: (caseDetails: CaseDetails) => void
  onValidationChange?: (isValid: boolean) => void
}

export const NegligenciaPsicologicaStep: React.FC<NegligenciaPsicologicaStepProps> = ({ caseDetails, onChange }) => {
  const handleBooleanChange = (field: keyof CaseDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const update: Partial<CaseDetails> = { [field]: isChecked };

    if (!isChecked) {
      update[`${field}Location` as keyof CaseDetails] = undefined;
    }

    onChange({ ...caseDetails, ...update });
  };

  return (
    <div className="injuries-step">
      <div className="questions-container">
        <div className="form-card">
          <div className="form-card-header">
            <span className="question-text">Sinais de Negligência Familiar?</span>
            <div className="tooltip-container">
              <span className="info-icon">?</span>
              <div className="tooltip">
                Observa-se criança ou adolescente com sinais de omissão de cuidados básicos dos adultos responsáveis pela criança, 
                não provendo as necessidades básicas sendo exemplos, presença de um alto índice de cárie, 
                hábitos de higiene precários e aparente baixo peso.
              </div>
            </div>
          </div>
          <div className="form-card-content">
            <label className="switch">
              <input
                type="checkbox"
                checked={caseDetails.neglectSigns}
                onChange={handleBooleanChange('neglectSigns')}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
