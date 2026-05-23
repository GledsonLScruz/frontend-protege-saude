import { Address } from "../../../types/denuncia";

export interface AddressValidationErrors {
  cep?: string;
  street?: string;
  number?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  councilRegion?: string;
}

const ADDRESS_VALIDATION_MESSAGES = {
  REQUIRED_CEP: 'CEP é obrigatório',
  INVALID_CEP: 'CEP inválido',
  UNVALIDATED_CEP: 'Valide o CEP antes de continuar',
  REQUIRED_STREET: 'Rua é obrigatória',
  INVALID_STREET: 'Rua deve ter pelo menos 3 caracteres',
  REQUIRED_NUMBER: 'Número é obrigatório',
  REQUIRED_CITY: 'Cidade é obrigatória',
  REQUIRED_STATE: 'Estado é obrigatório',
  REQUIRED_NEIGHBORHOOD: 'Bairro é obrigatório'
} as const;

export const validateAddressStep = (address: Address): AddressValidationErrors => {
  const errors: AddressValidationErrors = {};
  const normalizedCep = address.cep?.replace(/\D/g, '') ?? '';

  if (!normalizedCep) {
    errors.cep = ADDRESS_VALIDATION_MESSAGES.REQUIRED_CEP;
  } else if (!/^\d{8}$/.test(normalizedCep)) {
    errors.cep = ADDRESS_VALIDATION_MESSAGES.INVALID_CEP;
  } else if (address.validatedCep !== normalizedCep) {
    errors.cep = ADDRESS_VALIDATION_MESSAGES.UNVALIDATED_CEP;
  }

  if (!address.street?.trim()) {
    errors.street = 'Rua é obrigatória';
  } else if (address.street.length < 3) {
    errors.street = ADDRESS_VALIDATION_MESSAGES.INVALID_STREET;
  }
  if (!address.number?.trim()) {
    errors.number = ADDRESS_VALIDATION_MESSAGES.REQUIRED_NUMBER;
  }
  if (!address.state?.trim()) {
    errors.state = ADDRESS_VALIDATION_MESSAGES.REQUIRED_STATE;
  }
  if (!address.city?.trim()) {
    errors.city = ADDRESS_VALIDATION_MESSAGES.REQUIRED_CITY;
  }
  if (!address.neighborhood?.trim()) {
    errors.neighborhood = ADDRESS_VALIDATION_MESSAGES.REQUIRED_NEIGHBORHOOD;
  }

  return errors;
};
