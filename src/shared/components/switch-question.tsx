import { SelecionadorLocalLesaoFisica } from "../../features/denuncia/components/form/detalhes-caso-step/negligencia/components/selecionador-lesao-fisica";
import { CaseDetails } from "../../features/denuncia/types/denuncia";

export const SwitchQuestion = ({
  checked,
  title,
  locationName,
  caseDetails,
  onChange,
  onChangeLocation,
  tooltip,
}: {
  checked: boolean;
  title: string;
  locationName: keyof Partial<CaseDetails>;
  caseDetails: CaseDetails,
  onChange: () => void,
  onChangeLocation: (updates: Partial<CaseDetails>) => void,
  tooltip?: string,
}) => {
  return (
    <div className="form-card">
      <div className="form-card-header">
        <span className="question-text">{title}</span>
        {
          tooltip && (
            <div className="tooltip-container">
              <span className="info-icon">?</span>
              <div className="tooltip">
                {tooltip}
              </div>
            </div>
          )
        }
      </div>
      <div className="form-card-content">
        <label className="switch">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
          />
          <span className="slider round"></span>
        </label>
        {caseDetails[locationName] && (
          <SelecionadorLocalLesaoFisica
            onChange={(location) =>
              onChangeLocation({ ...caseDetails, [locationName]: location })
            }
          />
        )}
      </div>
    </div>
  )
}
