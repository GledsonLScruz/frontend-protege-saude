import React from 'react';
import { CustomSelect } from '../../../../shared/components/select';
import CustomCheckbox from '../../../../shared/components/checkbox';
import { formatarCEP } from '../../../../shared/utils/string-utils';
import {
  DynamicAnswerValue,
  DynamicAnswers,
  PublicFormField,
  PublicFormStep,
} from '../../types/denuncia';
import {
  PHOTO_FIELD_UNAVAILABLE_MESSAGE,
  getAllowedFieldValues,
  getFieldOptions,
  getFieldStorageKey,
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

export const DynamicFormStep: React.FC<DynamicFormStepProps> = ({
  step,
  dynamicAnswers,
  onChange,
  onValidationChange,
}) => {
  const [touchedFields, setTouchedFields] = React.useState<TouchedFields>({});
  const [errors, setErrors] = React.useState<ValidationErrors>({});

  const stepAnswerValues = dynamicAnswers[getFieldStorageKey(step.id)] ?? {};

  React.useEffect(() => {
    const nextErrors = step.campos.reduce<ValidationErrors>((accumulator, field) => {
      accumulator[getFieldStorageKey(field.id)] = validateDynamicField(
        field,
        stepAnswerValues[getFieldStorageKey(field.id)]
      );
      return accumulator;
    }, {});

    setErrors(nextErrors);
    onValidationChange?.(Object.values(nextErrors).every((error) => !error));
  }, [step, stepAnswerValues, onValidationChange]);

  const markTouched = (fieldId: number) => {
    setTouchedFields((prev) => ({
      ...prev,
      [getFieldStorageKey(fieldId)]: true,
    }));
  };

  const getFieldValue = (fieldId: number): DynamicAnswerValue =>
    stepAnswerValues[getFieldStorageKey(fieldId)];

  const renderField = (field: PublicFormField) => {
    const fieldKey = getFieldStorageKey(field.id);
    const fieldError = errors[fieldKey];
    const isTouched = touchedFields[fieldKey];
    const showError = Boolean(isTouched && fieldError);

    switch (field.tipo_campo) {
      case 'texto':
      case 'numero':
      case 'cep':
        return (
          <>
            <input
              type="text"
              value={String(getFieldValue(field.id) ?? '')}
              inputMode={field.tipo_campo === 'numero' || field.tipo_campo === 'cep' ? 'numeric' : undefined}
              onChange={(event) => {
                markTouched(field.id);
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
          </>
        );

      case 'textarea':
        return (
          <>
            <textarea
              value={String(getFieldValue(field.id) ?? '')}
              onChange={(event) => {
                markTouched(field.id);
                onChange(step.id, field.id, event.target.value);
              }}
              onBlur={() => markTouched(field.id)}
              placeholder="Digite sua resposta"
              rows={5}
              className={showError ? 'dynamic-input-error' : ''}
            />
          </>
        );

      case 'data':
        return (
          <>
            <input
              type="date"
              value={String(getFieldValue(field.id) ?? '')}
              onChange={(event) => {
                markTouched(field.id);
                onChange(step.id, field.id, event.target.value);
              }}
              onBlur={() => markTouched(field.id)}
              className={showError ? 'dynamic-input-error' : ''}
            />
          </>
        );

      case 'select':
      case 'bairro':
        return (
          <>
            <CustomSelect
              value={String(getFieldValue(field.id) ?? '')}
              onChange={(value) => {
                markTouched(field.id);
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
          </>
        );

      case 'radio':
        return (
          <>
            <div className="dynamic-options-list dynamic-radio-list">
              {getFieldOptions(field).map((option) => (
                <label key={option.valor} className="dynamic-radio-option">
                  <input
                    type="radio"
                    name={`field-${field.id}`}
                    checked={getFieldValue(field.id) === option.valor}
                    onChange={() => {
                      markTouched(field.id);
                      onChange(step.id, field.id, option.valor);
                    }}
                    onBlur={() => markTouched(field.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </>
        );

      case 'checkbox': {
        const selectedValues = Array.isArray(getFieldValue(field.id))
          ? (getFieldValue(field.id) as string[])
          : [];

        return (
          <>
            <div className="dynamic-options-list dynamic-checkbox-list">
              {getFieldOptions(field).map((option) => (
                <CustomCheckbox
                  key={option.valor}
                  checked={selectedValues.includes(option.valor)}
                  label={option.label}
                  onChange={(checked) => {
                    markTouched(field.id);
                    const nextValues = checked
                      ? [...selectedValues, option.valor]
                      : selectedValues.filter((item) => item !== option.valor);

                    onChange(step.id, field.id, nextValues);
                  }}
                />
              ))}
            </div>
          </>
        );
      }

      case 'switch': {
        const checked = getFieldValue(field.id) === true;

        return (
          <>
            <div className="dynamic-switch-card">
              <span className="dynamic-switch-label">{checked ? 'Sim' : 'Não'}</span>
              <label className="dynamic-switch">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    markTouched(field.id);
                    onChange(step.id, field.id, event.target.checked);
                  }}
                  onBlur={() => markTouched(field.id)}
                />
                <span className="dynamic-switch-slider"></span>
              </label>
            </div>
          </>
        );
      }

      case 'foto':
        return (
          <>
            <div className="dynamic-field-unavailable">{PHOTO_FIELD_UNAVAILABLE_MESSAGE}</div>
          </>
        );

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
          const fieldError = errors[fieldKey];
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
