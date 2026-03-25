import {
  ComplaintDraft,
  DynamicAnswerValue,
  PublicFormField,
  PublicFormStep,
} from '../types/denuncia';
import {
  DEFAULT_NOT_INFORMED,
  formatDynamicAnswerValue,
  getFieldStorageKey,
} from './dynamic-form';

export interface ComplaintSummaryItem {
  label: string;
  value: string;
}

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
        label: 'Bairro aproximado',
        value: draft.address.neighborhood?.trim() || DEFAULT_NOT_INFORMED,
      },
      {
        label: 'Conselho Tutelar',
        value: draft.address.councilRegion?.nome || DEFAULT_NOT_INFORMED,
      },
      {
        label: 'Contato',
        value: councilContact || DEFAULT_NOT_INFORMED,
      },
    ];
  }

  return [
    {
      label: 'CEP',
      value: draft.address.cep?.trim() || DEFAULT_NOT_INFORMED,
    },
    {
      label: 'Rua',
      value: draft.address.street?.trim() || DEFAULT_NOT_INFORMED,
    },
    {
      label: 'Número',
      value: draft.address.number?.trim() || DEFAULT_NOT_INFORMED,
    },
    {
      label: 'Bairro',
      value: draft.address.neighborhood?.trim() || DEFAULT_NOT_INFORMED,
    },
    {
      label: 'Conselho Tutelar',
      value: draft.address.councilRegion?.nome || DEFAULT_NOT_INFORMED,
    },
    {
      label: 'Contato',
      value: councilContact || DEFAULT_NOT_INFORMED,
    },
  ];
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
      items: step.campos.map((field) => ({
        label: field.nome,
        value: formatDynamicAnswerValue(field, getStepAnswerValue(draft, step, field)),
      })),
    });
  });

  return sections;
};
