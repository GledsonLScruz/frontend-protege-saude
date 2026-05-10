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
