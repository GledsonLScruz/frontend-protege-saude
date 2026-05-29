# Formulario Dinamico - Codigo Para Preview Admin

Este documento consolida os arquivos usados para montar a tela atual de formulario dinamico do fluxo de denuncia. A ideia e servir como referencia para replicar a experiencia em um preview no painel admin.

## Como A Tela E Montada

- `ComplaintForm` carrega profissoes, formulario publico, conselhos tutelares e controla o wizard.
- `ProfessionSelectionStep` escolhe a profissao e dispara o carregamento do formulario correto.
- `StepsRenderer` alterna entre endereco, etapa dinamica e resumo.
- `DynamicFormStep` renderiza os campos vindos da API conforme `tipo_campo`.
- `AddressStep` resolve endereco/bairro/conselho tutelar.
- `ProgressBar` e `NavigationInferiorControl` controlam a navegacao entre etapas.
- `ComplaintSummary` mostra o resumo e os utilitarios tambem alimentam o PDF.

## Indice De Arquivos E Uso

### Tela Principal Do Formulario

- `src/features/denuncia/components/denuncia-content.tsx`: Orquestra a tela do fluxo de denuncia: carrega profissoes, busca o formulario publico por profissao, controla rascunho, tema por cor da profissao, steps, envio e modais.
- `src/features/denuncia/components/denuncia-content.css`: Define o layout visual da tela principal do formulario, container do step, botoes, overlay de envio e adaptacoes responsivas.
- `src/features/denuncia/components/form/profession-selection-step.tsx`: Renderiza a primeira tela do fluxo, onde o usuario escolhe a profissao antes de carregar o formulario dinamico.
- `src/features/denuncia/components/form/profession-selection-step.css`: Estiliza a tela de selecao de profissao, card, feedbacks, preview da profissao e botao de continuar.
- `src/features/denuncia/components/form/steps-renderer.tsx`: Escolhe qual etapa renderizar: endereco, uma etapa dinamica do formulario carregado ou resumo final.
- `src/features/denuncia/components/form/dynamic-form-step.tsx`: Renderiza cada passo dinamico recebido da API, suportando texto, textarea, numero, data, select, radio, checkbox, bairro, CEP, switch condicional e foto.
- `src/features/denuncia/components/form/dynamic-form-step.css`: Estiliza os campos dinamicos, labels, badges, tooltip, inputs, radios, checkboxes, switch condicional e upload/listagem de fotos.

### Etapa De Endereco

- `src/features/denuncia/components/form/address/address-step.tsx`: Renderiza e valida a etapa de endereco da vitima, busca dados por CEP e associa o bairro ao conselho tutelar.
- `src/features/denuncia/components/form/address/address-step.css`: Estiliza os campos da etapa de endereco, mensagens de erro e tooltip informativo.
- `src/features/denuncia/components/form/address/address-controller.ts`: Camada intermediaria usada pela etapa de endereco para consultar CEP via service.
- `src/features/denuncia/components/form/address/address-step-validation.tsx`: Centraliza as regras de validacao dos campos de endereco.
- `src/features/denuncia/components/form/address/service/address-service.ts`: Consulta a API ViaCEP para preencher logradouro e bairro a partir do CEP.
- `src/features/denuncia/components/form/address/@types/index.ts`: Define o tipo da resposta esperada da consulta de CEP.

### Resumo

- `src/features/denuncia/components/form/resumo-denuncia/resumo-denuncia.tsx`: Renderiza o resumo final da denuncia a partir das secoes montadas pelo utilitario de resumo.
- `src/features/denuncia/components/form/resumo-denuncia/resumo-denuncia.css`: Estiliza as secoes, lista de detalhes e preview de fotos do resumo final.
- `src/features/denuncia/components/form/resumo-denuncia/types.d.ts`: Tipagens auxiliares relacionadas ao resumo da denuncia.

### Navegacao, Progresso E Modais

- `src/features/denuncia/components/progress-bar/index.tsx`: Renderiza a barra de progresso e controla quais etapas podem ser acessadas.
- `src/features/denuncia/components/progress-bar/progress-bar-style.css`: Estiliza barra de progresso, trilha, indicadores e estados responsivos.
- `src/features/denuncia/components/progress-bar/components/step-indicator.tsx`: Renderiza cada indicador numerado de etapa e trata clique em etapa valida ou invalida.
- `src/features/denuncia/components/navigation-inferior-control/index.tsx`: Renderiza os botoes inferiores de voltar, proximo e enviar denuncia, incluindo estado de envio.
- `src/features/denuncia/components/navigation-inferior-control/navigation-inferior-control.css`: Estiliza os botoes inferiores e o spinner do envio.
- `src/features/denuncia/components/modal_feedback/index.tsx`: Modal de feedback usado para informar erro ou sucesso no fluxo de denuncia.
- `src/features/denuncia/components/modal_feedback/modal_feedback.css`: Estiliza o modal de feedback, icones, botoes e overlay.
- `src/features/inicio/components/modal/index.tsx`: Modal generico reutilizado para confirmar saida do fluxo e retomada/criacao de rascunho.
- `src/features/inicio/components/modal/modal.css`: Estiliza o modal generico reutilizado no fluxo.

### Estado, API, Validacao E Utilitarios

- `src/features/denuncia/denuncia-controller.ts`: Controller do fluxo de denuncia, encapsulando chamadas ao service e exposicao de metodos usados pela tela.
- `src/features/denuncia/denuncia-service.ts`: Service responsavel por chamar a API publica de profissoes/formulario, conselhos tutelares e envio da denuncia.
- `src/features/denuncia/types/denuncia.ts`: Contrato de tipos do fluxo: profissao, formulario publico, campos dinamicos, respostas, fotos, endereco e draft.
- `src/features/denuncia/hooks/use-denuncia-form.ts`: Hook principal de estado do formulario, incluindo profissao selecionada, formulario carregado, endereco, respostas dinamicas, PDF e persistencia de rascunho.
- `src/features/denuncia/hooks/use-step-validation.ts`: Hook que controla validade de cada etapa do wizard.
- `src/features/denuncia/hooks/use-steps-navigation.ts`: Hook que controla etapa atual e bloqueia navegacao para etapas futuras sem validacao.
- `src/features/denuncia/utils/dynamic-form.ts`: Utilitario central do formulario dinamico: normalizacao, validacao, sanitizacao, formatacao de respostas e serializacao de switch.
- `src/features/denuncia/utils/complaint-summary.ts`: Monta as secoes e itens exibidos no resumo e usados tambem na geracao do PDF.
- `src/features/denuncia/utils/complaint-draft-storage.ts`: Persistencia de rascunhos por profissao no IndexedDB.
- `src/shared/utils/generate-pdf.ts`: Gera o PDF da denuncia a partir do mesmo resumo usado na tela final.
- `src/shared/utils/string-utils.ts`: Utilitario compartilhado para formatacao de CEP.

### Componentes Compartilhados E Estilos

- `src/shared/components/select/index.tsx`: Select customizado com busca, limpeza de valor e suporte a erro, usado na profissao, bairro e campos dinamicos select/bairro.
- `src/shared/components/select/select-style.css`: Estilos do select customizado e dropdown com busca.
- `src/shared/components/checkbox/index.tsx`: Checkbox customizado usado nos campos dinamicos de checkbox e nas opcoes condicionais do switch.
- `src/shared/components/checkbox/checkbox-style.css`: Estilos do checkbox customizado.
- `src/shared/components/header/index.tsx`: Raiz do header compartilhado usado no topo da tela de denuncia.
- `src/shared/components/header/header-style.css`: Estilos do header, posicionamento, botoes e responsividade.
- `src/shared/components/header/header-context.tsx`: Contexto interno do header para estado de menu quando usado.
- `src/shared/components/header/components/index.ts`: Compoe a API Header.Left, Header.Center, Header.Right, Header.Title, Header.BackButton e outros subcomponentes.
- `src/shared/components/header/components/back-button.tsx`: Botao de voltar usado no header do fluxo de denuncia.
- `src/shared/components/header/components/header-title.tsx`: Titulo central do header.
- `src/shared/components/header/components/positions.tsx`: Slots de posicionamento esquerdo, centro e direito do header.
- `src/shared/components/header/components/header-logo.tsx`: Logo compartilhado do header; nao aparece no uso atual da tela de denuncia, mas faz parte da composicao exportada do Header.
- `src/shared/components/header/components/menu-button.tsx`: Botao de menu compartilhado; nao aparece no uso atual da tela de denuncia, mas faz parte da composicao exportada do Header.
- `src/shared/components/header/components/notifications-button.tsx`: Botao de notificacoes compartilhado; nao aparece no uso atual da tela de denuncia, mas faz parte da composicao exportada do Header.
- `src/shared/components/sidebar/use-sidebar-context.tsx`: Provider global usado em App.tsx envolvendo as rotas, incluindo a rota de denuncia.

## Codigo Fonte

## Tela Principal Do Formulario

### `src/features/denuncia/components/denuncia-content.tsx`

**Como e usado:** Orquestra a tela do fluxo de denuncia: carrega profissoes, busca o formulario publico por profissao, controla rascunho, tema por cor da profissao, steps, envio e modais.

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

### `src/features/denuncia/components/denuncia-content.css`

**Como e usado:** Define o layout visual da tela principal do formulario, container do step, botoes, overlay de envio e adaptacoes responsivas.

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

### `src/features/denuncia/components/form/profession-selection-step.tsx`

**Como e usado:** Renderiza a primeira tela do fluxo, onde o usuario escolhe a profissao antes de carregar o formulario dinamico.

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

### `src/features/denuncia/components/form/profession-selection-step.css`

**Como e usado:** Estiliza a tela de selecao de profissao, card, feedbacks, preview da profissao e botao de continuar.

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

### `src/features/denuncia/components/form/steps-renderer.tsx`

**Como e usado:** Escolhe qual etapa renderizar: endereco, uma etapa dinamica do formulario carregado ou resumo final.

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

### `src/features/denuncia/components/form/dynamic-form-step.tsx`

**Como e usado:** Renderiza cada passo dinamico recebido da API, suportando texto, textarea, numero, data, select, radio, checkbox, bairro, CEP, switch condicional e foto.

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

### `src/features/denuncia/components/form/dynamic-form-step.css`

**Como e usado:** Estiliza os campos dinamicos, labels, badges, tooltip, inputs, radios, checkboxes, switch condicional e upload/listagem de fotos.

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

## Etapa De Endereco

### `src/features/denuncia/components/form/address/address-step.tsx`

**Como e usado:** Renderiza e valida a etapa de endereco da vitima, busca dados por CEP e associa o bairro ao conselho tutelar.

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

### `src/features/denuncia/components/form/address/address-step.css`

**Como e usado:** Estiliza os campos da etapa de endereco, mensagens de erro e tooltip informativo.

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

### `src/features/denuncia/components/form/address/address-controller.ts`

**Como e usado:** Camada intermediaria usada pela etapa de endereco para consultar CEP via service.

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

### `src/features/denuncia/components/form/address/address-step-validation.tsx`

**Como e usado:** Centraliza as regras de validacao dos campos de endereco.

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

### `src/features/denuncia/components/form/address/service/address-service.ts`

**Como e usado:** Consulta a API ViaCEP para preencher logradouro e bairro a partir do CEP.

```ts
import axios from 'axios';
import { CepResponse } from '../@types';

export class AddressService {
  private readonly API_URL = 'https://viacep.com.br/ws';

  getAddressByCep = async (cep: string): Promise<CepResponse> => {
    try {
      const response = await axios.get(`${this.API_URL}/${cep}/json`);
      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Erro ao enviar denúncia');
      }

      return response.data as CepResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Erro ao enviar denúncia');
      }
      throw error;
    }
  }
}
```

### `src/features/denuncia/components/form/address/@types/index.ts`

**Como e usado:** Define o tipo da resposta esperada da consulta de CEP.

```ts
export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  estado: string;
}
```

## Resumo

### `src/features/denuncia/components/form/resumo-denuncia/resumo-denuncia.tsx`

**Como e usado:** Renderiza o resumo final da denuncia a partir das secoes montadas pelo utilitario de resumo.

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

### `src/features/denuncia/components/form/resumo-denuncia/resumo-denuncia.css`

**Como e usado:** Estiliza as secoes, lista de detalhes e preview de fotos do resumo final.

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

### `src/features/denuncia/components/form/resumo-denuncia/types.d.ts`

**Como e usado:** Tipagens auxiliares relacionadas ao resumo da denuncia.

```ts
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}
```

## Navegacao, Progresso E Modais

### `src/features/denuncia/components/progress-bar/index.tsx`

**Como e usado:** Renderiza a barra de progresso e controla quais etapas podem ser acessadas.

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

### `src/features/denuncia/components/progress-bar/progress-bar-style.css`

**Como e usado:** Estiliza barra de progresso, trilha, indicadores e estados responsivos.

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

### `src/features/denuncia/components/progress-bar/components/step-indicator.tsx`

**Como e usado:** Renderiza cada indicador numerado de etapa e trata clique em etapa valida ou invalida.

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

### `src/features/denuncia/components/navigation-inferior-control/index.tsx`

**Como e usado:** Renderiza os botoes inferiores de voltar, proximo e enviar denuncia, incluindo estado de envio.

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

### `src/features/denuncia/components/navigation-inferior-control/navigation-inferior-control.css`

**Como e usado:** Estiliza os botoes inferiores e o spinner do envio.

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

### `src/features/denuncia/components/modal_feedback/index.tsx`

**Como e usado:** Modal de feedback usado para informar erro ou sucesso no fluxo de denuncia.

```tsx
import React from 'react';
import './modal_feedback.css';

interface FeedbackModalProps {
  isSuccess: boolean;
  message: string;
  onClose: () => void;
  onRedirect: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isSuccess,
  message,
  onClose,
  onRedirect
}) => {
  return (
    <div className="modal-overlay">
      <div className="feedback-modal">
        <div className={`modal-icon ${isSuccess ? 'success' : 'error'}`}>
          {isSuccess ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 6L9 17L4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6L18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        <h3>{isSuccess ? 'Sucesso!' : 'Erro'}</h3>
        <p>{message}</p>

        <div className="modal-buttons">
          {isSuccess ? (
            <button
              className="button button-primary"
              onClick={onRedirect}
            >
              Voltar ao Início
            </button>
          ) : (
            <>
              <button
                className="button button-secondary"
                onClick={onClose}
              >
                Tentar Novamente
              </button>
              <button
                className="button button-primary"
                onClick={onRedirect}
              >
                Voltar ao Início
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
```

### `src/features/denuncia/components/modal_feedback/modal_feedback.css`

**Como e usado:** Estiliza o modal de feedback, icones, botoes e overlay.

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.feedback-modal {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.modal-icon.success {
  background-color: #10B981;
  color: white;
}

.modal-icon.error {
  background-color: #EF4444;
  color: white;
}

.feedback-modal h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #1F2937;
}

.feedback-modal p {
  color: #6B7280;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.button-primary {
  background-color: var(--profession-accent, var(--primary-color, #24786B));
  color: white;
}

.button-primary:hover {
  background-color: var(--profession-accent-strong, #206A5E);
}

.button-secondary {
  background-color: #E5E7EB;
  color: #374151;
}

.button-secondary:hover {
  background-color: #D1D5DB;
}

@media (max-width: 640px) {
  .feedback-modal {
    padding: 1.5rem;
  }

  .modal-buttons {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }
}
```

### `src/features/inicio/components/modal/index.tsx`

**Como e usado:** Modal generico reutilizado para confirmar saida do fluxo e retomada/criacao de rascunho.

```tsx
import React from "react";
import './modal.css';

interface ModalProps {
  title: string;
  warning?: string;
  onPrimary: () => void;
  onSecondary: () => void;
  primaryLabel: string;
  secondayLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({ title, primaryLabel, warning, secondayLabel = 'Sair mesmo assim', onPrimary, onSecondary }: ModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        { warning && <p className="warning">{warning}</p>}
        <div className="modal-button-content">
          <button className="modal-button" onClick={onPrimary}>
            {primaryLabel}
          </button>
          <button className="modal-close secondary" onClick={onSecondary}>
           {secondayLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### `src/features/inicio/components/modal/modal.css`

**Como e usado:** Estiliza o modal generico reutilizado no fluxo.

```css
/* Estilo do Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  max-width: 30rem;
  margin: 1rem;
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.warning {
  font-size: 0.7rem;
  color: #757575;
}

.modal-button-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.modal-button {
  background-color: var(--primary-color, #24786B);
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.modal-button:hover {
  background-color: var(--profession-accent-strong, #206A5E);
}

.modal-close {
  background: none;
  border: none;
  color: #6c757d;
  margin-top: 10px;
  cursor: pointer;
}

.modal-close.secondary:hover {
  transition: all 0.2s ease;
}

.modal-close.secondary:hover {
  color: var(--primary-color, #24786B);

}
```

## Estado, API, Validacao E Utilitarios

### `src/features/denuncia/denuncia-controller.ts`

**Como e usado:** Controller do fluxo de denuncia, encapsulando chamadas ao service e exposicao de metodos usados pela tela.

```ts
import { DenunciaService } from './denuncia-service';
import {
  ComplaintDraft,
  CouncilRegion,
  PublicForm,
  PublicProfession,
} from './types/denuncia';

export type DenunciaState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  protocol?: string;
};

export class DenunciaController {
  private service: DenunciaService;

  constructor() {
    this.service = new DenunciaService();
  }

  async listPublicProfessions(): Promise<PublicProfession[]> {
    return this.service.listPublicProfessions();
  }

  async getPublicForm(professionId: number): Promise<PublicForm> {
    return this.service.getPublicForm(professionId);
  }

  async getCampinaGrandeCouncils(): Promise<CouncilRegion[]> {
    return this.service.getCampinaGrandeCouncils();
  }

  async submitDenuncia(
    complaint: ComplaintDraft,
    pdf: Blob,
    protocol: string
  ): Promise<DenunciaState> {
    try {
      const response = await this.service.submitComplaint(complaint, pdf, protocol);
      return {
        status: 'success',
        protocol: response.protocolo,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Erro ao enviar denúncia.',
      };
    }
  }

  getAllBairros = (conselhosRegionais: CouncilRegion[]): string[] =>
    this.service.getAllBairros(conselhosRegionais);

  findConselhoByBairro = (
    bairro: string,
    conselhosRegionais: CouncilRegion[]
  ): CouncilRegion | undefined => this.service.findConselhoByBairro(bairro, conselhosRegionais);
}
```

### `src/features/denuncia/denuncia-service.ts`

**Como e usado:** Service responsavel por chamar a API publica de profissoes/formulario, conselhos tutelares e envio da denuncia.

```ts
import axios from 'axios';
import {
  ComplaintDraft,
  CouncilRegion,
  CouncilRegionName,
  PublicForm,
  PublicProfession,
} from './types/denuncia';

interface PublicProfessionApiResponse {
  id: number;
  nome: string;
  descricao: string | null;
  cor: string | null;
  status: number;
  data_criacao?: string;
  data_update?: string;
  data_delete?: string | null;
}

interface CouncilTutelarCityResponse {
  cidade: string;
  conselhosRegionais?: Array<{
    setor: string;
    nome: string;
    contato: string[];
    bairros: string[];
  }>;
}

interface SubmitComplaintResponse {
  message: string;
  protocolo: string;
}

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';

const normalizeApiBaseUrl = (rawBaseUrl: string | undefined): string => {
  const trimmedBaseUrl = rawBaseUrl?.trim();

  if (!trimmedBaseUrl) {
    return DEFAULT_API_BASE_URL;
  }

  const withoutTrailingSlash = trimmedBaseUrl.replace(/\/+$/, '');
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

const unwrapArrayResponse = <T,>(payload: unknown, keys: string[]): T[] | null => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const recordPayload = payload as Record<string, unknown>;

  for (const key of keys) {
    const nestedValue = recordPayload[key];
    if (Array.isArray(nestedValue)) {
      return nestedValue as T[];
    }
  }

  if (Array.isArray(recordPayload.data)) {
    return recordPayload.data as T[];
  }

  return null;
};

const mapProfession = (
  profession: PublicProfessionApiResponse
): PublicProfession => ({
  id: profession.id,
  nome: profession.nome,
  descricao: profession.descricao ?? '',
  cor: profession.cor ?? '',
  status: profession.status,
  dataCriacao: profession.data_criacao,
  dataUpdate: profession.data_update,
  dataDelete: profession.data_delete ?? null,
});

const inferCouncilRegion = (label: string): CouncilRegionName | undefined => {
  const normalizedLabel = label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  if (normalizedLabel.includes('norte')) return 'norte';
  if (normalizedLabel.includes('sul')) return 'sul';
  if (normalizedLabel.includes('leste')) return 'leste';
  if (normalizedLabel.includes('oeste')) return 'oeste';

  return undefined;
};

const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      error.response?.data?.error ??
      error.response?.data?.message;

    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
      return apiMessage;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
};

export class DenunciaService {
  private readonly API_URL = '/api';

  async listPublicProfessions(): Promise<PublicProfession[]> {
    try {
      const response = await axios.get<unknown>(
        `${this.API_URL}/public/profissoes`
      );

      const professions = unwrapArrayResponse<PublicProfessionApiResponse>(response.data, [
        'profissoes',
        'professions',
        'items',
      ]);

      if (!professions) {
        throw new Error('Resposta inválida ao carregar profissões.');
      }

      return professions.map(mapProfession);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível carregar as profissões disponíveis.')
      );
    }
  }

  async getPublicForm(professionId: number): Promise<PublicForm> {
    try {
      const response = await axios.get<PublicForm>(
        `${this.API_URL}/public/profissoes/${professionId}/formulario`
      );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível carregar o formulário desta profissão.')
      );
    }
  }

  async getCampinaGrandeCouncils(): Promise<CouncilRegion[]> {
    try {
      const response = await axios.get<CouncilTutelarCityResponse>(
        `${this.API_URL}/conselhos-tutelares/cidade/${encodeURIComponent('Campina Grande')}`
      );

      return (response.data.conselhosRegionais ?? []).map((regional) => ({
        setor: regional.setor,
        nome: regional.nome,
        contato: regional.contato ?? [],
        bairros: regional.bairros ?? [],
        regiao: inferCouncilRegion(`${regional.setor} ${regional.nome}`),
      }));
    } catch (error) {
      throw new Error(
        getApiErrorMessage(
          error,
          'Não foi possível carregar os bairros e conselhos tutelares.'
        )
      );
    }
  }

  getAllBairros = (conselhosRegionais: CouncilRegion[]): string[] =>
    [...new Set(conselhosRegionais.flatMap((conselho) => conselho.bairros ?? []))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR')
    );

  findConselhoByBairro = (
    bairro: string,
    conselhosRegionais: CouncilRegion[]
  ): CouncilRegion | undefined =>
    conselhosRegionais.find((conselho) => (conselho.bairros ?? []).includes(bairro));

  async submitComplaint(
    complaint: ComplaintDraft,
    pdf: Blob,
    protocol: string
  ): Promise<SubmitComplaintResponse> {
    const professionId = complaint.selectedProfession?.id;
    if (!professionId) {
      throw new Error('Profissão não selecionada.');
    }

    const formData = new FormData();
    formData.append('protocolo', protocol);
    formData.append('profissao_id', String(professionId));
    formData.append('regiao', complaint.address.councilRegion?.regiao || '');
    formData.append('pdf', pdf, `denuncia_${protocol}.pdf`);

    try {
      const response = await axios.post<SubmitComplaintResponse>(
        `${this.API_URL}/denuncia`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erro ao enviar denúncia.'));
    }
  }
}
```

### `src/features/denuncia/types/denuncia.ts`

**Como e usado:** Contrato de tipos do fluxo: profissao, formulario publico, campos dinamicos, respostas, fotos, endereco e draft.

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

### `src/features/denuncia/hooks/use-denuncia-form.ts`

**Como e usado:** Hook principal de estado do formulario, incluindo profissao selecionada, formulario carregado, endereco, respostas dinamicas, PDF e persistencia de rascunho.

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

### `src/features/denuncia/hooks/use-step-validation.ts`

**Como e usado:** Hook que controla validade de cada etapa do wizard.

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

### `src/features/denuncia/hooks/use-steps-navigation.ts`

**Como e usado:** Hook que controla etapa atual e bloqueia navegacao para etapas futuras sem validacao.

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

### `src/features/denuncia/utils/dynamic-form.ts`

**Como e usado:** Utilitario central do formulario dinamico: normalizacao, validacao, sanitizacao, formatacao de respostas e serializacao de switch.

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

### `src/features/denuncia/utils/complaint-summary.ts`

**Como e usado:** Monta as secoes e itens exibidos no resumo e usados tambem na geracao do PDF.

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

### `src/features/denuncia/utils/complaint-draft-storage.ts`

**Como e usado:** Persistencia de rascunhos por profissao no IndexedDB.

```ts
import { ComplaintDraft, DynamicAnswers } from '../types/denuncia';

const DB_NAME = 'complaint-drafts-db';
const STORE_NAME = 'complaint-drafts';
const DB_VERSION = 1;

export interface PersistedComplaintDraft {
  address: ComplaintDraft['address'];
  dynamicAnswers: DynamicAnswers;
}

const isIndexedDbAvailable = (): boolean => typeof window !== 'undefined' && 'indexedDB' in window;

const openDatabase = async (): Promise<IDBDatabase | null> => {
  if (!isIndexedDbAvailable()) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const withStore = async <T,>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T | undefined> => {
  const database = await openDatabase();

  if (!database) {
    return undefined;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = callback(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
};

const buildDraftKey = (professionId: number): string => `profession:${professionId}`;

export const getPersistedComplaintDraft = async (
  professionId: number
): Promise<PersistedComplaintDraft | null> => {
  const result = await withStore<PersistedComplaintDraft | null>(
    'readonly',
    (store) => store.get(buildDraftKey(professionId))
  );

  return result ?? null;
};

export const savePersistedComplaintDraft = async (
  professionId: number,
  draft: PersistedComplaintDraft
): Promise<void> => {
  await withStore('readwrite', (store) => store.put(draft, buildDraftKey(professionId)));
};

export const deletePersistedComplaintDraft = async (professionId: number): Promise<void> => {
  await withStore('readwrite', (store) => store.delete(buildDraftKey(professionId)));
};
```

### `src/shared/utils/generate-pdf.ts`

**Como e usado:** Gera o PDF da denuncia a partir do mesmo resumo usado na tela final.

```ts
import jsPDF from 'jspdf';
import { UserOptions } from 'jspdf-autotable';
import {
  ComplaintSummaryPhotoItem,
  buildComplaintSummarySections,
} from '../../features/denuncia/utils/complaint-summary';
import { ComplaintDraft, ComplaintPhoto } from '../../features/denuncia/types/denuncia';

type AutoTableDoc = jsPDF & {
  autoTable: (options: UserOptions) => void;
  lastAutoTable: {
    finalY: number;
  };
};

type PdfImageFormat = 'JPEG' | 'PNG' | 'WEBP';

interface PreparedPdfPhoto {
  photo: ComplaintPhoto;
  width: number;
  height: number;
  format: PdfImageFormat;
}

interface FittedImageDimensions {
  width: number;
  height: number;
}

const PAGE_MARGIN_X = 20;
const PAGE_MARGIN_BOTTOM = 20;
const PAGE_START_Y = 20;
const CONTENT_WIDTH = 170;
const PHOTO_GALLERY_GAP = 10;
const PHOTO_CARD_PADDING = 4;
const PHOTO_FRAME_HEIGHT = 96;
const PHOTO_SINGLE_FRAME_HEIGHT = 130;

const fitImageWithinBox = (
  sourceWidth: number,
  sourceHeight: number,
  maxWidth: number,
  maxHeight: number
): FittedImageDimensions => {
  const widthRatio = maxWidth / sourceWidth;
  const heightRatio = maxHeight / sourceHeight;
  const scale = Math.min(widthRatio, heightRatio);

  return {
    width: sourceWidth * scale,
    height: sourceHeight * scale,
  };
};

const getPdfImageFormat = (type: string): PdfImageFormat => {
  if (type.includes('png')) return 'PNG';
  if (type.includes('webp')) return 'WEBP';
  return 'JPEG';
};

const loadPhotoForPdf = async (photo: ComplaintPhoto): Promise<PreparedPdfPhoto> =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () =>
      resolve({
        photo,
        width: image.naturalWidth || 1,
        height: image.naturalHeight || 1,
        format: getPdfImageFormat(photo.type),
      });

    image.onerror = () =>
      reject(new Error(`Não foi possível carregar a imagem ${photo.name} para o PDF.`));

    image.src = photo.dataUrl;
  });

const ensurePageSpace = (doc: jsPDF, currentY: number, requiredHeight: number): number => {
  const pageHeight = doc.internal.pageSize.height;

  if (currentY + requiredHeight <= pageHeight - PAGE_MARGIN_BOTTOM) {
    return currentY;
  }

  doc.addPage();
  return PAGE_START_Y;
};

const addSectionTitle = (doc: jsPDF, title: string, startY: number): number => {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, PAGE_MARGIN_X, startY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  return startY + 10;
};

const addPhotoGallery = async (
  doc: jsPDF,
  item: ComplaintSummaryPhotoItem,
  startY: number
): Promise<number> => {
  let yPos = ensurePageSpace(doc, startY, 12);

  doc.setFont('helvetica', 'bold');
  doc.text(item.label, PAGE_MARGIN_X, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 6;

  if (item.photos.length === 0) {
    yPos = ensurePageSpace(doc, yPos, 8);
    doc.text(item.emptyText, PAGE_MARGIN_X, yPos);
    return yPos + 8;
  }

  const preparedPhotos = await Promise.all(item.photos.map((photo) => loadPhotoForPdf(photo)));

  for (let index = 0; index < preparedPhotos.length; index += 2) {
    const rowPhotos = preparedPhotos.slice(index, index + 2);
    const columns = rowPhotos.length === 1 ? 1 : 2;
    const cardWidth =
      columns === 1
        ? CONTENT_WIDTH
        : (CONTENT_WIDTH - PHOTO_GALLERY_GAP) / 2;
    const frameWidth = cardWidth - PHOTO_CARD_PADDING * 2;
    const frameHeight =
      columns === 1 ? PHOTO_SINGLE_FRAME_HEIGHT : PHOTO_FRAME_HEIGHT;
    const rowMetrics = rowPhotos.map((entry) => {
      const fittedImage = fitImageWithinBox(
        entry.width,
        entry.height,
        frameWidth,
        frameHeight
      );
      const captionLines = doc.splitTextToSize(
        entry.photo.name,
        cardWidth - PHOTO_CARD_PADDING * 2
      );
      const cardHeight =
        frameHeight + captionLines.length * 5 + PHOTO_CARD_PADDING * 3 + 2;

      return {
        ...entry,
        fittedImage,
        captionLines,
        cardHeight,
      };
    });

    const rowHeight = Math.max(...rowMetrics.map((entry) => entry.cardHeight));
    yPos = ensurePageSpace(doc, yPos, rowHeight);

    rowMetrics.forEach((entry, rowIndex) => {
      const xPos = PAGE_MARGIN_X + rowIndex * (cardWidth + PHOTO_GALLERY_GAP);
      const frameX = xPos + PHOTO_CARD_PADDING;
      const frameY = yPos + PHOTO_CARD_PADDING;
      const imageX = frameX + (frameWidth - entry.fittedImage.width) / 2;
      const imageY = frameY + (frameHeight - entry.fittedImage.height) / 2;
      const captionY = frameY + frameHeight + 5;

      doc.roundedRect(xPos, yPos, cardWidth, rowHeight, 3, 3);
      doc.addImage(
        entry.photo.dataUrl,
        entry.format,
        imageX,
        imageY,
        entry.fittedImage.width,
        entry.fittedImage.height
      );
      doc.text(entry.captionLines, frameX, captionY);
    });

    yPos += rowHeight + 8;
  }

  return yPos;
};

export const generatePDF = async (complaint: ComplaintDraft): Promise<Blob> => {
  const doc = new jsPDF();
  const pdfDoc = doc as AutoTableDoc;
  const sections = buildComplaintSummarySections(complaint);

  doc.setFont('helvetica');

  doc.setFontSize(20);
  doc.text('Relatório de Denúncia', 105, 20, { align: 'center' });
  doc.setFontSize(16);
  doc.text(
    complaint.address.councilRegion?.nome ?? 'Conselho Tutelar não identificado',
    105,
    30,
    { align: 'center' }
  );
  doc.setFontSize(12);

  let yPos = 45;

  for (const [index, section] of sections.entries()) {
    yPos = ensurePageSpace(doc, yPos, 16);
    yPos = addSectionTitle(doc, `${index + 1}. ${section.title}`, yPos);

    if (section.description) {
      const descriptionLines = doc.splitTextToSize(section.description, CONTENT_WIDTH);
      yPos = ensurePageSpace(doc, yPos, descriptionLines.length * 6 + 4);
      doc.text(descriptionLines, PAGE_MARGIN_X, yPos);
      yPos += descriptionLines.length * 6 + 4;
    }

    const textItems = section.items.filter((item) => item.type === 'text');
    const photoItems = section.items.filter((item) => item.type === 'photos');

    if (textItems.length > 0) {
      pdfDoc.autoTable({
        startY: yPos,
        head: [['Pergunta', 'Resposta']],
        body: textItems.map((item) => [item.label, item.value]),
        theme: 'striped',
        headStyles: {
          fillColor: [251, 192, 45],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: [66, 66, 66],
          fontSize: 10,
          valign: 'top',
        },
        columnStyles: {
          0: { cellWidth: 68 },
          1: { cellWidth: 'auto' },
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
          textColor: [66, 66, 66],
          fontSize: 10,
        },
        margin: { left: PAGE_MARGIN_X, right: PAGE_MARGIN_X },
      });

      yPos = pdfDoc.lastAutoTable.finalY + 10;
    }

    for (const item of photoItems) {
      yPos = await addPhotoGallery(doc, item, yPos);
    }

    yPos += 8;
  }

  const pageCount = doc.getNumberOfPages();
  for (let pageIndex = 1; pageIndex <= pageCount; pageIndex += 1) {
    doc.setPage(pageIndex);
    doc.setFontSize(10);
    doc.text(
      `Powered by ProtegeSaúde, ${new Date().toLocaleDateString('pt-BR')}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  return doc.output('blob');
};
```

### `src/shared/utils/string-utils.ts`

**Como e usado:** Utilitario compartilhado para formatacao de CEP.

```ts
export function formatarCEP(cep: string) {
  cep = cep.replace(/\D/g, '');

  if (cep.length > 8) cep = cep.slice(0, 8)
  if (cep.length < 8) return cep;

  return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}
```

## Componentes Compartilhados E Estilos

### `src/shared/components/select/index.tsx`

**Como e usado:** Select customizado com busca, limpeza de valor e suporte a erro, usado na profissao, bairro e campos dinamicos select/bairro.

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

### `src/shared/components/select/select-style.css`

**Como e usado:** Estilos do select customizado e dropdown com busca.

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

### `src/shared/components/checkbox/index.tsx`

**Como e usado:** Checkbox customizado usado nos campos dinamicos de checkbox e nas opcoes condicionais do switch.

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

### `src/shared/components/checkbox/checkbox-style.css`

**Como e usado:** Estilos do checkbox customizado.

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

### `src/shared/components/header/index.tsx`

**Como e usado:** Raiz do header compartilhado usado no topo da tela de denuncia.

```tsx
// src/shared/components/header/index.tsx
import React from 'react';
import './header-style.css';
import { HeaderContext } from './header-context';

interface HeaderRootProps {
  children: React.ReactNode;
  className?: string;
  isMenuOpen?: boolean;
  onMenuClick?: () => void;
  error?: boolean;
}

export const HeaderRoot = ({ children, className = '', isMenuOpen, onMenuClick }: HeaderRootProps) => {
  return (
    <HeaderContext.Provider value={{ isMenuOpen, onMenuClick }}>
      <header className={`app-header ${className}`}>
        <div className="header-content">{children}</div>
      </header>
    </HeaderContext.Provider>
  );
};
```

### `src/shared/components/header/header-style.css`

**Como e usado:** Estilos do header, posicionamento, botoes e responsividade.

```css
.app-header {
  position: fixed;
  top: 0;
  z-index: 1000;
  background: var(--primary-color, #24786B);
  color: white;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  height: 88px;
}

.header-left,
.header-right {
  flex: 1;
  display: flex;
  align-items: center;
}

.header-right {
  justify-content: flex-end;
}

.header-center {
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.logo-image {
  height: 72px;
  width: auto;
  max-width: min(340px, 72vw);
  display: flex;
  object-fit: contain;
  border-radius: 10px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.header-button {
  background: none;
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  position: relative;
}

.header-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-button:active {
  transform: scale(0.95);
}

.notification-button {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #FF4B4B;
  color: white;
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  border: 2px solid var(--primary-color, #24786B);
}

.header-progress {
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: width 0.3s ease;
}

/* Animações */
@keyframes slideIn {
  from {
    transform: translateY(-100%);
  }

  to {
    transform: translateY(0);
  }
}

.app-header {
  animation: slideIn 0.3s ease-out;
}

/* Responsividade */
@media (max-width: 480px) {
  .header-title {
    font-size: 1.1rem;
  }

  .logo-image {
    height: 56px;
    max-width: 68vw;
  }

  .header-content {
    padding: 0.75rem 1rem;
    height: 76px;
  }
}

/* Suporte para notch em iPhones */
@supports (padding-top: env(safe-area-inset-top)) {
  .app-header {
    padding-top: env(safe-area-inset-top);
  }
}

/* Efeito de elevação sutil */
.app-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Adicione isso ao seu Header.css existente */
.menu-button {
  width: 40px;
  height: 40px;
  position: relative;
  padding: 8px;
}

.hamburger-line {
  display: block;
  width: 24px;
  height: 2px;
  background: white;
  position: absolute;
  left: 8px;
  transition: all 0.3s ease;
}

.hamburger-line:nth-child(1) {
  top: 12px;
}

.hamburger-line:nth-child(2) {
  top: 19px;
}

.hamburger-line:nth-child(3) {
  top: 26px;
}

/* Animação para X */
.menu-button.open .hamburger-line:nth-child(1) {
  transform: rotate(45deg);
  top: 19px;
}

.menu-button.open .hamburger-line:nth-child(2) {
  opacity: 0;
}

.menu-button.open .hamburger-line:nth-child(3) {
  transform: rotate(-45deg);
  top: 19px;
}
```

### `src/shared/components/header/header-context.tsx`

**Como e usado:** Contexto interno do header para estado de menu quando usado.

```tsx
import { createContext } from "react";

interface HeaderContextType {
  isMenuOpen?: boolean;
  onMenuClick?: () => void;
}

export const HeaderContext = createContext<HeaderContextType>({});
```

### `src/shared/components/header/components/index.ts`

**Como e usado:** Compoe a API Header.Left, Header.Center, Header.Right, Header.Title, Header.BackButton e outros subcomponentes.

```ts
import { HeaderRoot } from "..";
import BackButton from "./back-button";
import Logo from "./header-logo";
import Title from "./header-title";
import MenuButton from "./menu-button";
import NotificationsButton from "./notifications-button";
import { Center, Left, Right } from "./positions";

export const Header = Object.assign(HeaderRoot, {
  Left,
  Center,
  Right,
  Logo,
  Title,
  BackButton,
  MenuButton,
  NotificationsButton,
});
```

### `src/shared/components/header/components/back-button.tsx`

**Como e usado:** Botao de voltar usado no header do fluxo de denuncia.

```tsx
import { ChevronLeft } from "lucide-react";

interface BackButtonProps {
  onClick?: () => void;
}

const BackButton = ({ onClick }: BackButtonProps) => {
  return (
    <button className="header-button back-button" onClick={onClick}>
      <span className="back-icon"><ChevronLeft /></span>
    </button>
  );
};

export default BackButton;
```

### `src/shared/components/header/components/header-title.tsx`

**Como e usado:** Titulo central do header.

```tsx
interface TitleProps {
  children: React.ReactNode;
}

const Title = ({ children }: TitleProps) => {
  return <h1 className="header-title">{children}</h1>;
};

export default Title;
```

### `src/shared/components/header/components/positions.tsx`

**Como e usado:** Slots de posicionamento esquerdo, centro e direito do header.

```tsx
export const Left = ({ children }: { children: React.ReactNode }) => {
  return <div className="header-left">{children}</div>;
};

export const Center = ({ children }: { children: React.ReactNode }) => {
  return <div className="header-center">{children}</div>;
};

export const Right = ({ children }: { children: React.ReactNode }) => {
  return <div className="header-right">{children}</div>;
};
```

### `src/shared/components/header/components/header-logo.tsx`

**Como e usado:** Logo compartilhado do header; nao aparece no uso atual da tela de denuncia, mas faz parte da composicao exportada do Header.

```tsx
import logoImage from '../../../../assets/protege-saude-logo.jpeg';

const Logo = () => {
  return (
    <div className="logo-container">
      <img
        className="logo-image"
        src={logoImage}
        alt="Logo do ProtegeSaúde"
      />
    </div>
  );
};

export default Logo;
```

### `src/shared/components/header/components/menu-button.tsx`

**Como e usado:** Botao de menu compartilhado; nao aparece no uso atual da tela de denuncia, mas faz parte da composicao exportada do Header.

```tsx
import { useContext } from "react";
import { HeaderContext } from "../header-context";

const MenuButton = () => {
  const { isMenuOpen, onMenuClick } = useContext(HeaderContext);
  
  return (
    <button
      className={`header-button menu-button ${isMenuOpen ? 'open' : ''}`}
      onClick={onMenuClick}
    >
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
      <span className="hamburger-line"></span>
    </button>
  );
};

export default MenuButton;
```

### `src/shared/components/header/components/notifications-button.tsx`

**Como e usado:** Botao de notificacoes compartilhado; nao aparece no uso atual da tela de denuncia, mas faz parte da composicao exportada do Header.

```tsx
import { Bell } from "lucide-react";

interface NotificationsButtonProps {
  count?: number;
  onClick?: () => void;
}

const NotificationsButton = ({ count = 0, onClick }: NotificationsButtonProps) => {
  return (
    <button className="header-button notification-button" onClick={onClick}>
      <Bell size={24} />
      {count > 0 && <span className="notification-badge">{count}</span>}
    </button>
  );
};

export default NotificationsButton;
```

### `src/shared/components/sidebar/use-sidebar-context.tsx`

**Como e usado:** Provider global usado em App.tsx envolvendo as rotas, incluindo a rota de denuncia.

```tsx
import React, { createContext, useState } from 'react';

interface SidebarContextData {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextData>({} as SidebarContextData);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider 
      value={{ 
        isSidebarOpen, 
        toggleSidebar,
        closeSidebar
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
```
