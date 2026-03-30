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
        const checked = getFieldValue(field.id) === true;

        return (
          <div className="dynamic-switch-card">
            <span className="dynamic-switch-label">{checked ? 'Sim' : 'Não'}</span>
            <label className="dynamic-switch">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  markTouched(field.id);
                  clearSelectionError(field.id);
                  onChange(step.id, field.id, event.target.checked);
                }}
                onBlur={() => markTouched(field.id)}
              />
              <span className="dynamic-switch-slider"></span>
            </label>
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
