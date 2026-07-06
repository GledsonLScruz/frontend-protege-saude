import {
  ComplaintPhoto,
  ComplaintDraft,
  DynamicAnswerValue,
  PublicFormField,
  PublicFormStep,
} from '../types/denuncia';
import {
  DEFAULT_NO_PHOTOS,
  formatDynamicAnswerValue,
  formatTextWithDefault,
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

type ComplaintSummaryItem = ComplaintSummaryTextItem | ComplaintSummaryPhotoItem;

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
  const cityState = [draft.address.city, draft.address.state]
    .filter((value) => value?.trim())
    .join('/');
  const councilName = formatTextWithDefault(draft.address.councilRegion?.nome);

  if (draft.address.hasNoInformation) {
    return [
      {
        type: 'text',
        label: 'Bairro aproximado',
        value: formatTextWithDefault(draft.address.neighborhood),
      },
      {
        type: 'text',
        label: 'Cidade/UF',
        value: formatTextWithDefault(cityState),
      },
      {
        type: 'text',
        label: 'Conselho Tutelar',
        value: councilName,
      },
    ];
  }

  return [
    {
      type: 'text',
      label: 'CEP',
      value: formatTextWithDefault(draft.address.cep),
    },
    {
      type: 'text',
      label: 'Rua',
      value: formatTextWithDefault(draft.address.street),
    },
    {
      type: 'text',
      label: 'Número',
      value: formatTextWithDefault(draft.address.number),
    },
    {
      type: 'text',
      label: 'Bairro',
      value: formatTextWithDefault(draft.address.neighborhood),
    },
    {
      type: 'text',
      label: 'Cidade/UF',
      value: formatTextWithDefault(cityState),
    },
    {
      type: 'text',
      label: 'Conselho Tutelar',
      value: councilName,
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
