# Código Consolidado: Telas do Formulário Dinâmico

Este arquivo reúne os componentes, estilos e utilitários que participam diretamente da montagem das telas do fluxo de formulário dinâmico em `src/features/denuncia`, incluindo dependências visuais compartilhadas (`select`, `checkbox` e formatação de CEP).

## `src/features/denuncia/denuncia-page.tsx`

```tsx
import React from 'react';
import './denuncia-page-style.css';
import { ComplaintForm } from './components/denuncia-content';
import { useLocation } from 'react-router-dom';

export const DenunciaPage: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/denuncia') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [location]);

  return (
    <div className="report-flow-container">
      <ComplaintForm />
    </div>
  );
};

```

## `src/features/denuncia/denuncia-page-style.css`

```css
.report-flow-container {
  padding-top: 80px;
}

.step-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
input[type="date"],
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background-color: #fff;
  color: #111;
}

/*
.form-group select {
  padding: 0.5rem;
} */

#victimName {
  width: 100%;
  padding: 12px;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 10px;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.next-button,
.prev-button,
.generate-pdf-button,
.submit-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.next-button,
.generate-pdf-button,
.submit-button {
  background-color: var(--profession-accent, var(--primary-color, #24786B));
  color: white;
}

.prev-button {
  background-color: #ddd;
  color: #333;
}

.next-button:hover,
.generate-pdf-button:hover,
.submit-button:hover {
  background-color: var(--profession-accent-strong, #206A5E);
}

.prev-button:hover {
  background-color: #ccc;
}

.summary {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.summary p {
  margin-bottom: 10px;
}

.summary .description {
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  max-width: 100%;
}

.success-message {
  text-align: center;
  padding: 20px;
  background-color: #e6f7e6;
  border-radius: 8px;
  margin-top: 20px;
}

.success-message h2 {
  color: #2e7d32;
  margin-bottom: 10px;
}

.anonymous-message {
  font-style: italic;
  color: #666;
  margin-top: 10px;
}

@media (max-width: 600px) {
  .report-flow-container {
    padding-top: 72px;
  }

  .button-group {
    flex-direction: column;
  }

  .next-button,
  .prev-button,
  .generate-pdf-button,
  .submit-button {
    width: 100%;
    margin-top: 10px;
  }
}

```

## `src/features/denuncia/components/denuncia-content.tsx`

```tsx
import React, { useEffect, useMemo, useState } from 'react';

import './denuncia-content.css';

import { useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useComplaintForm } from '../hooks/use-denuncia-form';
import { useStepsValidation } from '../hooks/use-step-validation';
import { useStepsNavigation } from '../hooks/use-steps-navigation';
import { ProgressBar } from './progress-bar';
import { StepsRenderer } from './form/steps-renderer';
import { NavigationInferiorControl } from './navigation-inferior-control';
import { FeedbackModal } from './modal_feedback';
import { DenunciaController, DenunciaState } from '../denuncia-controller';
import { Header } from '../../../shared/components/header/components';
import { Modal } from '../../inicio/components/modal';
import { generatePDF } from '../../../shared/utils/generate-pdf';
import { ProfessionSelectionStep } from './form/profession-selection-step';
import { ComplaintStepDefinition, CouncilRegion, PublicForm, PublicProfession } from '../types/denuncia';

const DEFAULT_PROFESSION_ACCENT = '#24786B';

const normalizeHexColor = (rawColor?: string | null): string | null => {
  if (!rawColor) {
    return null;
  }

  const trimmed = rawColor.trim();
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(normalized)) {
    if (normalized.length === 4) {
      return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
    }

    return normalized.toUpperCase();
  }

  return null;
};

const hexToRgb = (hexColor: string): [number, number, number] => {
  const normalized = hexColor.replace('#', '');
  const parsed = Number.parseInt(normalized, 16);

  return [
    (parsed >> 16) & 255,
    (parsed >> 8) & 255,
    parsed & 255,
  ];
};

const darkenHexColor = (hexColor: string, amount: number): string => {
  const [red, green, blue] = hexToRgb(hexColor);
  const nextChannel = (channel: number) =>
    Math.max(0, Math.min(255, Math.round(channel * (1 - amount))));

  return `#${[nextChannel(red), nextChannel(green), nextChannel(blue)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
};

export const ComplaintForm: React.FC = () => {
  const navigate = useNavigate();
  const denunciaController = useMemo(() => new DenunciaController(), []);
  const submitOverlayRef = React.useRef<HTMLDivElement>(null);

  const {
    complaint,
    publicProfessions,
    setPublicProfessions,
    selectedProfession,
    loadedForm,
    updateAddress,
    updateDynamicAnswer,
    startNewDraft,
    restoreStoredDraft,
    getStoredDraft,
    hasExistingComplaintData,
    setPdf,
    clearStoredData,
  } = useComplaintForm();

  const [submitState, setSubmitState] = useState<DenunciaState>({ status: 'idle' });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [isLoadingProfessions, setIsLoadingProfessions] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [selectedProfessionId, setSelectedProfessionId] = useState('');
  const [pendingProfession, setPendingProfession] = useState<PublicProfession | null>(null);
  const [pendingForm, setPendingForm] = useState<PublicForm | null>(null);
  const [councilRegions, setCouncilRegions] = useState<CouncilRegion[]>([]);
  const [isProfessionConfirmed, setIsProfessionConfirmed] = useState(false);
  const [resumeDraftState, setResumeDraftState] = useState<{
    profession: PublicProfession;
    form: PublicForm;
  } | null>(null);

  const steps = useMemo<ComplaintStepDefinition[]>(
    () =>
      loadedForm
        ? [
            { number: 1, label: 'Endereço da Vítima' },
            ...loadedForm.passos.map((step, index) => ({
              number: index + 2,
              label: step.titulo,
            })),
            {
              number: loadedForm.passos.length + 2,
              label: 'Resumo',
            },
          ]
        : [],
    [loadedForm]
  );

  const totalSteps = steps.length || 1;
  const { stepsValidation, updateStepValidation, resetStepsValidation } =
    useStepsValidation(totalSteps);
  const { currentStep, setCurrentStep, goToSpecificStep } = useStepsNavigation(
    totalSteps,
    stepsValidation
  );

  const [error, setError] = useState({
    hasError: false,
    step: -2,
  });

  const neighborhoods = useMemo(
    () => denunciaController.getAllBairros(councilRegions),
    [councilRegions, denunciaController]
  );

  const findConselhoByBairro = React.useCallback(
    (bairro: string) =>
      denunciaController.findConselhoByBairro(bairro, councilRegions),
    [councilRegions, denunciaController]
  );

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingProfessions(true);
      setSelectionError(null);

      try {
        const [professions, councils] = await Promise.all([
          denunciaController.listPublicProfessions(),
          denunciaController.getCampinaGrandeCouncils(),
        ]);

        setPublicProfessions(professions);
        setCouncilRegions(councils);
      } catch (error) {
        setSelectionError(
          error instanceof Error
            ? error.message
            : 'Não foi possível iniciar o fluxo de denúncia.'
        );
      } finally {
        setIsLoadingProfessions(false);
      }
    };

    void loadInitialData();
  }, [denunciaController, setPublicProfessions]);

  const isNextButtonDisabled = isProfessionConfirmed
    ? !stepsValidation[currentStep]
    : false;
  const isSubmitting = submitState.status === 'loading';
  const activeProfessionColor =
    pendingProfession?.cor ||
    selectedProfession?.cor ||
    null;
  const complaintThemeStyle = useMemo<React.CSSProperties>(() => {
    const accent = normalizeHexColor(activeProfessionColor) ?? DEFAULT_PROFESSION_ACCENT;
    const [red, green, blue] = hexToRgb(accent);

    return {
      ['--profession-accent' as string]: accent,
      ['--profession-accent-rgb' as string]: `${red}, ${green}, ${blue}`,
      ['--profession-accent-strong' as string]: darkenHexColor(accent, 0.12),
      ['--primary-color' as string]: accent,
    };
  }, [activeProfessionColor]);

  useEffect(() => {
    if (isSubmitting) {
      submitOverlayRef.current?.focus();
    }
  }, [isSubmitting]);

  const handleCurrentStepValidationChange = React.useCallback(
    (isValid: boolean) => {
      updateStepValidation(currentStep, isValid);
    },
    [currentStep, updateStepValidation]
  );

  useEffect(() => {
    const root = document.documentElement;
    const previousPrimaryColor = root.style.getPropertyValue('--primary-color');
    const previousProfessionAccent = root.style.getPropertyValue('--profession-accent');
    const previousProfessionAccentRgb = root.style.getPropertyValue('--profession-accent-rgb');
    const previousProfessionAccentStrong = root.style.getPropertyValue('--profession-accent-strong');
    const accent = normalizeHexColor(activeProfessionColor);

    if (accent) {
      const [red, green, blue] = hexToRgb(accent);
      root.style.setProperty('--primary-color', accent);
      root.style.setProperty('--profession-accent', accent);
      root.style.setProperty('--profession-accent-rgb', `${red}, ${green}, ${blue}`);
      root.style.setProperty('--profession-accent-strong', darkenHexColor(accent, 0.12));
    } else {
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--profession-accent');
      root.style.removeProperty('--profession-accent-rgb');
      root.style.removeProperty('--profession-accent-strong');
    }

    return () => {
      if (previousPrimaryColor) {
        root.style.setProperty('--primary-color', previousPrimaryColor);
      } else {
        root.style.removeProperty('--primary-color');
      }

      if (previousProfessionAccent) {
        root.style.setProperty('--profession-accent', previousProfessionAccent);
      } else {
        root.style.removeProperty('--profession-accent');
      }

      if (previousProfessionAccentRgb) {
        root.style.setProperty('--profession-accent-rgb', previousProfessionAccentRgb);
      } else {
        root.style.removeProperty('--profession-accent-rgb');
      }

      if (previousProfessionAccentStrong) {
        root.style.setProperty('--profession-accent-strong', previousProfessionAccentStrong);
      } else {
        root.style.removeProperty('--profession-accent-strong');
      }
    };
  }, [activeProfessionColor]);

  const handleFinalStep = async () => {
    setSubmitState({ status: 'loading' });

    try {
      const pdfBlob = await generatePDF(complaint);
      setPdf(pdfBlob);

      const protocol = `DEN-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 1000000
      )
        .toString()
        .padStart(6, '0')}`;

      const result = await denunciaController.submitDenuncia(complaint, pdfBlob, protocol);
      setSubmitState(result);

      if (result.status === 'success' && result.protocol) {
        await clearStoredData(selectedProfession?.id);
        navigate('/confirmacao-denuncia', {
          state: {
            complaint,
            protocol: result.protocol,
            pdf: pdfBlob,
          },
        });
      }
    } catch (error) {
      setSubmitState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Erro inesperado ao enviar denúncia.',
      });
    }
  };

  const resetWizardState = () => {
    resetStepsValidation();
    setCurrentStep(1);
    setError({
      step: -2,
      hasError: false,
    });
    setSubmitState({ status: 'idle' });
  };

  const handleProfessionSelect = async (professionId: string) => {
    setSelectedProfessionId(professionId);
    setSelectionError(null);
    setPendingForm(null);
    setPendingProfession(
      publicProfessions.find((profession) => String(profession.id) === professionId) ?? null
    );

    if (!professionId) {
      return;
    }

    setIsLoadingForm(true);
    try {
      const selected = publicProfessions.find(
        (profession) => String(profession.id) === professionId
      );

      if (!selected) {
        throw new Error('Profissão não encontrada.');
      }

      const form = await denunciaController.getPublicForm(selected.id);
      setPendingProfession(selected);
      setPendingForm(form);
    } catch (error) {
      setPendingForm(null);
      setSelectionError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o formulário desta profissão.'
      );
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleStartDraft = async () => {
    if (!pendingProfession || !pendingForm) {
      return;
    }

    if (
      selectedProfession?.id === pendingProfession.id &&
      loadedForm?.profissao.id === pendingForm.profissao.id
    ) {
      setIsProfessionConfirmed(true);
      return;
    }

    if (await hasExistingComplaintData(pendingProfession.id)) {
      setResumeDraftState({
        profession: pendingProfession,
        form: pendingForm,
      });
      return;
    }

    startNewDraft(pendingProfession, pendingForm, {
      preserveAddress: Boolean(complaint.address.neighborhood?.trim()),
    });
    resetWizardState();
    setIsProfessionConfirmed(true);
  };

  const handleResumeDraft = () => {
    void (async () => {
      if (!resumeDraftState) {
        return;
      }

      const storedDraft = await getStoredDraft(resumeDraftState.profession.id);

      if (storedDraft) {
        restoreStoredDraft(resumeDraftState.profession, resumeDraftState.form, storedDraft);
      } else {
        startNewDraft(resumeDraftState.profession, resumeDraftState.form, {
          preserveAddress: Boolean(complaint.address.neighborhood?.trim()),
        });
      }

      resetWizardState();
      setIsProfessionConfirmed(true);
      setResumeDraftState(null);
    })();
  };

  const handleNewDraft = () => {
    void (async () => {
      if (!resumeDraftState) {
        return;
      }

      await clearStoredData(resumeDraftState.profession.id);
      startNewDraft(resumeDraftState.profession, resumeDraftState.form, {
        preserveAddress: Boolean(complaint.address.neighborhood?.trim()),
      });
      resetWizardState();
      setIsProfessionConfirmed(true);
      setResumeDraftState(null);
    })();
  };

  const handleChangeProfession = () => {
    setSelectedProfessionId(selectedProfession ? String(selectedProfession.id) : '');
    setPendingProfession(selectedProfession);
    setPendingForm(loadedForm);
    setIsProfessionConfirmed(false);
    setSubmitState({ status: 'idle' });
  };

  return (
    <>
      {resumeDraftState && (
        <Modal
          title={`Há um rascunho salvo para ${resumeDraftState.profession.nome}. Deseja retomar?`}
          primaryLabel="Sim, continuar rascunho"
          secondayLabel="Não, começar do zero"
          onPrimary={handleResumeDraft}
          onSecondary={handleNewDraft}
        />
      )}

      {modalVisible && (
        <Modal
          title="Você tem certeza que deseja sair?"
          primaryLabel="Sair mesmo assim"
          secondayLabel="Não! Voltar para onde estava"
          onPrimary={() => navigate('/')}
          onSecondary={() => setModalVisible(false)}
        />
      )}

      <Header>
        <Header.Left>
          <Header.BackButton onClick={() => setModalVisible(true)} />
        </Header.Left>

        <Header.Center>
          <Header.Title>
            {!isProfessionConfirmed
              ? 'Selecione a profissão'
              : steps[currentStep - 1]?.label ?? 'Denúncia'}
          </Header.Title>
        </Header.Center>

        <Header.Right>
          {isProfessionConfirmed && selectedProfession && (
            <button
              type="button"
              className="change-profession-button"
              onClick={handleChangeProfession}
            >
              Trocar profissão
            </button>
          )}
        </Header.Right>
      </Header>

      <div className="complaint-form" style={complaintThemeStyle}>
        {!isProfessionConfirmed ? (
          <ProfessionSelectionStep
            professions={publicProfessions}
            selectedProfessionId={selectedProfessionId}
            onSelect={(professionId) => void handleProfessionSelect(professionId)}
            onContinue={() => void handleStartDraft()}
            isLoadingProfessions={isLoadingProfessions}
            isLoadingForm={isLoadingForm}
            errorMessage={selectionError}
          />
        ) : (
          <>
            <ProgressBar
              currentStep={currentStep}
              onTap={goToSpecificStep}
              steps={steps}
              stepsValidation={stepsValidation}
              error={error}
              setError={setError}
            />
            <div className="step-content">
              {isSubmitting && (
                <div className="complaint-submit-overlay" role="status" aria-live="polite">
                  <div
                    ref={submitOverlayRef}
                    className="complaint-submit-overlay-card"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="complaint-submit-title"
                    aria-describedby="complaint-submit-description"
                    tabIndex={-1}
                  >
                    <LoaderCircle size={28} className="complaint-submit-spinner" />
                    <strong id="complaint-submit-title">Enviando denúncia...</strong>
                    <p id="complaint-submit-description">
                      Estamos gerando o PDF e transmitindo as informações com segurança.
                    </p>
                  </div>
                </div>
              )}
              <StepsRenderer
                currentStep={currentStep}
                steps={steps}
                complaint={complaint}
                neighborhoods={neighborhoods}
                findConselhoByBairro={findConselhoByBairro}
                onAddressUpdate={updateAddress}
                onDynamicAnswerUpdate={updateDynamicAnswer}
                onValidationChange={handleCurrentStepValidationChange}
              />
              <br />
              <NavigationInferiorControl
                totalSteps={totalSteps}
                currentStep={currentStep}
                setCurrentStep={(newStep) => {
                  setError({
                    step: -2,
                    hasError: false,
                  });
                  setCurrentStep(newStep);
                }}
                handleFinalStep={() => void handleFinalStep()}
                isNextDisabled={isNextButtonDisabled || isSubmitting}
                isSubmitting={isSubmitting}
              />
            </div>
          </>
        )}

        {submitState.status === 'error' && (
          <FeedbackModal
            isSuccess={false}
            message={submitState.message || 'Erro ao enviar denúncia'}
            onClose={() => setSubmitState({ status: 'idle' })}
            onRedirect={() => navigate('/')}
          />
        )}
      </div>
    </>
  );
};

```

## `src/features/denuncia/components/denuncia-content.css`

```css
* {
  font-family: "Inter", 'sans-serif';
}

.complaint-form {
  --profession-accent: #24786B;
  --profession-accent-rgb: 36, 120, 107;
  --profession-accent-strong: #206A5E;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.progress-container {
  margin-bottom: 2rem;
}

.step-content {
  position: relative;
  background: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  min-height: 300px;
}

.complaint-submit-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(3px);
}

.complaint-submit-overlay-card {
  max-width: 360px;
  width: 100%;
  padding: 1.5rem;
  border-radius: 18px;
  border: 1px solid rgba(var(--profession-accent-rgb), 0.28);
  background: linear-gradient(
    180deg,
    rgba(var(--profession-accent-rgb), 0.12) 0%,
    #ffffff 100%
  );
  box-shadow:
    0 16px 40px rgba(28, 28, 28, 0.12),
    0 10px 28px rgba(var(--profession-accent-rgb), 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

.complaint-submit-overlay-card strong {
  color: #2f2f2f;
  font-size: 1.05rem;
}

.complaint-submit-overlay-card p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.complaint-submit-spinner {
  color: var(--profession-accent);
  animation: complaint-submit-spin 1s linear infinite;
}

@keyframes complaint-submit-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.change-profession-button {
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.change-profession-button:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 640px) {
  .step-content {
    padding: 2rem;
  }

  .change-profession-button {
    padding: 0.4rem 0.7rem;
    font-size: 0.78rem;
  }
}

```

## `src/features/denuncia/components/form/profession-selection-step.tsx`

```tsx
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

```

## `src/features/denuncia/components/form/profession-selection-step.css`

```css
.profession-selection-step {
  display: flex;
  justify-content: center;
}

.profession-selection-card {
  width: 100%;
  max-width: 640px;
  padding: 2rem;
  border-radius: 20px;
  background: linear-gradient(
    180deg,
    rgba(var(--profession-accent-rgb, 36, 120, 107), 0.12) 0%,
    #ffffff 100%
  );
  border: 1px solid rgba(var(--profession-accent-rgb, 36, 120, 107), 0.28);
  box-shadow:
    0 20px 40px rgba(28, 28, 28, 0.08),
    0 8px 24px rgba(var(--profession-accent-rgb, 36, 120, 107), 0.16);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.profession-selection-kicker {
  width: fit-content;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--profession-accent, var(--primary-color, #24786B));
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.profession-selection-card h2 {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.15;
  color: #2f2f2f;
}

.profession-selection-card p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.profession-selection-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profession-selection-preview {
  padding: 1rem 1.1rem;
  border-radius: 14px;
  background: rgba(var(--profession-accent-rgb, 36, 120, 107), 0.1);
  border: 1px solid rgba(var(--profession-accent-rgb, 36, 120, 107), 0.25);
}

.profession-selection-preview h3 {
  margin: 0 0 0.35rem;
  color: var(--profession-accent-strong, #14544B);
}

.profession-selection-feedback {
  padding: 0.95rem 1rem;
  border-radius: 12px;
  background: #f8f8f8;
  color: #555;
}

.profession-selection-feedback-error {
  background: #fff5f5;
  color: #b42318;
  border: 1px solid #ffd6d6;
}

.profession-selection-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  border: none;
  border-radius: 14px;
  background: var(--profession-accent, var(--primary-color, #24786B));
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease, background-color 0.2s ease;
}

.profession-selection-action:hover:not(:disabled) {
  background: var(--profession-accent-strong, #206A5E);
}

.profession-selection-action:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--profession-accent-rgb, 36, 120, 107), 0.22);
}

.profession-selection-action:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.profession-selection-spinner {
  animation: profession-selection-spin 1s linear infinite;
}

@keyframes profession-selection-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .profession-selection-card {
    padding: 1.5rem;
  }

  .profession-selection-card h2 {
    font-size: 1.5rem;
  }
}

```

## `src/features/denuncia/components/form/steps-renderer.tsx`

```tsx
import React from 'react';
import {
  ComplaintDraft,
  ComplaintStepDefinition,
  CouncilRegion,
  DynamicAnswerValue,
} from '../../types/denuncia';
import { AddressStep } from '../form/address/address-step';
import { ComplaintSummary } from '../form/resumo-denuncia/resumo-denuncia';
import { DynamicFormStep } from './dynamic-form-step';

interface StepsRendererProps {
  currentStep: number;
  steps: ComplaintStepDefinition[];
  complaint: ComplaintDraft;
  neighborhoods: string[];
  findConselhoByBairro: (bairro: string) => CouncilRegion | undefined;
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
  neighborhoods,
  findConselhoByBairro,
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
        neighborhoods={neighborhoods}
        findConselhoByBairro={findConselhoByBairro}
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

```

## `src/features/denuncia/components/form/dynamic-form-step.tsx`

```tsx
import React from 'react';
import { CustomSelect } from '../../../../shared/components/select';
import CustomCheckbox from '../../../../shared/components/checkbox';
import { formatarCEP } from '../../../../shared/utils/string-utils';
import {
  ComplaintPhoto,
  DynamicAnswerValue,
  DynamicAnswers,
  PublicFormField,
  PublicFormStep,
} from '../../types/denuncia';
import {
  DEFAULT_NO_PHOTOS,
  getAllowedFieldValues,
  getFieldMaxPhotos,
  getFieldOptions,
  getFieldStorageKey,
  isPhotoAnswer,
  normalizeSwitchConditionalAnswer,
  normalizeCep,
  validateDynamicField,
} from '../../utils/dynamic-form';
import './dynamic-form-step.css';

interface DynamicFormStepProps {
  step: PublicFormStep;
  dynamicAnswers: DynamicAnswers;
  onChange: (stepId: number, fieldId: number, value: DynamicAnswerValue) => void;
  onValidationChange?: (isValid: boolean) => void;
}

type TouchedFields = Record<string, boolean>;
type ValidationErrors = Record<string, string | undefined>;

const createPhotoId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Não foi possível ler a imagem selecionada.'));
    };

    reader.onerror = () =>
      reject(reader.error ?? new Error('Não foi possível ler a imagem selecionada.'));
    reader.readAsDataURL(file);
  });

const buildPhotoFromFile = async (file: File): Promise<ComplaintPhoto> => ({
  id: createPhotoId(),
  name: file.name,
  type: file.type || 'image/jpeg',
  size: file.size,
  dataUrl: await readFileAsDataUrl(file),
});

export const DynamicFormStep: React.FC<DynamicFormStepProps> = ({
  step,
  dynamicAnswers,
  onChange,
  onValidationChange,
}) => {
  const [touchedFields, setTouchedFields] = React.useState<TouchedFields>({});
  const [selectionErrors, setSelectionErrors] = React.useState<ValidationErrors>({});

  const stepAnswerValues = React.useMemo(
    () => dynamicAnswers[getFieldStorageKey(step.id)] ?? {},
    [dynamicAnswers, step.id]
  );

  const validationErrors = React.useMemo(
    () =>
      step.campos.reduce<ValidationErrors>((accumulator, field) => {
        accumulator[getFieldStorageKey(field.id)] = validateDynamicField(
          field,
          stepAnswerValues[getFieldStorageKey(field.id)]
        );
        return accumulator;
      }, {}),
    [step, stepAnswerValues]
  );

  const isStepValid = React.useMemo(
    () =>
      Object.values(validationErrors).every((error) => !error) &&
      Object.values(selectionErrors).every((error) => !error),
    [selectionErrors, validationErrors]
  );

  React.useEffect(() => {
    onValidationChange?.(isStepValid);
  }, [isStepValid, onValidationChange]);

  const markTouched = (fieldId: number) => {
    setTouchedFields((prev) => ({
      ...prev,
      [getFieldStorageKey(fieldId)]: true,
    }));
  };

  const getFieldValue = (fieldId: number): DynamicAnswerValue =>
    stepAnswerValues[getFieldStorageKey(fieldId)];

  const getFieldPhotos = (fieldId: number): ComplaintPhoto[] => {
    const value = getFieldValue(fieldId);
    return isPhotoAnswer(value) ? value : [];
  };

  const clearSelectionError = (fieldId: number) => {
    setSelectionErrors((prev) => ({
      ...prev,
      [getFieldStorageKey(fieldId)]: undefined,
    }));
  };

  const handlePhotoSelection = async (
    field: PublicFormField,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    markTouched(field.id);

    const files = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    const fieldKey = getFieldStorageKey(field.id);
    const currentPhotos = getFieldPhotos(field.id);
    const maxPhotos = getFieldMaxPhotos(field);
    const remainingSlots = Math.max(maxPhotos - currentPhotos.length, 0);

    if (remainingSlots === 0) {
      setSelectionErrors((prev) => ({
        ...prev,
        [fieldKey]: `Você pode enviar até ${maxPhotos} foto${maxPhotos > 1 ? 's' : ''}.`,
      }));
      return;
    }

    const acceptedFiles = files.slice(0, remainingSlots);

    setSelectionErrors((prev) => ({
      ...prev,
      [fieldKey]:
        files.length > remainingSlots
          ? `Você pode enviar até ${maxPhotos} foto${maxPhotos > 1 ? 's' : ''}.`
          : undefined,
    }));

    try {
      const nextPhotos = await Promise.all(acceptedFiles.map((file) => buildPhotoFromFile(file)));
      onChange(step.id, field.id, [...currentPhotos, ...nextPhotos]);
    } catch (error) {
      setSelectionErrors((prev) => ({
        ...prev,
        [fieldKey]:
          error instanceof Error
            ? error.message
            : 'Não foi possível processar a imagem selecionada.',
      }));
    }
  };

  const handlePhotoRemoval = (field: PublicFormField, photoId: string) => {
    markTouched(field.id);
    clearSelectionError(field.id);

    onChange(
      step.id,
      field.id,
      getFieldPhotos(field.id).filter((photo) => photo.id !== photoId)
    );
  };

  const renderField = (field: PublicFormField) => {
    const fieldKey = getFieldStorageKey(field.id);
    const fieldError = selectionErrors[fieldKey] ?? validationErrors[fieldKey];
    const isTouched = touchedFields[fieldKey];
    const showError = Boolean(isTouched && fieldError);

    switch (field.tipo_campo) {
      case 'texto':
      case 'numero':
      case 'cep':
        return (
          <input
            type="text"
            value={String(getFieldValue(field.id) ?? '')}
            inputMode={field.tipo_campo === 'numero' || field.tipo_campo === 'cep' ? 'numeric' : undefined}
            onChange={(event) => {
              markTouched(field.id);
              clearSelectionError(field.id);
              const nextValue =
                field.tipo_campo === 'cep'
                  ? formatarCEP(event.target.value)
                  : event.target.value;
              onChange(step.id, field.id, nextValue);
            }}
            onBlur={() => markTouched(field.id)}
            placeholder={
              field.tipo_campo === 'cep'
                ? '00000-000'
                : field.tipo_campo === 'numero'
                  ? 'Digite um número'
                  : 'Digite sua resposta'
            }
            className={showError ? 'dynamic-input-error' : ''}
          />
        );


      case 'textarea':
        return (
          <textarea
            value={String(getFieldValue(field.id) ?? '')}
            onChange={(event) => {
              markTouched(field.id);
              clearSelectionError(field.id);
              onChange(step.id, field.id, event.target.value);
            }}
            onBlur={() => markTouched(field.id)}
            placeholder="Digite sua resposta"
            rows={5}
            className={showError ? 'dynamic-input-error' : ''}
          />
        );

      case 'data':
        return (
          <input
            type="date"
            value={String(getFieldValue(field.id) ?? '')}
            onChange={(event) => {
              markTouched(field.id);
              clearSelectionError(field.id);
              onChange(step.id, field.id, event.target.value);
            }}
            onBlur={() => markTouched(field.id)}
            className={showError ? 'dynamic-input-error' : ''}
          />
        );

      case 'select':
      case 'bairro':
        return (
          <CustomSelect
            value={String(getFieldValue(field.id) ?? '')}
            onChange={(value) => {
              markTouched(field.id);
              clearSelectionError(field.id);
              onChange(step.id, field.id, value);
            }}
            onBlur={() => markTouched(field.id)}
            options={getFieldOptions(field).map((option) => ({
              label: option.label,
              value: option.valor,
            }))}
            placeholder="Selecione uma opção"
            error={showError}
          />
        );

      case 'radio':
        return (
          <div className="dynamic-options-list dynamic-radio-list">
            {getFieldOptions(field).map((option) => (
              <label key={option.valor} className="dynamic-radio-option">
                <input
                  type="radio"
                  name={`field-${field.id}`}
                  checked={getFieldValue(field.id) === option.valor}
                  onChange={() => {
                    markTouched(field.id);
                    clearSelectionError(field.id);
                    onChange(step.id, field.id, option.valor);
                  }}
                  onBlur={() => markTouched(field.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox': {
        const selectedValues = Array.isArray(getFieldValue(field.id))
          ? (getFieldValue(field.id) as string[])
          : [];

        return (
          <div className="dynamic-options-list dynamic-checkbox-list">
            {getFieldOptions(field).map((option) => (
              <CustomCheckbox
                key={option.valor}
                checked={selectedValues.includes(option.valor)}
                label={option.label}
                onChange={(checked) => {
                  markTouched(field.id);
                  clearSelectionError(field.id);
                  const nextValues = checked
                    ? [...selectedValues, option.valor]
                    : selectedValues.filter((item) => item !== option.valor);

                  onChange(step.id, field.id, nextValues);
                }}
              />
            ))}
          </div>
        );
      }

      case 'switch': {
        const switchValue = normalizeSwitchConditionalAnswer(field, getFieldValue(field.id));
        const showConditionalOptions =
          switchValue.valor === true && getFieldOptions(field).length > 0;
        const checked = switchValue.valor === true;

        return (
          <div className="dynamic-switch-field">
            <div className="dynamic-switch-card">
              <span className="dynamic-switch-label">{checked ? 'Sim' : 'Não'}</span>
              <label className="dynamic-switch">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    markTouched(field.id);
                    clearSelectionError(field.id);
                    onChange(step.id, field.id, {
                      valor: event.target.checked,
                      selecionados: event.target.checked ? switchValue.selecionados : [],
                    });
                  }}
                  onBlur={() => markTouched(field.id)}
                />
                <span className="dynamic-switch-slider"></span>
              </label>
            </div>

            {showConditionalOptions && (
              <div className="dynamic-switch-conditional-group">
                <p className="dynamic-switch-conditional-title">Selecione:</p>
                <div className="dynamic-options-list dynamic-checkbox-list dynamic-switch-conditional-list">
                  {getFieldOptions(field).map((option) => (
                    <CustomCheckbox
                      key={option.valor}
                      checked={switchValue.selecionados.includes(option.valor)}
                      label={option.label}
                      onChange={(checked) => {
                        markTouched(field.id);
                        clearSelectionError(field.id);
                        const selecionados = checked
                          ? [...switchValue.selecionados, option.valor]
                          : switchValue.selecionados.filter((item) => item !== option.valor);

                        onChange(step.id, field.id, {
                          valor: true,
                          selecionados,
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'foto': {
        const selectedPhotos = getFieldPhotos(field.id);
        const maxPhotos = getFieldMaxPhotos(field);

        return (
          <div className={`dynamic-photo-field ${showError ? 'dynamic-input-error' : ''}`}>
            <label className="dynamic-photo-upload-button">
              <input
                type="file"
                accept="image/*"
                multiple={maxPhotos > 1}
                onChange={(event) => void handlePhotoSelection(field, event)}
                onBlur={() => markTouched(field.id)}
              />
              <span>
                {selectedPhotos.length > 0
                  ? 'Adicionar mais fotos'
                  : maxPhotos > 1
                    ? 'Selecionar fotos'
                    : 'Selecionar foto'}
              </span>
            </label>

            <p className="dynamic-photo-helper">
              {selectedPhotos.length}/{maxPhotos} foto{maxPhotos > 1 ? 's' : ''} selecionada{selectedPhotos.length !== 1 ? 's' : ''}
            </p>

            {selectedPhotos.length > 0 ? (
              <div className="dynamic-photo-grid">
                {selectedPhotos.map((photo) => (
                  <div key={photo.id} className="dynamic-photo-card">
                    <img src={photo.dataUrl} alt={photo.name} className="dynamic-photo-preview" />
                    <div className="dynamic-photo-meta">
                      <span className="dynamic-photo-name" title={photo.name}>
                        {photo.name}
                      </span>
                      <button
                        type="button"
                        className="dynamic-photo-remove-button"
                        onClick={() => handlePhotoRemoval(field, photo.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dynamic-photo-empty">{DEFAULT_NO_PHOTOS}</div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="dynamic-form-step">
      {step.descricao && <p className="dynamic-step-description">{step.descricao}</p>}

      <div className="dynamic-fields">
        {step.campos.map((field) => {
          const fieldKey = getFieldStorageKey(field.id);
          const fieldError = selectionErrors[fieldKey] ?? validationErrors[fieldKey];
          const isTouched = touchedFields[fieldKey];
          const showError = Boolean(isTouched && fieldError);
          const allowedValues = getAllowedFieldValues(field);

          return (
            <div key={field.id} className="dynamic-form-group">
              <div className="dynamic-field-header">
                <div className="dynamic-field-title-group">
                  <label className="dynamic-field-label">
                    {field.nome}
                    {field.obrigatorio && <span className="dynamic-required">*</span>}
                  </label>
                  {field.tipo_campo === 'bairro' && allowedValues.length > 0 && (
                    <span className="dynamic-field-badge">Bairro validado</span>
                  )}
                  {field.dica && (
                    <div className="dynamic-tooltip-container" aria-label={`Dica: ${field.dica}`}>
                      <span className="dynamic-info-icon">i</span>
                      <div className="dynamic-tooltip">{field.dica}</div>
                    </div>
                  )}
                </div>

                {field.tipo_campo === 'cep' && (
                  <span className="dynamic-field-badge">
                    {normalizeCep(String(getFieldValue(field.id) ?? '')).length}/8
                  </span>
                )}

                {field.tipo_campo === 'foto' && (
                  <span className="dynamic-field-badge">
                    {getFieldPhotos(field.id).length}/{getFieldMaxPhotos(field)}
                  </span>
                )}
              </div>

              {renderField(field)}

              {showError && <span className="error-message">{fieldError}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

```

## `src/features/denuncia/components/form/dynamic-form-step.css`

```css
.dynamic-form-step {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dynamic-step-description {
  margin: 0;
  color: #616161;
  line-height: 1.5;
}

.dynamic-fields {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dynamic-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dynamic-field-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: space-between;
}

.dynamic-field-title-group {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.5rem;
  min-width: 0;
  flex: 1 1 280px;
  flex-wrap: wrap;
}

.dynamic-field-header label {
  font-weight: 600;
  color: #3a3a3a;
}

.dynamic-field-label {
  display: inline;
  line-height: 1.4;
  margin: 0;
}

.dynamic-required {
  color: #d32f2f;
  margin-left: 0.25rem;
}

.dynamic-tooltip-container {
  position: relative;
  display: inline-flex;
  align-self: flex-start;
}

.dynamic-info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  background-color: var(--profession-accent, #24786B);
  color: #fff;
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
  cursor: help;
  transition: all 0.2s ease;
}

.dynamic-info-icon:hover {
  background-color: var(--profession-accent-strong, #206A5E);
  transform: translateY(-1px);
}

.dynamic-tooltip {
  visibility: hidden;
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 250px;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background-color: var(--profession-accent, #24786B);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.45;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s ease;
  z-index: 10;
}

.dynamic-tooltip-container:hover .dynamic-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

.dynamic-field-badge {
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  background: #E9F6F4;
  color: #14544B;
  font-size: 0.8rem;
  font-weight: 600;
}

.dynamic-form-group input[type="text"],
.dynamic-form-group input[type="date"],
.dynamic-form-group textarea {
  width: 100%;
  min-height: 42px;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #3a3a3a;
  background: #fff;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.dynamic-form-group textarea {
  min-height: 132px;
  resize: vertical;
}

.dynamic-form-group input[type="text"]:focus,
.dynamic-form-group input[type="date"]:focus,
.dynamic-form-group textarea:focus {
  outline: none;
  border-color: var(--profession-accent, #24786B);
  box-shadow: 0 0 0 2px rgba(var(--profession-accent-rgb, 36, 120, 107), 0.1);
}

.dynamic-input-error {
  border-color: #d32f2f !important;
}

.dynamic-options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dynamic-radio-list,
.dynamic-checkbox-list {
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
}

.dynamic-radio-list {
  gap: 0.1rem;
  padding: 0;
  border: 0;
  background: transparent;
}

.dynamic-radio-option {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 60px;
  padding: 0.45rem 0;
  border-radius: 0;
  background: #ffffff;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.dynamic-radio-option input {
  position: absolute;
  opacity: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}

.dynamic-radio-option span {
  display: flex;
  align-items: center;
  width: 100%;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.dynamic-radio-option span::before {
  content: '';
  width: 24px;
  height: 24px;
  margin-right: 14px;
  flex-shrink: 0;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  background: #fff;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.dynamic-radio-option span::after {
  content: '';
  position: absolute;
  left: 0.38rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--profession-accent, #24786B);
  transform: scale(0);
  transition: transform 0.2s ease;
}

.dynamic-radio-option input:checked + span::before {
  border-color: var(--profession-accent, #24786B);
}

.dynamic-radio-option input:checked + span::after {
  transform: scale(1);
}

.dynamic-radio-option input:checked + span {
  color: #1f2937;
}

.dynamic-radio-option:has(input:checked) {
  background: #ffffff;
}

.dynamic-radio-option:has(input:focus-visible) {
  background: rgba(var(--profession-accent-rgb, 36, 120, 107), 0.08);
}

.dynamic-switch-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: #fff;
}

.dynamic-switch-label {
  min-width: 2.5rem;
  font-weight: 600;
  color: #444;
  text-align: left;
  flex: 0 0 2.5rem;
}

.dynamic-switch {
  position: relative;
  display: inline-flex;
  width: 52px;
  height: 30px;
}

.dynamic-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.dynamic-switch-slider {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: #c5c5c5;
  transition: 0.2s ease;
}

.dynamic-switch-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 4px;
  top: 4px;
  border-radius: 50%;
  background: #fff;
  transition: 0.2s ease;
}

.dynamic-switch input:checked + .dynamic-switch-slider {
  background: var(--profession-accent, #24786B);
}

.dynamic-switch input:checked + .dynamic-switch-slider::before {
  transform: translateX(22px);
}

.dynamic-switch-field {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.dynamic-switch-conditional-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.25rem;
  padding: 1.5rem;
  border: 1px solid rgba(var(--profession-accent-rgb, 36, 120, 107), 0.45);
  border-radius: 1rem;
  background: transparent;
  box-shadow: none;
}

.dynamic-switch-conditional-title {
  margin: 0;
  color: #667085;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5;
}

.dynamic-switch-conditional-list {
  gap: 1rem;
  padding: 0;
  border: 0;
  background: transparent;
}

.dynamic-switch-conditional-list .custom-checkbox {
  justify-content: flex-start;
  align-items: center;
  min-height: 88px;
  padding: 0 1.5rem;
  border: 1px solid #f2f4f7;
  border-radius: 1rem;
  background: #fcfcfd;
}

.dynamic-switch-conditional-list .custom-checkbox:hover,
.dynamic-switch-conditional-list .custom-checkbox:has(input:focus-visible) {
  background: #f9fafb;
}

.dynamic-switch-conditional-list .checkbox-mark {
  width: 22px;
  height: 22px;
  flex-basis: 22px;
  align-self: center;
  border-width: 3px;
  border-color: #d0d5dd;
}

.dynamic-switch-conditional-list .checkbox-label {
  align-self: center;
  margin-left: 1rem;
  color: #3a3a3a;
  font-size: 1rem;
  font-weight: 700;
}

.dynamic-photo-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px dashed #d6d6d6;
  background: #fcfcfd;
}

.dynamic-photo-upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 42px;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: var(--profession-accent, #24786B);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.dynamic-photo-upload-button input {
  display: none;
}

.dynamic-photo-helper {
  margin: 0;
  color: #616161;
  font-size: 0.9rem;
}

.dynamic-photo-empty {
  min-height: 42px;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #616161;
  display: flex;
  align-items: center;
}

.dynamic-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.dynamic-photo-card {
  overflow: hidden;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.dynamic-photo-preview {
  display: block;
  width: 100%;
  height: 148px;
  object-fit: cover;
  background: #f5f5f5;
}

.dynamic-photo-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
}

.dynamic-photo-name {
  min-width: 0;
  flex: 1;
  color: #424242;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dynamic-photo-remove-button {
  border: 0;
  background: transparent;
  color: #b42318;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.dynamic-photo-remove-button:hover {
  color: #8f1d14;
}

@media (max-width: 640px) {
  .dynamic-switch-card {
    gap: 1rem;
  }

  .dynamic-switch-conditional-group {
    padding: 1.25rem;
  }

  .dynamic-switch-conditional-list .custom-checkbox {
    min-height: 76px;
    padding: 0 1rem;
  }

  .dynamic-tooltip {
    width: 210px;
    left: -12px;
  }

  .dynamic-photo-grid {
    grid-template-columns: 1fr;
  }

  .dynamic-photo-meta {
    align-items: flex-start;
    flex-direction: column;
  }
}

```

## `src/features/denuncia/components/form/address/address-step.tsx`

```tsx
import React from 'react';

import { Address, CouncilRegion } from '../../../types/denuncia';
import { AddressController } from './address-controller';
import { validateAddressStep } from './address-step-validation';
import { CustomSelect } from '../../../../../shared/components/select';
import { formatarCEP } from '../../../../../shared/utils/string-utils';

import './address-step.css';

interface ValidationErrors {
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
}

interface TouchedFields {
  cep?: boolean;
  street?: boolean;
  number?: boolean;
  neighborhood?: boolean;
}

interface AddressStepProps {
  address: Address;
  onChange: (address: Address) => void;
  onValidationChange?: (isValid: boolean) => void;
  neighborhoods: string[];
  findConselhoByBairro: (bairro: string) => CouncilRegion | undefined;
}

export const AddressStep: React.FC<AddressStepProps> = ({
  address,
  onChange,
  onValidationChange,
  neighborhoods,
  findConselhoByBairro,
}) => {
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = React.useState<TouchedFields>({});
  const addressController = React.useMemo(() => new AddressController(), []);
  const latestAddressRef = React.useRef(address);
  const onChangeRef = React.useRef(onChange);
  const findConselhoByBairroRef = React.useRef(findConselhoByBairro);
  const lastFetchedCepRef = React.useRef('');
  const lastValidationRef = React.useRef<{ key: string; isValid: boolean } | null>(null);

  React.useEffect(() => {
    latestAddressRef.current = address;
  }, [address]);

  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    findConselhoByBairroRef.current = findConselhoByBairro;
  }, [findConselhoByBairro]);

  const handleBlur = (field: keyof TouchedFields) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };
  React.useEffect(() => {
    const validationErrors = validateAddressStep(address);
    const isValid = Object.keys(validationErrors).length === 0;
    const nextValidationKey = JSON.stringify(validationErrors);
    const previousValidation = lastValidationRef.current;

    if (
      !previousValidation ||
      previousValidation.key !== nextValidationKey ||
      previousValidation.isValid !== isValid
    ) {
      lastValidationRef.current = {
        key: nextValidationKey,
        isValid,
      };
      setErrors(validationErrors);
      onValidationChange?.(isValid);
    }
  }, [address, onValidationChange]);

  React.useEffect(() => {
    const normalizedCep = address.cep?.replace(/\D/g, '') ?? '';

    if (normalizedCep.length !== 8) {
      lastFetchedCepRef.current = '';
      return;
    }

    if (lastFetchedCepRef.current === normalizedCep) {
      return;
    }

    lastFetchedCepRef.current = normalizedCep;

    void addressController.getAddressByCep(normalizedCep)
      .then((addressData) => {
        if (!addressData) {
          return;
        }

        const conselho = findConselhoByBairroRef.current(addressData.bairro);
        const nextCouncilRegion = conselho ? {
          setor: conselho.setor,
          nome: conselho.nome,
          regiao: conselho.regiao || undefined,
          contato: conselho.contato
        } : undefined;
        const currentAddress = latestAddressRef.current;
        const hasSameCouncilRegion =
          currentAddress.councilRegion?.setor === nextCouncilRegion?.setor &&
          currentAddress.councilRegion?.nome === nextCouncilRegion?.nome &&
          currentAddress.councilRegion?.regiao === nextCouncilRegion?.regiao &&
          JSON.stringify(currentAddress.councilRegion?.contato ?? []) ===
            JSON.stringify(nextCouncilRegion?.contato ?? []);

        if (
          currentAddress.street === addressData.logradouro &&
          currentAddress.neighborhood === addressData.bairro &&
          hasSameCouncilRegion
        ) {
          return;
        }

        onChangeRef.current({
          ...currentAddress,
          street: addressData.logradouro,
          neighborhood: addressData.bairro,
          councilRegion: nextCouncilRegion
        });
      });
  }, [address.cep, addressController]);

  const handleNeighborhoodChange = (selectedNeighborhood: string) => {
    const conselho = findConselhoByBairro(selectedNeighborhood);

    onChange({
      ...address,
      neighborhood: selectedNeighborhood,
      councilRegion: conselho ? {
        setor: conselho.setor,
        nome: conselho.nome,
        contato: conselho.contato,
        regiao: conselho.regiao || undefined
      } : undefined
    });
  };

  return (
    <div className="address-step">
      <div className="form-group">
        <div className="address-form-item">
          <label>CEP</label>
          <div className="tooltip-container-base">
            <div className="info-icon-base"><span>i</span></div>
            <div className="tooltip-base">
              Caso a criança ou adolescente resida em outro município que não seja Campina Grande, deve-se informar o CEP do endereço onde a violência ocorreu, em Campina Grande.
            </div>
          </div>
        </div>
        <input
          type="text"
          value={address.cep || ''}
          onChange={(e) => onChange({ ...address, cep: formatarCEP(e.target.value) })}
          onBlur={() => handleBlur('cep')}
          placeholder="58000-000"
        />
        {touchedFields.cep && errors.cep && <span className="error-message">{errors.cep}</span>}
      </div>

      <div className="form-group">
        <label>Rua</label>
        <input
          type="text"
          value={address.street || ''}
          onChange={(e) => onChange({ ...address, street: e.target.value })}
          onBlur={() => handleBlur('street')}
          placeholder="Nome da rua"
        />
        {touchedFields.street && errors.street && (
          <span className="error-message">{errors.street}</span>
        )}
      </div>

      <div className="form-group">
        <label>Número</label>
        <input
          type="text"
          value={address.number || ''}
          onChange={(e) => onChange({ ...address, number: e.target.value })}
          onBlur={() => handleBlur('number')}
          placeholder="Número"
        />
        {touchedFields.number && errors.number && <span className="error-message">{errors.number}</span>}
      </div>

      <div className="form-group">
        <CustomSelect
          label="Bairro"
          value={address.neighborhood || ''}
          onChange={handleNeighborhoodChange}
          options={neighborhoods}
          onBlur={() => handleBlur('neighborhood')}
          error={touchedFields.neighborhood && !!errors.neighborhood}
          placeholder="Selecione um bairro"
        />
        {touchedFields.neighborhood && errors.neighborhood && <span className="error-message">{errors.neighborhood}</span>}
      </div>
    </div>
  );
};

```

## `src/features/denuncia/components/form/address/address-step.css`

```css
.complaint-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: "Inter", 'sans-serif';
}

.form-group>.address-form-item label {
  margin-bottom: 0px;
}

.address-form-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.address-form-item label {
  margin-bottom: 0;
}

.address-step h2 {
  font-size: 2rem;
}

@media (max-width: 640px) {
  .address-step h2 {
    font-size: 1.5rem;
  }
}

/* Tooltip Styles */
.tooltip-container-base {
  position: relative;
}

.info-icon-base {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid var(--gray-300);
  color: var(--gray-300);
  border-radius: 50%;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all .4s ease;
}

.info-icon-base:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.tooltip-base {
  visibility: hidden;
  position: absolute;
  top: 1rem;
  background-color: var(--profession-accent, var(--primary-color));
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 250px;
  z-index: 10;
  margin-top: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(-4px);
  transition: all 0.2s ease;

  font-weight: 600;
}

.tooltip-container-base:hover .tooltip-base {
  visibility: visible;
  opacity: 1;
  transform: translateY(0);
}

/* Responsive Styles */
@media (max-width: 640px) {

  .injuries-step h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .form-card {
    padding: 1.25rem;
  }

  .tooltip {
    width: 200px;
    right: -20px;
  }
}

```

## `src/features/denuncia/components/form/address/address-controller.ts`

```ts
import { CepResponse } from "./@types";
import { AddressService } from "./service/address-service";

export class AddressController {
  private service: AddressService;

  constructor() {
    this.service = new AddressService();
  }

  async getAddressByCep(cep: string): Promise<CepResponse | undefined> {
    try {
      const response = await this.service.getAddressByCep(cep);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

```

## `src/features/denuncia/components/form/address/address-step-validation.tsx`

```tsx
import { Address } from "../../../types/denuncia";

export interface AddressValidationErrors {
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
}

export const ADDRESS_VALIDATION_MESSAGES = {
  REQUIRED_CEP: 'CEP é obrigatório',
  INVALID_CEP: 'CEP inválido',
  REQUIRED_STREET: 'Rua é obrigatória',
  INVALID_STREET: 'Rua deve ter pelo menos 3 caracteres',
  REQUIRED_NUMBER: 'Número é obrigatório',
  REQUIRED_NEIGHBORHOOD: 'Bairro é obrigatório'
} as const;

export const validateAddressStep = (address: Address): AddressValidationErrors => {
  const errors: AddressValidationErrors = {};
  if (!!address.cep && !/^\d{5}-?\d{3}$/.test(address.cep)) {
    errors.cep = ADDRESS_VALIDATION_MESSAGES.INVALID_CEP;
  }
  if (!address.street?.trim()) {
    errors.street = 'Rua é obrigatória';
  } else if (address.street.length < 3) {
    errors.street = ADDRESS_VALIDATION_MESSAGES.INVALID_STREET;
  }
  if (!address.number?.trim()) {
    errors.number = ADDRESS_VALIDATION_MESSAGES.REQUIRED_NUMBER;
  }
  if (!address.neighborhood?.trim()) {
    errors.neighborhood = ADDRESS_VALIDATION_MESSAGES.REQUIRED_NEIGHBORHOOD;
  }

  return errors;
};

export const isAddressValid = (address: Address): boolean => {
  const errors = validateAddressStep(address);
  return Object.keys(errors).length === 0;
};

```

## `src/features/denuncia/components/form/resumo-denuncia/resumo-denuncia.tsx`

```tsx
import React from 'react';
import './resumo-denuncia.css';
import 'jspdf-autotable';
import { ComplaintDraft } from '../../../types/denuncia';
import { buildComplaintSummarySections } from '../../../utils/complaint-summary';

interface ComplaintSummaryProps {
  complaint: ComplaintDraft;
  onValidationChange?: (isValid: boolean) => void;
}

export const ComplaintSummary: React.FC<ComplaintSummaryProps> = ({
  complaint,
  onValidationChange,
}) => {
  const sections = React.useMemo(
    () => buildComplaintSummarySections(complaint),
    [complaint]
  );

  React.useEffect(() => {
    onValidationChange?.(true);
  }, [onValidationChange]);

  return (
    <div className="complaint-summary">
      <div className="summary-sections">
        {sections.map((section) => (
          <div key={section.title} className="summary-section">
            <h3>{section.title}</h3>
            {section.description && (
              <p className="summary-section-description">{section.description}</p>
            )}

            <div className="details-list">
              {section.items.map((item) => (
                item.type === 'text' ? (
                  <p key={`${section.title}-${item.label}`}>
                    <strong>{item.label}:</strong> {item.value}
                  </p>
                ) : (
                  <div key={`${section.title}-${item.label}`} className="summary-photos-block">
                    <p>
                      <strong>{item.label}:</strong>{' '}
                      {item.photos.length > 0
                        ? `${item.photos.length} foto${item.photos.length > 1 ? 's' : ''} selecionada${item.photos.length > 1 ? 's' : ''}`
                        : item.emptyText}
                    </p>

                    {item.photos.length > 0 && (
                      <div className="summary-photo-grid">
                        {item.photos.map((photo) => (
                          <figure key={photo.id} className="summary-photo-card">
                            <img src={photo.dataUrl} alt={photo.name} className="summary-photo-image" />
                            <figcaption>{photo.name}</figcaption>
                          </figure>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
      <br />
    </div>
  );
};

```

## `src/features/denuncia/components/form/resumo-denuncia/resumo-denuncia.css`

```css
* {
  font-family: "Inter", 'sans-serif';
}

.complaint-summary h2 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #1f2937;
}

.summary-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-section {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.summary-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.summary-section-description {
  margin: 0 0 1rem;
  color: #6b7280;
  line-height: 1.5;
}

.summary-section strong {
  font-weight: 500;
  color: #4b5563;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.summary-photos-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.summary-photo-card {
  margin: 0;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #fff;
}

.summary-photo-image {
  display: block;
  width: 100%;
  height: 160px;
  object-fit: cover;
  background: #f3f4f6;
}

.summary-photo-card figcaption {
  padding: 0.75rem;
  color: #4b5563;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 640px) {

  .complaint-summary h2 {
    font-size: 1.5rem;
  }

  .summary-photo-grid {
    grid-template-columns: 1fr;
  }
}

```

## `src/features/denuncia/components/progress-bar/index.tsx`

```tsx
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

```

## `src/features/denuncia/components/progress-bar/components/step-indicator.tsx`

```tsx
import { Dispatch, SetStateAction } from "react";

export interface Step {
  number: number;
  label: string;
}

interface StepIndicatorProps {
  stepNumber: number;
  label: string;
  currentStep: number;
  isActive: boolean;
  isCurrent: boolean;
  onTap: (stepNumber: number) => void;
  isClickable: boolean;
  error: boolean;
  setError: Dispatch<SetStateAction<{ hasError: boolean; step: number; }>>
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  stepNumber,
  label,
  currentStep,
  isActive,
  isCurrent,
  onTap,
  isClickable,
  error,
  setError
}: StepIndicatorProps) => {
  return (
    <div
      className={`step-indicator-wrapper ${!isClickable ? 'disabled' : ''}`}
      onClick={() => {
        if (isClickable) {
          setError({
            step: -2,
            hasError: false,
          })
          onTap(stepNumber)
          return;
        }

        setError({
          step: currentStep,
          hasError: true,
        });
      }}
    >
      <div className={`step-indicator ${isCurrent ? 'active' : ''} ${isActive && !isCurrent ? 'completed' : ''} ${error && 'error'}`}>
        {stepNumber}
      </div>
      <div className={`step-label ${isCurrent ? 'visible' : ''} ${error && 'error'}`}>{label}</div>
    </div>
  );
};

```

## `src/features/denuncia/components/progress-bar/progress-bar-style.css`

```css
* {
  font-family: "Inter", 'sans-serif';
}

.progress-bar-container {
  --step-indicator-size: 42px;
  margin-bottom: 1.75rem;
  position: relative;
}

.progress-track {
  width: calc(100% - var(--step-indicator-size));
  margin: 0 calc(var(--step-indicator-size) / 2);
  height: 9px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  width: 14.28%; /* Representa 1/7 do progresso */
  background-color: var(--profession-accent, #24786B);
  transition: width 0.3s ease;
  border-radius: 4px;
}

/* Container dos indicadores de passo */
.step-indicators {
  display: grid;
  align-items: start;
  margin-top: -26px;
  position: relative;
  padding: 0;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  column-gap: 0.35rem;
}

/* Wrapper do indicador */
.step-indicator-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  min-width: 0;
}

/* Indicador de passo */
.step-indicator {
  width: var(--step-indicator-size);
  height: var(--step-indicator-size);
  border-radius: 50%;
  background-color: #fff;
  border: 2px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  color: #666;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

/* Estado ativo do indicador */
.step-indicator.active {
  background-color: var(--profession-accent, #24786B);
  border-color: var(--profession-accent, #24786B);
  color: white;
  transform: scale(1.08);
}

.step-indicator.error {
  border-color: #EF9A9A;
  background-color: #EF5350;
  color: #fff;
}

/* Estado completo do indicador */
.step-indicator.completed {
  background-color: var(--profession-accent, #24786B);
  border-color: var(--profession-accent, #24786B);
  color: white;
}

/* Label do passo */
.step-label {
  position: static;
  margin-top: 0.9rem;
  width: 100%;
  min-height: 2.4rem;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  opacity: 0;
  transform: translateY(-6px);
  transition: all 0.3s ease;
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
  text-align: center;
  line-height: 1.25;
}

.step-label.error {
  color: #EF5350;
}

/* Estados do label */
.step-indicator-wrapper:hover .step-label,
.step-label.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Estado hover do indicador */
.step-indicator-wrapper:hover .step-indicator:not(.active):not(.disabled) {
  border-color: var(--profession-accent, #24786B);
  transform: scale(1.1);
}

/* Responsividade */
@media (max-width: 640px) {
  .progress-bar-container {
    --step-indicator-size: 32px;
    margin-bottom: 1.25rem;
  }

  .step-indicators {
    margin-top: -1.3rem;
    column-gap: 0.25rem;
    padding: 0;
  }

  .step-indicator {
    font-size: 0.7rem;
  }

  .step-label {
    display: none;
  }
}

```

## `src/features/denuncia/components/navigation-inferior-control/index.tsx`

```tsx
import { useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import './navigation-inferior-control.css';
import { Modal } from '../../../inicio/components/modal';
import React from 'react';

interface NavigationInferiorControlProps {
  totalSteps: number;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  handleFinalStep: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export const NavigationInferiorControl = ({
  currentStep,
  setCurrentStep,
  totalSteps,
  handleFinalStep,
  isNextDisabled = false,
  isSubmitting = false,
}: NavigationInferiorControlProps) => {
  const navigate = useNavigate();

  const [modalVisible, setModalVisible] = React.useState(false);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <>
      {modalVisible && (
        <Modal
          title="Você tem certeza que deseja sair?"
          primaryLabel="Sair mesmo assim"
          secondayLabel="Não! Voltar de onde parei"
          onPrimary={() => navigate('/')}
          onSecondary={() => setModalVisible(false)}
        />
      )}
      <div className="navigation-buttons">
        {currentStep === 1 && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setModalVisible(true)}
            disabled={isSubmitting}
          >
            Voltar para tela inicial
          </button>
        )}

        {currentStep > 1 && (
          <button
            type="button"
            className="button button-secondary"
            onClick={handlePrevious}
            disabled={isSubmitting}
          >
            Voltar
          </button>
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            className="button button-primary"
            onClick={handleNext}
            disabled={isNextDisabled || isSubmitting}
          >
            Próximo
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary navigation-submit-button"
            onClick={handleFinalStep}
            disabled={isNextDisabled || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={18} className="navigation-button-spinner" />
                Enviando denúncia...
              </>
            ) : (
              'Enviar Denúncia'
            )}
          </button>
        )}
      </div>
    </>
  );
};

```

## `src/features/denuncia/components/navigation-inferior-control/navigation-inferior-control.css`

```css
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.navigation-buttons .button-primary {
  background-color: var(--profession-accent, #24786B);
  color: white;
}

.navigation-buttons .button-primary:hover {
  background-color: var(--profession-accent-strong, #206A5E);
}

.navigation-buttons .button-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.navigation-buttons .button-secondary:hover {
  background-color: #d1d5db;
}

@media (max-width: 640px) {
  .complaint-form {
    padding: 1rem;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.button:disabled:hover {
  transform: none;
}

.navigation-submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.navigation-button-spinner {
  animation: navigation-button-spin 1s linear infinite;
}

@keyframes navigation-button-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

```

## `src/features/denuncia/hooks/use-denuncia-form.ts`

```ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ComplaintDraft,
  DynamicAnswers,
  PublicForm,
  PublicProfession,
  createEmptyAddress,
} from '../types/denuncia';
import {
  PersistedComplaintDraft,
  deletePersistedComplaintDraft,
  getPersistedComplaintDraft,
  savePersistedComplaintDraft,
} from '../utils/complaint-draft-storage';
import { isDynamicAnswerEmpty, sanitizeDynamicAnswers } from '../utils/dynamic-form';

const STORAGE_KEY_PREFIX = 'encrypted_complaint_data_by_profession';
const LEGACY_STORAGE_KEY = 'encrypted_complaint_data';

type StoredComplaintDraft = PersistedComplaintDraft;

const decryptData = <T,>(encryptedData: string): T | null => {
  try {
    return JSON.parse(atob(encryptedData)) as T;
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    return null;
  }
};

const buildStorageKey = (professionId: number) =>
  `${STORAGE_KEY_PREFIX}:${professionId}`;

const hasAddressData = (address: ComplaintDraft['address']): boolean =>
  Boolean(
    address.hasNoInformation ||
      address.cep?.trim() ||
      address.street?.trim() ||
      address.number?.trim() ||
      address.neighborhood?.trim() ||
      address.councilRegion
  );

const hasDynamicAnswersData = (dynamicAnswers: DynamicAnswers): boolean =>
  Object.values(dynamicAnswers).some((stepAnswers) =>
    Object.values(stepAnswers).some((value) => !isDynamicAnswerEmpty(value))
  );

export const useComplaintForm = () => {
  const [publicProfessions, setPublicProfessions] = useState<PublicProfession[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<PublicProfession | null>(null);
  const [loadedForm, setLoadedFormState] = useState<PublicForm | null>(null);
  const [address, setAddress] = useState(createEmptyAddress);
  const [dynamicAnswers, setDynamicAnswers] = useState<DynamicAnswers>({});
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [isPersistenceEnabled, setIsPersistenceEnabled] = useState(false);

  const complaint = useMemo<ComplaintDraft>(
    () => ({
      selectedProfession,
      loadedForm,
      address,
      dynamicAnswers,
    }),
    [selectedProfession, loadedForm, address, dynamicAnswers]
  );

  useEffect(() => {
    if (!isPersistenceEnabled || !selectedProfession) {
      return;
    }

    void (async () => {
      try {
        await savePersistedComplaintDraft(selectedProfession.id, {
          address,
          dynamicAnswers,
        } satisfies StoredComplaintDraft);
      } catch (error) {
        console.error('Erro ao salvar dados do rascunho:', error);
      }
    })();
  }, [address, dynamicAnswers, isPersistenceEnabled, selectedProfession]);

  const setLoadedForm = (form: PublicForm | null) => {
    setLoadedFormState(form);
    setDynamicAnswers((prev) => sanitizeDynamicAnswers(form, prev));
  };

  const updateAddress = useCallback((nextAddress: ComplaintDraft['address']) => {
    setAddress(nextAddress);
  }, []);

  const updateDynamicAnswer = (
    stepId: number,
    fieldId: number,
    value: ComplaintDraft['dynamicAnswers'][string][string]
  ) => {
    setDynamicAnswers((prev) => ({
      ...prev,
      [String(stepId)]: {
        ...(prev[String(stepId)] ?? {}),
        [String(fieldId)]: value,
      },
    }));
  };

  const getLegacyStoredDraft = (professionId: number): StoredComplaintDraft | null => {
    const professionDraft = localStorage.getItem(buildStorageKey(professionId));
    if (professionDraft) {
      return decryptData<StoredComplaintDraft>(professionDraft);
    }

    const legacyDraft = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyDraft) {
      return decryptData<StoredComplaintDraft>(legacyDraft);
    }

    return null;
  };

  const getStoredDraft = async (professionId: number): Promise<StoredComplaintDraft | null> => {
    const indexedDbDraft = await getPersistedComplaintDraft(professionId);
    if (indexedDbDraft) {
      return indexedDbDraft;
    }

    const legacyDraft = getLegacyStoredDraft(professionId);
    if (!legacyDraft) {
      return null;
    }

    try {
      await savePersistedComplaintDraft(professionId, legacyDraft);
      localStorage.removeItem(buildStorageKey(professionId));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao migrar rascunho legado:', error);
    }

    return legacyDraft;
  };

  const hasExistingComplaintData = async (professionId: number): Promise<boolean> => {
    const storedDraft = await getStoredDraft(professionId);
    if (!storedDraft) return false;

    return hasAddressData(storedDraft.address) || hasDynamicAnswersData(storedDraft.dynamicAnswers);
  };

  const startNewDraft = (
    profession: PublicProfession,
    form: PublicForm,
    options?: { preserveAddress?: boolean }
  ) => {
    setSelectedProfession(profession);
    setLoadedFormState(form);
    setDynamicAnswers({});
    setAddress((prevAddress) =>
      options?.preserveAddress ? prevAddress : createEmptyAddress()
    );
    setIsPersistenceEnabled(true);
  };

  const restoreStoredDraft = (
    profession: PublicProfession,
    form: PublicForm,
    storedDraft: StoredComplaintDraft
  ) => {
    setSelectedProfession(profession);
    setLoadedFormState(form);
    setAddress(storedDraft.address ?? createEmptyAddress());
    setDynamicAnswers(sanitizeDynamicAnswers(form, storedDraft.dynamicAnswers ?? {}));
    setIsPersistenceEnabled(true);
  };

  const clearStoredData = async (professionId?: number) => {
    const targetProfessionId = professionId ?? selectedProfession?.id;

    try {
      if (targetProfessionId) {
        await deletePersistedComplaintDraft(targetProfessionId);
        localStorage.removeItem(buildStorageKey(targetProfessionId));
      }

      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar dados do rascunho:', error);
    }
  };

  return {
    complaint,
    publicProfessions,
    setPublicProfessions,
    selectedProfession,
    loadedForm,
    address,
    dynamicAnswers,
    updateAddress,
    updateDynamicAnswer,
    setLoadedForm,
    setSelectedProfession,
    startNewDraft,
    restoreStoredDraft,
    getStoredDraft,
    hasExistingComplaintData,
    pdf,
    setPdf,
    clearStoredData,
    setIsPersistenceEnabled,
  };
};

```

## `src/features/denuncia/hooks/use-step-validation.ts`

```ts
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

```

## `src/features/denuncia/hooks/use-steps-navigation.ts`

```ts
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

```

## `src/features/denuncia/utils/dynamic-form.ts`

```ts
import {
  ComplaintPhoto,
  DynamicAnswerValue,
  DynamicAnswers,
  PublicForm,
  PublicFormField,
  PublicFormFieldOption,
  SwitchConditionalAnswer,
  SwitchFieldPayloadAnswer,
} from '../types/denuncia';

export const DEFAULT_NOT_INFORMED = 'Não informado';
export const DEFAULT_NOT_APPLICABLE = 'Não se aplica';
export const DEFAULT_NO_PHOTOS = 'Nenhuma foto selecionada.';

const getDateParts = (value: string): [number, number, number] | null => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return [day, month, year];
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/').map(Number);
    return [day, month, year];
  }

  return null;
};

export const getFieldStorageKey = (id: number) => String(id);

export const getFieldOptions = (field: PublicFormField): PublicFormFieldOption[] =>
  field.opcoes ?? [];

export const createEmptySwitchConditionalAnswer = (): SwitchConditionalAnswer => ({
  valor: null,
  selecionados: [],
});

export const isSwitchConditionalAnswer = (
  value: DynamicAnswerValue
): value is SwitchConditionalAnswer =>
  Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      'valor' in value &&
      'selecionados' in value &&
      (((value as SwitchConditionalAnswer).valor === null) ||
        typeof (value as SwitchConditionalAnswer).valor === 'boolean') &&
      Array.isArray((value as SwitchConditionalAnswer).selecionados)
  );

const getAllowedConditionalFieldValues = (field: PublicFormField): string[] =>
  field.validacoes?.opcoes_condicionais_permitidas ??
  getFieldOptions(field).map((option) => option.valor);

export const normalizeSwitchConditionalAnswer = (
  field: PublicFormField,
  value: DynamicAnswerValue
): SwitchConditionalAnswer => {
  const allowedConditionalValues = getAllowedConditionalFieldValues(field);

  if (typeof value === 'boolean') {
    return {
      valor: value,
      selecionados: [],
    };
  }

  if (!isSwitchConditionalAnswer(value)) {
    return createEmptySwitchConditionalAnswer();
  }

  const normalizedSelectedValues = value.valor
    ? value.selecionados.filter(
        (item): item is string =>
          typeof item === 'string' &&
          (allowedConditionalValues.length === 0 || allowedConditionalValues.includes(item))
      )
    : [];

  return {
    valor: value.valor,
    selecionados: normalizedSelectedValues,
  };
};

export const getAllowedFieldValues = (field: PublicFormField): string[] =>
  field.validacoes?.opcoes_permitidas ??
  getFieldOptions(field).map((option) => option.valor);

export const normalizeCep = (value: string): string => value.replace(/\D/g, '');

export const isBirthDateField = (field: PublicFormField): boolean =>
  /nasc/i.test(`${field.nome} ${field.dica ?? ''}`);

export const isValidDateValue = (value: string): boolean => {
  const parts = getDateParts(value);
  if (!parts) return false;

  const [day, month, year] = parts;
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
};

export const formatDateValue = (value: string): string => {
  const parts = getDateParts(value);
  if (!parts || !isValidDateValue(value)) {
    return DEFAULT_NOT_INFORMED;
  }

  const [day, month, year] = parts;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

export const isDynamicAnswerEmpty = (value: DynamicAnswerValue): boolean => {
  if (value === undefined || value === null) return true;
  if (isSwitchConditionalAnswer(value)) {
    return value.valor === null;
  }
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

export const isPhotoAnswer = (
  value: DynamicAnswerValue
): value is ComplaintPhoto[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      'id' in item &&
      'name' in item &&
      'type' in item &&
      'size' in item &&
      'dataUrl' in item
  );

const sanitizePhotoAnswer = (value: DynamicAnswerValue): ComplaintPhoto[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !('id' in item) ||
      !('name' in item) ||
      !('type' in item) ||
      !('size' in item) ||
      !('dataUrl' in item)
    ) {
      return [];
    }

    const { id, name, type, size, dataUrl } = item as ComplaintPhoto;

    if (
      typeof id !== 'string' ||
      typeof name !== 'string' ||
      typeof type !== 'string' ||
      typeof size !== 'number' ||
      typeof dataUrl !== 'string'
    ) {
      return [];
    }

    return [{ id, name, type, size, dataUrl }];
  });
};

export const getFieldMaxPhotos = (field: PublicFormField): number => {
  const rawLimit = field.validacoes?.max_fotos ?? field.max_fotos ?? 1;

  if (typeof rawLimit !== 'number' || Number.isNaN(rawLimit) || rawLimit < 1) {
    return 1;
  }

  return Math.floor(rawLimit);
};

export const sanitizeDynamicAnswers = (
  form: PublicForm | null,
  dynamicAnswers: DynamicAnswers
): DynamicAnswers => {
  if (!form) return {};

  return form.passos.reduce<DynamicAnswers>((accumulator, passo) => {
    const stepAnswers = dynamicAnswers[getFieldStorageKey(passo.id)];
    if (!stepAnswers) return accumulator;

    const sanitizedStepAnswers = passo.campos.reduce<Record<string, DynamicAnswerValue>>(
      (fieldAccumulator, field) => {
        const answer = stepAnswers[getFieldStorageKey(field.id)];
        if (answer === undefined) return fieldAccumulator;

        if (field.tipo_campo === 'foto') {
          fieldAccumulator[getFieldStorageKey(field.id)] = sanitizePhotoAnswer(answer);
          return fieldAccumulator;
        }

        if (field.tipo_campo === 'switch') {
          fieldAccumulator[getFieldStorageKey(field.id)] = normalizeSwitchConditionalAnswer(
            field,
            answer
          );
          return fieldAccumulator;
        }

        fieldAccumulator[getFieldStorageKey(field.id)] = answer;
        return fieldAccumulator;
      },
      {}
    );

    if (Object.keys(sanitizedStepAnswers).length > 0) {
      accumulator[getFieldStorageKey(passo.id)] = sanitizedStepAnswers;
    }

    return accumulator;
  }, {});
};

export const validateDynamicField = (
  field: PublicFormField,
  value: DynamicAnswerValue
): string | undefined => {
  const stringValue = typeof value === 'string' ? value.trim() : '';
  const allowedValues = getAllowedFieldValues(field);

  switch (field.tipo_campo) {
    case 'texto':
    case 'textarea':
      if (field.obrigatorio && !stringValue) {
        return 'Este campo é obrigatório.';
      }
      return undefined;

    case 'numero':
      if (field.obrigatorio && !stringValue) {
        return 'Este campo é obrigatório.';
      }
      if (stringValue && Number.isNaN(Number(stringValue))) {
        return 'Informe um número válido.';
      }
      return undefined;

    case 'data': {
      if (field.obrigatorio && !stringValue) {
        return 'Este campo é obrigatório.';
      }
      if (!stringValue) {
        return undefined;
      }
      if (!isValidDateValue(stringValue)) {
        return 'Informe uma data válida.';
      }
      if (isBirthDateField(field)) {
        const parts = getDateParts(stringValue);
        if (!parts) return 'Informe uma data válida.';

        const [day, month, year] = parts;
        const date = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
          return 'A data de nascimento não pode ser futura.';
        }
      }
      return undefined;
    }

    case 'switch':
      {
        const switchValue = normalizeSwitchConditionalAnswer(field, value);
        const allowedConditionalValues = getAllowedConditionalFieldValues(field);

        if (field.obrigatorio && typeof switchValue.valor !== 'boolean') {
          return 'Este campo é obrigatório.';
        }

        if (
          switchValue.valor === true &&
          switchValue.selecionados.some(
            (item) =>
              allowedConditionalValues.length > 0 &&
              !allowedConditionalValues.includes(item)
          )
        ) {
          return 'Selecione apenas opções válidas.';
        }

        return undefined;
      }

    case 'select':
    case 'radio':
    case 'bairro':
      if (field.obrigatorio && !stringValue) {
        return 'Selecione uma opção.';
      }
      if (stringValue && allowedValues.length > 0 && !allowedValues.includes(stringValue)) {
        return 'Selecione uma opção válida.';
      }
      return undefined;

    case 'checkbox': {
      const arrayValue = Array.isArray(value)
        ? value.filter((item): item is string => typeof item === 'string')
        : [];
      if (field.obrigatorio && arrayValue.length === 0) {
        return 'Selecione ao menos uma opção.';
      }
      if (arrayValue.some((item) => !allowedValues.includes(item))) {
        return 'Selecione apenas opções válidas.';
      }
      return undefined;
    }

    case 'cep': {
      const digits = normalizeCep(stringValue);
      if (field.obrigatorio && digits.length === 0) {
        return 'Este campo é obrigatório.';
      }
      if (digits.length > 0 && digits.length !== 8) {
        return 'Informe um CEP válido.';
      }
      return undefined;
    }

    case 'foto':
      if (!isPhotoAnswer(value)) {
        return field.obrigatorio ? 'Envie ao menos uma foto.' : undefined;
      }
      if (field.obrigatorio && value.length === 0) {
        return 'Envie ao menos uma foto.';
      }
      if (value.length > getFieldMaxPhotos(field)) {
        return `Você pode enviar até ${getFieldMaxPhotos(field)} foto${getFieldMaxPhotos(field) > 1 ? 's' : ''}.`;
      }
      return undefined;

    default:
      return undefined;
  }
};

export const getFieldOptionLabel = (
  field: PublicFormField,
  optionValue: string
): string => {
  const option = getFieldOptions(field).find((item) => item.valor === optionValue);
  return option?.label ?? optionValue;
};

export const formatDynamicAnswerValue = (
  field: PublicFormField,
  value: DynamicAnswerValue
): string => {
  if (isDynamicAnswerEmpty(value)) {
    return field.tipo_campo === 'checkbox'
      ? DEFAULT_NOT_APPLICABLE
      : field.tipo_campo === 'foto'
        ? DEFAULT_NO_PHOTOS
        : DEFAULT_NOT_INFORMED;
  }

  switch (field.tipo_campo) {
    case 'switch':
      {
        const switchValue = normalizeSwitchConditionalAnswer(field, value);

        if (switchValue.valor === null) {
          return DEFAULT_NOT_INFORMED;
        }

        if (switchValue.valor !== true) {
          return 'Não';
        }

        if (switchValue.selecionados.length === 0) {
          return 'Sim';
        }

        const selectedLabels = switchValue.selecionados
          .map((item) => getFieldOptionLabel(field, item))
          .join(', ');

        return `Sim: ${selectedLabels}`;
      }

    case 'select':
    case 'radio':
    case 'bairro':
      return getFieldOptionLabel(field, String(value));

    case 'checkbox':
      return Array.isArray(value)
        ? value
            .filter((item): item is string => typeof item === 'string')
            .map((item) => getFieldOptionLabel(field, item))
            .join(', ')
        : DEFAULT_NOT_APPLICABLE;

    case 'data':
      return formatDateValue(String(value));

    case 'cep': {
      const digits = normalizeCep(String(value));
      return digits.length === 8
        ? `${digits.slice(0, 5)}-${digits.slice(5)}`
        : DEFAULT_NOT_INFORMED;
    }

    case 'foto':
      return isPhotoAnswer(value)
        ? `${value.length} foto${value.length > 1 ? 's' : ''} selecionada${value.length > 1 ? 's' : ''}`
        : DEFAULT_NO_PHOTOS;

    default:
      return String(value).trim() || DEFAULT_NOT_INFORMED;
  }
};

export const serializeSwitchFieldAnswer = (
  field: PublicFormField,
  value: DynamicAnswerValue
): SwitchFieldPayloadAnswer => {
  const normalizedValue = normalizeSwitchConditionalAnswer(field, value);

  return {
    campo_id: field.id,
    tipo_campo: 'switch',
    valor: normalizedValue.valor,
    ...(normalizedValue.valor === true && normalizedValue.selecionados.length > 0
      ? { opcoes_selecionadas: normalizedValue.selecionados }
      : {}),
  };
};

```

## `src/features/denuncia/utils/complaint-summary.ts`

```ts
import {
  ComplaintPhoto,
  ComplaintDraft,
  DynamicAnswerValue,
  PublicFormField,
  PublicFormStep,
} from '../types/denuncia';
import {
  DEFAULT_NO_PHOTOS,
  DEFAULT_NOT_INFORMED,
  formatDynamicAnswerValue,
  getFieldStorageKey,
  isPhotoAnswer,
} from './dynamic-form';

export interface ComplaintSummaryTextItem {
  type: 'text';
  label: string;
  value: string;
}

export interface ComplaintSummaryPhotoItem {
  type: 'photos';
  label: string;
  photos: ComplaintPhoto[];
  emptyText: string;
}

export type ComplaintSummaryItem = ComplaintSummaryTextItem | ComplaintSummaryPhotoItem;

export interface ComplaintSummarySection {
  title: string;
  description?: string | null;
  items: ComplaintSummaryItem[];
}

const getStepAnswerValue = (
  draft: ComplaintDraft,
  step: PublicFormStep,
  field: PublicFormField
): DynamicAnswerValue =>
  draft.dynamicAnswers[getFieldStorageKey(step.id)]?.[getFieldStorageKey(field.id)];

const getAddressSummaryItems = (draft: ComplaintDraft): ComplaintSummaryItem[] => {
  const councilContact = draft.address.councilRegion?.contato?.join(' | ');

  if (draft.address.hasNoInformation) {
  return [
    {
      type: 'text',
      label: 'Bairro aproximado',
      value: draft.address.neighborhood?.trim() || DEFAULT_NOT_INFORMED,
    },
    {
      type: 'text',
      label: 'Conselho Tutelar',
      value: draft.address.councilRegion?.nome || DEFAULT_NOT_INFORMED,
    },
    {
      type: 'text',
      label: 'Contato',
      value: councilContact || DEFAULT_NOT_INFORMED,
    },
  ];
  }

  return [
    {
      type: 'text',
      label: 'CEP',
      value: draft.address.cep?.trim() || DEFAULT_NOT_INFORMED,
    },
    {
      type: 'text',
      label: 'Rua',
      value: draft.address.street?.trim() || DEFAULT_NOT_INFORMED,
    },
    {
      type: 'text',
      label: 'Número',
      value: draft.address.number?.trim() || DEFAULT_NOT_INFORMED,
    },
    {
      type: 'text',
      label: 'Bairro',
      value: draft.address.neighborhood?.trim() || DEFAULT_NOT_INFORMED,
    },
    {
      type: 'text',
      label: 'Conselho Tutelar',
      value: draft.address.councilRegion?.nome || DEFAULT_NOT_INFORMED,
    },
    {
      type: 'text',
      label: 'Contato',
      value: councilContact || DEFAULT_NOT_INFORMED,
    },
  ];
};

const buildStepSummaryItem = (
  field: PublicFormField,
  value: DynamicAnswerValue
): ComplaintSummaryItem => {
  if (field.tipo_campo === 'foto') {
    return {
      type: 'photos',
      label: field.nome,
      photos: isPhotoAnswer(value) ? value : [],
      emptyText: DEFAULT_NO_PHOTOS,
    };
  }

  return {
    type: 'text',
    label: field.nome,
    value: formatDynamicAnswerValue(field, value),
  };
};

export const buildComplaintSummarySections = (
  draft: ComplaintDraft
): ComplaintSummarySection[] => {
  const sections: ComplaintSummarySection[] = [
    {
      title: 'Endereço e Conselho Tutelar',
      items: getAddressSummaryItems(draft),
    },
  ];

  if (!draft.loadedForm) {
    return sections;
  }

  draft.loadedForm.passos.forEach((step) => {
    sections.push({
      title: step.titulo,
      description: step.descricao,
      items: step.campos.map((field) =>
        buildStepSummaryItem(field, getStepAnswerValue(draft, step, field))
      ),
    });
  });

  return sections;
};

```

## `src/features/denuncia/types/denuncia.ts`

```ts
export type CouncilRegionName = 'norte' | 'sul' | 'leste' | 'oeste';

export interface CouncilRegion {
  setor: string;
  nome: string;
  regiao?: CouncilRegionName;
  contato: string[];
  bairros?: string[];
}

export interface Address {
  hasNoInformation: boolean;
  cep?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  councilRegion?: CouncilRegion;
}

export interface VictimData {
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
}

export enum BodyPart {
  'Cabeça' = 'Cabeça',
  Face = 'Face',
  'Pescoço' = 'Pescoço',
  Outro = 'Outro',
}

export type InjuryLocation = {
  [key in BodyPart]: boolean;
};

export type InjuryAgressionLocation = {
  [key in BodyPart | 'Outro']: boolean;
};

export interface CaseDetails {
  hasAggressionSigns: boolean;
  hasEyeInjury: boolean;
  hasBruises: boolean;
  bruisesLocation?: InjuryLocation;
  hasAbrasion: boolean;
  abrasionLocation?: InjuryLocation;
  hasLaceration: boolean;
  lacerationLocation?: InjuryLocation;
  hasBurns: boolean;
  burnsLocation?: InjuryLocation;
  hasBiteMarks: boolean;
  biteMarksLocation?: InjuryLocation;
  neglectSigns: boolean;
  psychologicalViolenceSigns: boolean;
}

export interface AdditionalInfo {
  extraInformation?: string;
  victimReport?: string;
  guardianVersion?: string;
}

export interface PublicProfession {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  status: number;
  dataCriacao?: string;
  dataUpdate?: string;
  dataDelete?: string | null;
}

export type PublicFormFieldType =
  | 'texto'
  | 'textarea'
  | 'numero'
  | 'data'
  | 'switch'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'bairro'
  | 'cep'
  | 'foto';

export interface PublicFormFieldOption {
  valor: string;
  label: string;
}

export interface PublicFormFieldValidations {
  obrigatorio: boolean;
  aceita_multiplos: boolean;
  opcoes_permitidas?: string[];
  opcoes_condicionais_quando?: 'sim';
  opcoes_condicionais_permitidas?: string[];
  opcoes_condicionais_aceita_multiplos?: boolean;
  max_fotos?: number | null;
}

export interface PublicFormField {
  id: number;
  formulario_passo_id?: number;
  ordem_index: number;
  nome: string;
  tipo_campo: PublicFormFieldType;
  opcoes?: PublicFormFieldOption[] | null;
  max_fotos?: number | null;
  obrigatorio: boolean;
  dica?: string | null;
  validacoes?: PublicFormFieldValidations;
  data_criacao?: string;
  data_update?: string | null;
}

export interface PublicFormStep {
  id: number;
  profissao_id?: number;
  ordem_index: number;
  titulo: string;
  descricao?: string | null;
  campos: PublicFormField[];
}

export interface PublicForm {
  profissao: {
    id: number;
    nome: string;
    descricao?: string | null;
    cor: string;
  };
  passos: PublicFormStep[];
}

export interface ComplaintPhoto {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

export interface SwitchConditionalAnswer {
  valor: boolean | null;
  selecionados: string[];
}

export interface SwitchFieldPayloadAnswer {
  campo_id: number;
  tipo_campo: 'switch';
  valor: boolean | null;
  opcoes_selecionadas?: string[];
}

export type DynamicAnswerValue =
  | string
  | boolean
  | string[]
  | ComplaintPhoto[]
  | SwitchConditionalAnswer
  | null
  | undefined;

export type DynamicAnswers = Record<string, Record<string, DynamicAnswerValue>>;

export interface ComplaintDraft {
  selectedProfession: PublicProfession | null;
  loadedForm: PublicForm | null;
  address: Address;
  dynamicAnswers: DynamicAnswers;
}

export interface ComplaintStepDefinition {
  number: number;
  label: string;
}

export const createEmptyAddress = (): Address => ({
  hasNoInformation: false,
  cep: '',
  street: '',
  number: '',
  neighborhood: '',
  councilRegion: undefined,
});

export const createEmptyComplaintDraft = (): ComplaintDraft => ({
  selectedProfession: null,
  loadedForm: null,
  address: createEmptyAddress(),
  dynamicAnswers: {},
});

```

## `src/shared/components/select/index.tsx`

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import './select-style.css';

export interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<string | CustomSelectOption>;
  placeholder?: string;
  label?: string;
  onBlur?: () => void;
  error?: boolean;
  searchPlaceholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção',
  label,
  onBlur,
  error,
  searchPlaceholder = 'Buscar opção...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<CustomSelectOption[]>([]);
  const selectRef = useRef<HTMLDivElement>(null);
  const normalizedOptions = React.useMemo(
    () =>
      options.map((option) =>
        typeof option === 'string' ? { label: option, value: option } : option
      ),
    [options]
  );
  const selectedOption = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const filtered = normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [normalizedOptions, searchTerm]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="custom-select-container" ref={selectRef}>
      {label && <label className="custom-select-label">{label}</label>}

      <div
        className={`custom-select-header ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          onBlur?.();
        }}
      >
        {selectedOption ? (
          <div className="selected-value">
            <span className="selected-value-label">{selectedOption.label}</span>
            <button
              type="button"
              className="clear-button"
              onClick={clearSelection}
              aria-label="Limpar seleção"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <ChevronDown className={`arrow-icon ${isOpen ? 'open' : ''}`} size={20} />
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="options-container">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`option ${value === option.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="no-results">Nenhum resultado encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

```

## `src/shared/components/select/select-style.css`

```css
.custom-select-container {
  position: relative;
  width: 100%;
}

.custom-select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.custom-select-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  min-height: 42px;
  transition: all 0.2s ease;
}

.custom-select-header:hover {
  border-color: var(--profession-accent, #24786B);
}

.custom-select-header.open {
  border-color: var(--profession-accent, #24786B);
  box-shadow: 0 0 0 2px rgba(var(--profession-accent-rgb, 36, 120, 107), 0.1);
}

.selected-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 0.5rem;
}

.selected-value-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  color: #9ca3af;
}

.arrow-icon {
  color: #6b7280;
  transition: transform 0.2s ease;
}

.arrow-icon.open {
  transform: rotate(180deg);
}

.clear-button {
  padding: 2px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-button:hover {
  color: #4b5563;
  background-color: #f3f4f6;
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  max-height: 300px;
  display: flex;
  flex-direction: column;
}

.search-container {
  position: relative;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.search-icon {
  position: absolute;
  left: 1.25rem; /* Aumentado de 1rem para 1.25rem */
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none; 
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.5rem 0.5rem 2.5rem !important; /* Aumentado o padding-left de 2rem para 2.5rem */
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--profession-accent, #24786B);
  box-shadow: 0 0 0 2px rgba(var(--profession-accent-rgb, 36, 120, 107), 0.1);
}

.options-container {
  overflow-y: auto;
  max-height: 240px;
  padding: 0.5rem 0;
}

.option {
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option:hover {
  background-color: #f3f4f6;
}

.option.selected {
  background-color: rgba(var(--profession-accent-rgb, 36, 120, 107), 0.1);
  color: var(--profession-accent, #24786B);
}

.no-results {
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Estilização da scrollbar */
.options-container::-webkit-scrollbar {
  width: 6px;
}

.options-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.options-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Error styles */

.custom-select-header.error {
  border-color: #dc2626;
}

.custom-select-header.error:hover {
  border-color: #dc2626;
}

.custom-select-header.error.open {
  border-color: #dc2626;
  box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.1);
}

```

## `src/shared/components/checkbox/index.tsx`

```tsx
import React from 'react';
import './checkbox-style.css';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false
}) => {
  return (
    <label className="custom-checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="checkbox-mark"></span>
      <span className="checkbox-label">{label}</span>
    </label>
  );
};

export default CustomCheckbox;

```

## `src/shared/components/checkbox/checkbox-style.css`

```css
.custom-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 60px;
  padding: 0.45rem 0;
  border-radius: 0;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
}

.checkbox-mark {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.custom-checkbox:hover input ~ .checkbox-mark {
  border-color: var(--profession-accent, #24786B);
  box-shadow: 0 0 0 3px rgba(var(--profession-accent-rgb, 36, 120, 107), 0.08);
}

.custom-checkbox input:checked ~ .checkbox-mark {
  background-color: var(--profession-accent, #24786B);
  border-color: var(--profession-accent, #24786B);
}

.checkbox-mark:after {
  content: '';
  position: absolute;
  display: none;
  left: 50%;
  top: 50%;
  width: 6px;
  height: 11px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -58%) rotate(45deg);
}

.custom-checkbox input:checked ~ .checkbox-mark:after {
  display: block;
}

.checkbox-label {
  display: flex;
  align-items: center;
  width: 100%;
  margin-left: 14px;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.custom-checkbox input:disabled ~ .checkbox-mark {
  background-color: #e5e7eb;
  border-color: #e5e7eb;
  cursor: not-allowed;
}

.custom-checkbox input:disabled ~ .checkbox-label {
  color: #9ca3af;
  cursor: not-allowed;
}

.custom-checkbox:has(input:focus-visible) {
  background: rgba(var(--profession-accent-rgb, 36, 120, 107), 0.08);
}

.custom-checkbox:has(input:checked) .checkbox-label {
  color: #1f2937;
}

```

## `src/shared/utils/string-utils.ts`

```ts
export function formatarCEP(cep: string) {
  cep = cep.replace(/\D/g, '');

  if (cep.length > 8) cep = cep.slice(0, 8)
  if (cep.length < 8) return cep;

  return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

```
