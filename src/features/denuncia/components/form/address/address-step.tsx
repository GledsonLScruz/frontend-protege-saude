import React from 'react';
import { LoaderCircle } from 'lucide-react';

import { Address, CepValidationResponse } from '../../../types/denuncia';
import { AddressValidationErrors, validateAddressStep } from './address-step-validation';
import { formatarCEP } from '../../../../../shared/utils/string-utils';

import './address-step.css';

interface TouchedFields {
  cep?: boolean;
  street?: boolean;
  number?: boolean;
}

interface AddressStepProps {
  address: Address;
  onChange: (address: Address) => void;
  onValidationChange?: (isValid: boolean) => void;
  validateCep: (cep: string) => Promise<CepValidationResponse>;
}

export const AddressStep: React.FC<AddressStepProps> = ({
  address,
  onChange,
  onValidationChange,
  validateCep,
}) => {
  const [errors, setErrors] = React.useState<AddressValidationErrors>({});
  const [touchedFields, setTouchedFields] = React.useState<TouchedFields>({});
  const [isValidatingCep, setIsValidatingCep] = React.useState(false);
  const [cepFeedback, setCepFeedback] = React.useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const latestAddressRef = React.useRef(address);
  const onChangeRef = React.useRef(onChange);
  const validateCepRef = React.useRef(validateCep);
  const lastRequestedCepRef = React.useRef('');
  const activeRequestRef = React.useRef(0);
  const lastValidationRef = React.useRef<{ key: string; isValid: boolean } | null>(null);

  React.useEffect(() => {
    latestAddressRef.current = address;
  }, [address]);

  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    validateCepRef.current = validateCep;
  }, [validateCep]);

  const handleBlur = (field: keyof TouchedFields) => {
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const clearValidatedLocation = React.useCallback((currentAddress: Address): Address => ({
    ...currentAddress,
    validatedCep: '',
    state: '',
    city: '',
    neighborhood: '',
    councilRegion: undefined,
  }), []);

  const handleCepChange = (value: string) => {
    const formattedCep = formatarCEP(value);
    const normalizedCep = formattedCep.replace(/\D/g, '');
    const nextAddress =
      normalizedCep === address.validatedCep
        ? {
            ...address,
            cep: formattedCep,
          }
        : clearValidatedLocation({
            ...address,
            cep: formattedCep,
          });

    lastRequestedCepRef.current = '';
    activeRequestRef.current += 1;
    latestAddressRef.current = nextAddress;
    setCepFeedback(null);
    onChange(nextAddress);
  };

  React.useEffect(() => {
    const validationErrors: AddressValidationErrors = validateAddressStep(address);

    if (isValidatingCep) {
      validationErrors.cep = 'Validando CEP...';
    }

    if (cepFeedback?.type === 'error') {
      validationErrors.cep = cepFeedback.message;
    }

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
  }, [address, cepFeedback, isValidatingCep, onValidationChange]);

  React.useEffect(() => {
    const normalizedCep = address.cep?.replace(/\D/g, '') ?? '';

    if (normalizedCep.length !== 8) {
      lastRequestedCepRef.current = '';
      activeRequestRef.current += 1;
      return;
    }

    if (address.validatedCep === normalizedCep || lastRequestedCepRef.current === normalizedCep) {
      return;
    }

    lastRequestedCepRef.current = normalizedCep;
    const requestId = activeRequestRef.current + 1;
    activeRequestRef.current = requestId;
    setIsValidatingCep(true);
    setCepFeedback(null);

    void validateCepRef.current(normalizedCep)
      .then((result) => {
        const currentAddress = latestAddressRef.current;
        const currentCep = currentAddress.cep?.replace(/\D/g, '') ?? '';

        if (activeRequestRef.current !== requestId || currentCep !== normalizedCep) {
          return;
        }

        if (!result.podeProsseguir) {
          onChangeRef.current(clearValidatedLocation(currentAddress));
          setCepFeedback({
            type: 'error',
            message: result.mensagem,
          });
          return;
        }

        const street = result.endereco.logradouro?.trim() || result.endereco.rua?.trim() || '';

        onChangeRef.current({
          ...currentAddress,
          cep: formatarCEP(result.endereco.cep),
          validatedCep: normalizedCep,
          state: result.endereco.estado,
          city: result.endereco.cidade,
          street,
          neighborhood: result.endereco.bairro,
          councilRegion: {
            id: result.conselho.id,
            nome: result.conselho.nome,
            contato: [],
          },
        });
        setCepFeedback({
          type: 'success',
          message: 'CEP validado com sucesso.',
        });
      })
      .catch((error) => {
        const currentAddress = latestAddressRef.current;
        const currentCep = currentAddress.cep?.replace(/\D/g, '') ?? '';

        if (activeRequestRef.current !== requestId || currentCep !== normalizedCep) {
          return;
        }

        onChangeRef.current(clearValidatedLocation(currentAddress));
        setCepFeedback({
          type: 'error',
          message: error instanceof Error ? error.message : 'Não foi possível validar o CEP informado.',
        });
      })
      .finally(() => {
        if (activeRequestRef.current === requestId) {
          setIsValidatingCep(false);
        }
      });
  }, [address.cep, address.validatedCep, clearValidatedLocation]);

  const shouldShowCepMessage = Boolean(
    cepFeedback || isValidatingCep || (touchedFields.cep && errors.cep)
  );

  return (
    <div className="address-step">
      <div className="form-group">
        <div className="address-form-item">
          <label>CEP</label>
          <div className="tooltip-container-base">
            <div className="info-icon-base"><span>?</span></div>
            <div className="tooltip-base">
              Caso a criança ou adolescente resida em outro município que não seja Campina Grande, deve-se informar o CEP do endereço onde a violência ocorreu, em Campina Grande.
            </div>
          </div>
        </div>
        <input
          type="text"
          value={address.cep || ''}
          onChange={(e) => handleCepChange(e.target.value)}
          onBlur={() => handleBlur('cep')}
          placeholder="58000-000"
          inputMode="numeric"
        />
        {shouldShowCepMessage && (
          <span
            className={cepFeedback?.type === 'success' ? 'address-success-message' : 'error-message'}
          >
            {isValidatingCep && <LoaderCircle size={14} className="address-inline-spinner" />}
            {isValidatingCep ? 'Validando CEP...' : cepFeedback?.message || errors.cep}
          </span>
        )}
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

      <div className="address-validated-grid" aria-live="polite">
        <div className="form-group">
          <label>Estado</label>
          <input type="text" value={address.state || ''} placeholder="Aguardando CEP validado" disabled />
        </div>

        <div className="form-group">
          <label>Cidade</label>
          <input type="text" value={address.city || ''} placeholder="Aguardando CEP validado" disabled />
        </div>

        <div className="form-group">
          <label>Bairro</label>
          <input type="text" value={address.neighborhood || ''} placeholder="Aguardando CEP validado" disabled />
        </div>

        <div className="form-group">
          <label>Conselho Tutelar</label>
          <input
            type="text"
            value={address.councilRegion?.nome || ''}
            placeholder="Aguardando CEP validado"
            disabled
          />
        </div>
      </div>
    </div>
  );
};
