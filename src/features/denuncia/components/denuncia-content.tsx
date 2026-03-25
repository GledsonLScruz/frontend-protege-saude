import React, { useEffect, useMemo, useState } from 'react';

import './denuncia-content.css';

import { useNavigate } from 'react-router-dom';
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

export const ComplaintForm: React.FC = () => {
  const navigate = useNavigate();
  const denunciaController = useMemo(() => new DenunciaController(), []);

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

  const handleFinalStep = async () => {
    setSubmitState({ status: 'loading' });

    try {
      const pdfBlob = generatePDF(complaint);
      setPdf(pdfBlob);

      const protocol = `DEN-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 1000000
      )
        .toString()
        .padStart(6, '0')}`;

      const result = await denunciaController.submitDenuncia(complaint, pdfBlob, protocol);
      setSubmitState(result);

      if (result.status === 'success' && result.protocol) {
        clearStoredData(selectedProfession?.id);
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

  const handleStartDraft = () => {
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

    if (hasExistingComplaintData(pendingProfession.id)) {
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
    if (!resumeDraftState) {
      return;
    }

    const storedDraft = getStoredDraft(resumeDraftState.profession.id);

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
  };

  const handleNewDraft = () => {
    if (!resumeDraftState) {
      return;
    }

    clearStoredData(resumeDraftState.profession.id);
    startNewDraft(resumeDraftState.profession, resumeDraftState.form, {
      preserveAddress: Boolean(complaint.address.neighborhood?.trim()),
    });
    resetWizardState();
    setIsProfessionConfirmed(true);
    setResumeDraftState(null);
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
          primaryLabel="Não! Voltar para onde estava"
          onPrimary={() => setModalVisible(false)}
          onSecondary={() => navigate('/')}
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
            <button className="change-profession-button" onClick={handleChangeProfession}>
              Trocar profissão
            </button>
          )}
        </Header.Right>
      </Header>

      <div className="complaint-form">
        <br />
        <br />
        <br />

        {!isProfessionConfirmed ? (
          <ProfessionSelectionStep
            professions={publicProfessions}
            selectedProfessionId={selectedProfessionId}
            onSelect={(professionId) => void handleProfessionSelect(professionId)}
            onContinue={handleStartDraft}
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
              <StepsRenderer
                currentStep={currentStep}
                steps={steps}
                complaint={complaint}
                neighborhoods={neighborhoods}
                findConselhoByBairro={findConselhoByBairro}
                onAddressUpdate={updateAddress}
                onDynamicAnswerUpdate={updateDynamicAnswer}
                onValidationChange={(isValid) => updateStepValidation(currentStep, isValid)}
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
                isNextDisabled={isNextButtonDisabled || submitState.status === 'loading'}
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
