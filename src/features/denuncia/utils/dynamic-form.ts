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
