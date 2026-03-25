import { useEffect, useMemo, useState } from 'react';
import {
  ComplaintDraft,
  DynamicAnswers,
  PublicForm,
  PublicProfession,
  createEmptyAddress,
} from '../types/denuncia';
import { isDynamicAnswerEmpty, sanitizeDynamicAnswers } from '../utils/dynamic-form';

const STORAGE_KEY_PREFIX = 'encrypted_complaint_data_by_profession';
const LEGACY_STORAGE_KEY = 'encrypted_complaint_data';

type StoredComplaintDraft = {
  address: ComplaintDraft['address'];
  dynamicAnswers: DynamicAnswers;
};

const encryptData = (data: unknown): string => {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao criptografar dados:', error);
    return '';
  }
};

const decryptData = <T,>(encryptedData: string): T | null => {
  try {
    return JSON.parse(atob(encryptedData)) as T;
  } catch (error) {
    console.error('Erro ao descriptografar dados:', error);
    return null;
  }
};

const buildStorageKey = (professionId: number) =>
  `${STORAGE_KEY_PREFIX}:${professionId}`;

const hasAddressData = (address: ComplaintDraft['address']): boolean =>
  Boolean(
    address.hasNoInformation ||
      address.cep?.trim() ||
      address.street?.trim() ||
      address.number?.trim() ||
      address.neighborhood?.trim() ||
      address.councilRegion
  );

const hasDynamicAnswersData = (dynamicAnswers: DynamicAnswers): boolean =>
  Object.values(dynamicAnswers).some((stepAnswers) =>
    Object.values(stepAnswers).some((value) => !isDynamicAnswerEmpty(value))
  );

export const useComplaintForm = () => {
  const [publicProfessions, setPublicProfessions] = useState<PublicProfession[]>([]);
  const [selectedProfession, setSelectedProfession] = useState<PublicProfession | null>(null);
  const [loadedForm, setLoadedFormState] = useState<PublicForm | null>(null);
  const [address, setAddress] = useState(createEmptyAddress);
  const [dynamicAnswers, setDynamicAnswers] = useState<DynamicAnswers>({});
  const [pdf, setPdf] = useState<Blob | null>(null);
  const [isPersistenceEnabled, setIsPersistenceEnabled] = useState(false);

  const complaint = useMemo<ComplaintDraft>(
    () => ({
      selectedProfession,
      loadedForm,
      address,
      dynamicAnswers,
    }),
    [selectedProfession, loadedForm, address, dynamicAnswers]
  );

  useEffect(() => {
    if (!isPersistenceEnabled || !selectedProfession) {
      return;
    }

    try {
      const encryptedData = encryptData({
        address,
        dynamicAnswers,
      } satisfies StoredComplaintDraft);

      localStorage.setItem(buildStorageKey(selectedProfession.id), encryptedData);
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }, [address, dynamicAnswers, isPersistenceEnabled, selectedProfession]);

  const setLoadedForm = (form: PublicForm | null) => {
    setLoadedFormState(form);
    setDynamicAnswers((prev) => sanitizeDynamicAnswers(form, prev));
  };

  const updateAddress = (nextAddress: ComplaintDraft['address']) => {
    setAddress(nextAddress);
  };

  const updateDynamicAnswer = (
    stepId: number,
    fieldId: number,
    value: ComplaintDraft['dynamicAnswers'][string][string]
  ) => {
    setDynamicAnswers((prev) => ({
      ...prev,
      [String(stepId)]: {
        ...(prev[String(stepId)] ?? {}),
        [String(fieldId)]: value,
      },
    }));
  };

  const getStoredDraft = (professionId: number): StoredComplaintDraft | null => {
    const storedData = localStorage.getItem(buildStorageKey(professionId));
    if (!storedData) return null;

    return decryptData<StoredComplaintDraft>(storedData);
  };

  const hasExistingComplaintData = (professionId: number): boolean => {
    const storedDraft = getStoredDraft(professionId);
    if (!storedDraft) return false;

    return (
      hasAddressData(storedDraft.address) ||
      hasDynamicAnswersData(storedDraft.dynamicAnswers)
    );
  };

  const startNewDraft = (
    profession: PublicProfession,
    form: PublicForm,
    options?: { preserveAddress?: boolean }
  ) => {
    setSelectedProfession(profession);
    setLoadedFormState(form);
    setDynamicAnswers({});
    setAddress((prevAddress) =>
      options?.preserveAddress ? prevAddress : createEmptyAddress()
    );
    setIsPersistenceEnabled(true);
  };

  const restoreStoredDraft = (
    profession: PublicProfession,
    form: PublicForm,
    storedDraft: StoredComplaintDraft
  ) => {
    setSelectedProfession(profession);
    setLoadedFormState(form);
    setAddress(storedDraft.address ?? createEmptyAddress());
    setDynamicAnswers(sanitizeDynamicAnswers(form, storedDraft.dynamicAnswers ?? {}));
    setIsPersistenceEnabled(true);
  };

  const clearStoredData = (professionId?: number) => {
    try {
      const targetProfessionId = professionId ?? selectedProfession?.id;

      if (targetProfessionId) {
        localStorage.removeItem(buildStorageKey(targetProfessionId));
      }

      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar dados do localStorage:', error);
    }
  };

  return {
    complaint,
    publicProfessions,
    setPublicProfessions,
    selectedProfession,
    loadedForm,
    address,
    dynamicAnswers,
    updateAddress,
    updateDynamicAnswer,
    setLoadedForm,
    setSelectedProfession,
    startNewDraft,
    restoreStoredDraft,
    getStoredDraft,
    hasExistingComplaintData,
    pdf,
    setPdf,
    clearStoredData,
    setIsPersistenceEnabled,
  };
};
