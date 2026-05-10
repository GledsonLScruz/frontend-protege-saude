import React from 'react';
import { CaseDetails, InjuryLocation } from '../../../types/denuncia';
import { SelecionadorLocalLesaoFisica } from './negligencia/components/selecionador-lesao-fisica';

interface VisibleInjuriesStepProps {
  caseDetails: CaseDetails;
  onChange: (caseDetails: CaseDetails) => void;
  onValidationChange?: (isValid: boolean) => void;
}

type Locations = "Cabeça" | "Face" | "Pescoço" | "Outro"
type Location = Record<Locations, boolean>

const defaultLocation: Location = {
  "Cabeça": false,
  "Face": false,
  "Pescoço": false,
  "Outro": false
}

const LocationSelector: React.FC<{
  location?: InjuryLocation;
  onChange: (location: InjuryLocation) => void;
}> = ({ location = defaultLocation, onChange }) => (
  <div className="location-selector">
    <p>Selecione a localização:</p>
    <div className="location-checkboxes">
      {Object.entries(location).map(([key, checked]) => (
        <label key={key}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange({ ...location, [key]: e.target.checked })}
          />
          <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
        </label>
      ))}
    </div>
    {/* TODO: Criar input para Outro aqui! */}
  </div>
);

export const VisibleInjuriesStep: React.FC<VisibleInjuriesStepProps> = ({ caseDetails, onChange }) => {
  const updateCaseDetails = (updates: Partial<CaseDetails>) => {
    onChange({
      ...caseDetails,
      ...updates
    });
  };

  const handleBooleanChange = (field: keyof CaseDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const updates: Partial<CaseDetails> = { [field]: isChecked };

    if (!isChecked) {
      updates[`${field}Location` as keyof CaseDetails] = undefined;
    }

    updateCaseDetails(updates);
  };

  return (
    <div className="injuries-step">
      <div className="questions-container">
        <div className="form-card">
          <div className="form-card-header">
            <span className="question-text">Sinais de Violência Física?</span>
          </div>
          <div className="form-card-content">
            <label className="switch">
              <input
                type="checkbox"
                checked={caseDetails.hasAggressionSigns}
                onChange={handleBooleanChange('hasAggressionSigns')}
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

        <div className="form-card">
          <div className="form-card-header">
            <span className="question-text">Hematoma?</span>
            <div className="tooltip-container">
              <span className="info-icon">?</span>
              <div className="tooltip">
                Acúmulo de sangue em um tecido devido à lesão de vasos sanguíneos.
              </div>
            </div>
          </div>
          <div className="form-card-content">
            <label className="switch">
              <input
                type="checkbox"
                checked={caseDetails.hasBruises}
                onChange={handleBooleanChange('hasBruises')}
              />
              <span className="slider round"></span>
            </label>
            {caseDetails.hasBruises && (
              <LocationSelector
                location={caseDetails.bruisesLocation}
                onChange={(location) =>
                  onChange({ ...caseDetails, bruisesLocation: location })
                }
              />
            )}
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <span className="question-text">Abrasão?</span>
            <div className="tooltip-container">
              <span className="info-icon">?</span>
              <div className="tooltip">
                Ferida superficial, normalmente apenas com perda de pele, resultante de uma queda, ou de um arrastão pelo chão, ou por outra superfície.
              </div>
            </div>
          </div>
          <div className="form-card-content">
            <label className="switch">
              <input
                type="checkbox"
                checked={caseDetails.hasAbrasion}
                onChange={handleBooleanChange('hasAbrasion')}
              />
              <span className="slider round"></span>
            </label>
            {caseDetails.hasAbrasion && (
              <LocationSelector
                location={caseDetails.abrasionLocation}
                onChange={(location) =>
                  onChange({ ...caseDetails, abrasionLocation: location })
                }
              />
            )}
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <span className="question-text">Laceração?</span>
            <div className="tooltip-container">
              <span className="info-icon">?</span>
              <div className="tooltip">
                Ruptura nos tecidos moles do corpo.
              </div>
            </div>
          </div>
          <div className="form-card-content">
            <label className="switch">
              <input
                type="checkbox"
                checked={caseDetails.hasLaceration}
                onChange={handleBooleanChange('hasLaceration')}
              />
              <span className="slider round"></span>
            </label>
            {caseDetails.hasLaceration && (
              <LocationSelector
                location={caseDetails.lacerationLocation}
                onChange={(location) =>
                  onChange({ ...caseDetails, lacerationLocation: location })
                }
              />
            )}
          </div>
        </div>

        <div className="form-card">
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
        </div>
      </div>
    </div>
  );
};



{/* <SwitchQuestion
  title='Hematoma?'
  locationName='bruisesLocation'
  onChangeLocation={updateCaseDetails}
  caseDetails={caseDetails}
  checked={caseDetails.hasBruises}
  onChange={() => handleBooleanChange('hasBruises')}
  tooltip='Acúmulo de sangue em um tecido devido à lesão de vasos sanguíneos.'
/> */}
