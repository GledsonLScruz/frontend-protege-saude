import axios from 'axios';
import {
  CepValidationResponse,
  ComplaintDraft,
  PublicForm,
  PublicProfession,
} from './types/denuncia';

interface PublicProfessionApiResponse {
  id: number;
  nome: string;
  descricao: string | null;
  cor: string | null;
  status: number;
  data_criacao?: string;
  data_update?: string;
  data_delete?: string | null;
}

interface SubmitComplaintResponse {
  message: string;
  protocolo: string;
}

const unwrapArrayResponse = <T,>(payload: unknown, keys: string[]): T[] | null => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const recordPayload = payload as Record<string, unknown>;

  for (const key of keys) {
    const nestedValue = recordPayload[key];
    if (Array.isArray(nestedValue)) {
      return nestedValue as T[];
    }
  }

  if (Array.isArray(recordPayload.data)) {
    return recordPayload.data as T[];
  }

  return null;
};

const mapProfession = (
  profession: PublicProfessionApiResponse
): PublicProfession => ({
  id: profession.id,
  nome: profession.nome,
  descricao: profession.descricao ?? '',
  cor: profession.cor ?? '',
  status: profession.status,
  dataCriacao: profession.data_criacao,
  dataUpdate: profession.data_update,
  dataDelete: profession.data_delete ?? null,
});

const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
  if (axios.isAxiosError(error)) {
    const apiMessage =
      error.response?.data?.error ??
      error.response?.data?.message;

    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
      return apiMessage;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
};

export class DenunciaService {
  private readonly API_URL = '/api';

  async listPublicProfessions(): Promise<PublicProfession[]> {
    try {
      const response = await axios.get<unknown>(
        `${this.API_URL}/public/profissoes`
      );

      const professions = unwrapArrayResponse<PublicProfessionApiResponse>(response.data, [
        'profissoes',
        'professions',
        'items',
      ]);

      if (!professions) {
        throw new Error('Resposta inválida ao carregar profissões.');
      }

      return professions.map(mapProfession);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível carregar as profissões disponíveis.')
      );
    }
  }

  async getPublicForm(professionId: number): Promise<PublicForm> {
    try {
      const response = await axios.get<PublicForm>(
        `${this.API_URL}/public/profissoes/${professionId}/formulario`
      );

      return response.data;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Não foi possível carregar o formulário desta profissão.')
      );
    }
  }

  async validateCep(cep: string): Promise<CepValidationResponse> {
    try {
      const response = await axios.get<CepValidationResponse>(
        `${this.API_URL}/denuncia/validar-cep/${encodeURIComponent(cep)}`
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (
          data &&
          typeof data === 'object' &&
          'podeProsseguir' in data &&
          data.podeProsseguir === false
        ) {
          return data as CepValidationResponse;
        }
      }

      throw new Error(
        getApiErrorMessage(
          error,
          'Não foi possível validar o CEP informado.'
        )
      );
    }
  }

  async submitComplaint(
    complaint: ComplaintDraft,
    pdf: Blob,
    protocol: string
  ): Promise<SubmitComplaintResponse> {
    const professionId = complaint.selectedProfession?.id;
    if (!professionId) {
      throw new Error('Profissão não selecionada.');
    }

    const formData = new FormData();
    formData.append('protocolo', protocol);
    formData.append('profissao_id', String(professionId));
    formData.append('regiao', complaint.address.councilRegion?.regiao || '');
    formData.append('cep', complaint.address.validatedCep || complaint.address.cep?.replace(/\D/g, '') || '');
    formData.append('estado', complaint.address.state || '');
    formData.append('cidade', complaint.address.city || '');
    formData.append('bairro', complaint.address.neighborhood || '');

    if (complaint.address.councilRegion?.id) {
      formData.append('conselho_id', String(complaint.address.councilRegion.id));
    }

    formData.append('pdf', pdf, `denuncia_${protocol}.pdf`);

    try {
      const response = await axios.post<SubmitComplaintResponse>(
        `${this.API_URL}/denuncia`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Erro ao enviar denúncia.'));
    }
  }
}
