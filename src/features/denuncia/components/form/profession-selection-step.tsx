import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { CustomSelect, CustomSelectOption } from '../../../../shared/components/select';
import { PublicProfession } from '../../types/denuncia';
import './profession-selection-step.css';

interface ProfessionSelectionStepProps {
  professions: PublicProfession[];
  selectedProfessionId: string;
  onSelect: (professionId: string) => void;
  onContinue: () => void;
  isLoadingProfessions: boolean;
  isLoadingForm: boolean;
  errorMessage?: string | null;
}

export const ProfessionSelectionStep: React.FC<ProfessionSelectionStepProps> = ({
  professions,
  selectedProfessionId,
  onSelect,
  onContinue,
  isLoadingProfessions,
  isLoadingForm,
  errorMessage,
}) => {
  const professionOptions = React.useMemo<CustomSelectOption[]>(
    () =>
      professions.map((profession) => ({
        label: profession.nome,
        value: String(profession.id),
      })),
    [professions]
  );

  const selectedProfession =
    professions.find((profession) => String(profession.id) === selectedProfessionId) ?? null;

  return (
    <div className="profession-selection-step">
      <div className="profession-selection-card">
        <span className="profession-selection-kicker">Nova denúncia</span>
        <h2>Escolha a profissão para carregar o formulário correto</h2>
        <p>
          O conteúdo da denúncia é configurado por profissão. O endereço e o conselho
          tutelar continuam sendo preenchidos no fluxo seguinte.
        </p>

        {errorMessage && (
          <div className="profession-selection-feedback profession-selection-feedback-error">
            {errorMessage}
          </div>
        )}

        {isLoadingProfessions ? (
          <div className="profession-selection-feedback">Carregando profissões...</div>
        ) : (
          <div className="profession-selection-field">
            <CustomSelect
              value={selectedProfessionId}
              onChange={onSelect}
              options={professionOptions}
              label="Profissão"
              placeholder="Selecione uma profissão"
              searchPlaceholder="Buscar profissão..."
            />
          </div>
        )}

        {selectedProfession && (
          <div className="profession-selection-preview">
            <h3>{selectedProfession.nome}</h3>
            <p>{selectedProfession.descricao || 'Formulário configurado para esta profissão.'}</p>
          </div>
        )}

        <button
          type="button"
          className="profession-selection-action"
          onClick={onContinue}
          disabled={!selectedProfessionId || isLoadingForm || isLoadingProfessions}
        >
          {isLoadingForm ? (
            <>
              <LoaderCircle size={18} className="profession-selection-spinner" />
              Carregando formulário...
            </>
          ) : (
            'Continuar'
          )}
        </button>
      </div>
    </div>
  );
};
