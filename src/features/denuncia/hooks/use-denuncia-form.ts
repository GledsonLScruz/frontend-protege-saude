import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ComplaintDraft,
  DynamicAnswers,
  PublicForm,
  PublicProfession,
  createEmptyAddress,
} from '../types/denuncia';
import {
  PersistedComplaintDraft,
  deletePersistedComplaintDraft,
  getPersistedComplaintDraft,
  savePersistedComplaintDraft,
} from '../utils/complaint-draft-storage';
import { isDynamicAnswerEmpty, sanitizeDynamicAnswers } from '../utils/dynamic-form';

const STORAGE_KEY_PREFIX = 'encrypted_complaint_data_by_profession';
const LEGACY_STORAGE_KEY = 'encrypted_complaint_data';

type StoredComplaintDraft = PersistedComplaintDraft;

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
      address.state?.trim() ||
      address.city?.trim() ||
      address.street?.trim() ||
      address.number?.trim() ||
      address.neighborhood?.trim() ||
      address.councilRegion
  );

const clearPersistedCepValidation = (
  address: ComplaintDraft['address'] | undefined
): ComplaintDraft['address'] => ({
  ...createEmptyAddress(),
  ...(address ?? {}),
  validatedCep: '',
  state: '',
  city: '',
  neighborhood: '',
  councilRegion: undefined,
});

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

    void (async () => {
      try {
        await savePersistedComplaintDraft(selectedProfession.id, {
          address,
          dynamicAnswers,
        } satisfies StoredComplaintDraft);
      } catch (error) {
        console.error('Erro ao salvar dados do rascunho:', error);
      }
    })();
  }, [address, dynamicAnswers, isPersistenceEnabled, selectedProfession]);

  const setLoadedForm = (form: PublicForm | null) => {
    setLoadedFormState(form);
    setDynamicAnswers((prev) => sanitizeDynamicAnswers(form, prev));
  };

  const updateAddress = useCallback((nextAddress: ComplaintDraft['address']) => {
    setAddress(nextAddress);
  }, []);

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

  const getLegacyStoredDraft = (professionId: number): StoredComplaintDraft | null => {
    const professionDraft = localStorage.getItem(buildStorageKey(professionId));
    if (professionDraft) {
      return decryptData<StoredComplaintDraft>(professionDraft);
    }

    const legacyDraft = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyDraft) {
      return decryptData<StoredComplaintDraft>(legacyDraft);
    }

    return null;
  };

  const getStoredDraft = async (professionId: number): Promise<StoredComplaintDraft | null> => {
    const indexedDbDraft = await getPersistedComplaintDraft(professionId);
    if (indexedDbDraft) {
      return indexedDbDraft;
    }

    const legacyDraft = getLegacyStoredDraft(professionId);
    if (!legacyDraft) {
      return null;
    }

    try {
      await savePersistedComplaintDraft(professionId, legacyDraft);
      localStorage.removeItem(buildStorageKey(professionId));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao migrar rascunho legado:', error);
    }

    return legacyDraft;
  };

  const hasExistingComplaintData = async (professionId: number): Promise<boolean> => {
    const storedDraft = await getStoredDraft(professionId);
    if (!storedDraft) return false;

    return hasAddressData(storedDraft.address) || hasDynamicAnswersData(storedDraft.dynamicAnswers);
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
    setAddress(clearPersistedCepValidation(storedDraft.address));
    setDynamicAnswers(sanitizeDynamicAnswers(form, storedDraft.dynamicAnswers ?? {}));
    setIsPersistenceEnabled(true);
  };

  const clearStoredData = async (professionId?: number) => {
    const targetProfessionId = professionId ?? selectedProfession?.id;

    try {
      if (targetProfessionId) {
        await deletePersistedComplaintDraft(targetProfessionId);
        localStorage.removeItem(buildStorageKey(targetProfessionId));
      }

      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar dados do rascunho:', error);
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
