import {
  DynamicAnswerValue,
  DynamicAnswers,
  PublicForm,
  PublicFormField,
  PublicFormFieldOption,
} from '../types/denuncia';

export const DEFAULT_NOT_INFORMED = 'Não informado';
export const DEFAULT_NOT_APPLICABLE = 'Não se aplica';
export const PHOTO_FIELD_UNAVAILABLE_MESSAGE =
  'O envio de fotos ainda não está disponível neste fluxo.';

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
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return false;
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
      if (field.obrigatorio && typeof value !== 'boolean') {
        return 'Este campo é obrigatório.';
      }
      return undefined;

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
      const arrayValue = Array.isArray(value) ? value : [];
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
      return field.obrigatorio ? PHOTO_FIELD_UNAVAILABLE_MESSAGE : undefined;

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
  if (field.tipo_campo === 'foto') {
    return PHOTO_FIELD_UNAVAILABLE_MESSAGE;
  }

  if (isDynamicAnswerEmpty(value)) {
    return field.tipo_campo === 'checkbox'
      ? DEFAULT_NOT_APPLICABLE
      : DEFAULT_NOT_INFORMED;
  }

  switch (field.tipo_campo) {
    case 'switch':
      return value === true ? 'Sim' : 'Não';

    case 'select':
    case 'radio':
    case 'bairro':
      return getFieldOptionLabel(field, String(value));

    case 'checkbox':
      return Array.isArray(value)
        ? value.map((item) => getFieldOptionLabel(field, item)).join(', ')
        : DEFAULT_NOT_APPLICABLE;

    case 'data':
      return formatDateValue(String(value));

    case 'cep': {
      const digits = normalizeCep(String(value));
      return digits.length === 8
        ? `${digits.slice(0, 5)}-${digits.slice(5)}`
        : DEFAULT_NOT_INFORMED;
    }

    default:
      return String(value).trim() || DEFAULT_NOT_INFORMED;
  }
};
