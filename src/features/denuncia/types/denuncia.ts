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

export type DynamicAnswerValue = string | boolean | string[] | null | undefined;

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
