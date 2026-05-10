import React from 'react'
import { CaseDetails } from '../../../../types/denuncia'

import './violencia-psicologica.css'

interface ViolenciaPsicologicaStepProps {
  caseDetails: CaseDetails
  onChange: (caseDetails: CaseDetails) => void
  onValidationChange?: (isValid: boolean) => void
}

export const ViolenciaPsicologicaStep: React.FC<ViolenciaPsicologicaStepProps> = ({ caseDetails, onChange }) => {
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
            <span className="question-text">Sinais de Violência Psicológica?</span>
            <div className="tooltip-container">
              <span className="info-icon">?</span>
              <div className="tooltip">
                Criança ou adolescente com comportamento retraído, nervoso ou assustado de forma incomum.
              </div>
            </div>
          </div>
          <div className="form-card-content">
            <label className="switch">
              <input
                type="checkbox"
                checked={caseDetails.psychologicalViolenceSigns}
                onChange={handleBooleanChange('psychologicalViolenceSigns')}
              />
              <span className="slider round"></span>
            </label>

            {/* {caseDetails.hasAggressionSigns && (
              <LocationSelector
                location={caseDetails.agressionSignsLocation}
                onChange={(location) =>
                  onChange({ ...caseDetails, agressionSignsLocation: location })
                }
              />
            )} */}
          </div>
        </div>
        {/* <div className="form-card">
          <div className="form-card-header">
            <span className="question-text">Queimadura?</span>
            <div className="tooltip-container">
              <span className="info-icon">?</span>
              <div className="tooltip">
                Toda lesão provocada pelo contato direto com alguma fonte de calor ou frio, produtos químicos, corrente elétrica, radiação, ou mesmo alguns animais e plantas (como larvas, água-viva, urtiga), entre outros.
              </div>
            </div>
          </div>
          <div className="form-card-content">
            <label className="switch">
              <input
                type="checkbox"
                checked={caseDetails.hasBurns}
                onChange={handleBooleanChange('hasBurns')}
              />
              <span className="slider round"></span>
            </label>
            {caseDetails.hasBurns && (
              <SelecionadorLocalLesaoFisica
                location={caseDetails.burnsLocation}
                onChange={(location) =>
                  onChange({ ...caseDetails, burnsLocation: location })
                }
              />
            )}
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <span className="question-text">Marca de Mordida?</span>
          </div>
          <div className="form-card-content">
            <label className="switch">
              <input
                type="checkbox"
                checked={caseDetails.hasBiteMarks}
                onChange={handleBooleanChange('hasBiteMarks')}
              />
              <span className="slider round"></span>
            </label>
            {caseDetails.hasBiteMarks && (
              <SelecionadorLocalLesaoFisica
                location={caseDetails.biteMarksLocation}
                onChange={(location) =>
                  onChange({ ...caseDetails, biteMarksLocation: location })
                }
              />
            )}
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <span className="question-text">Lesão no Olho?</span>
          </div>
          <div className="form-card-content">
            <label className="switch">
              <input
                type="checkbox"
                checked={caseDetails.hasEyeInjury}
                onChange={handleBooleanChange('hasEyeInjury')}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div> */}
      </div>
    </div>
  );
};
