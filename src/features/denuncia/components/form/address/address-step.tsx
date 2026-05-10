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
            <div className="info-icon-base"><span>?</span></div>
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
