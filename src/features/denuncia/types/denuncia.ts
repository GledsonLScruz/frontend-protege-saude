type CouncilRegionName = 'norte' | 'sul' | 'leste' | 'oeste';

interface CouncilRegion {
  id?: number;
  setor?: string;
  nome: string;
  regiao?: CouncilRegionName;
  contato?: string[];
  bairros?: string[];
}

export interface Address {
  hasNoInformation: boolean;
  cep?: string;
  validatedCep?: string;
  state?: string;
  city?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  councilRegion?: CouncilRegion;
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

type PublicFormFieldType =
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

interface PublicFormFieldValidations {
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

type CepValidationErrorCode =
  | 'CEP_INVALIDO'
  | 'CEP_NAO_ENCONTRADO'
  | 'BAIRRO_NAO_IDENTIFICADO'
  | 'BAIRRO_FORA_DO_CATALOGO'
  | 'CONSELHO_NAO_CADASTRADO'
  | 'ERRO_CONSULTA_CEP';

interface ValidatedCepAddress {
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  logradouro?: string;
  rua?: string;
}

interface ValidatedCepCouncil {
  id: number;
  nome: string;
}

interface CepValidationSuccessResponse {
  podeProsseguir: true;
  endereco: ValidatedCepAddress;
  conselho: ValidatedCepCouncil;
}

interface CepValidationBlockedResponse {
  podeProsseguir: false;
  codigo: CepValidationErrorCode;
  mensagem: string;
}

export type CepValidationResponse =
  | CepValidationSuccessResponse
  | CepValidationBlockedResponse;

export interface ComplaintStepDefinition {
  number: number;
  label: string;
}

export const createEmptyAddress = (): Address => ({
  hasNoInformation: false,
  cep: '',
  validatedCep: '',
  state: '',
  city: '',
  street: '',
  number: '',
  neighborhood: '',
  councilRegion: undefined,
});
