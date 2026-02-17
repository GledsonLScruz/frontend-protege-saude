import axios from 'axios';

interface DocumentoApiResponse {
  id: number;
  profissao_id: number;
  titulo: string;
  descricao: string | null;
  pontos_foco: unknown;
  url_online: string | null;
  arquivo: string | null;
  foto_capa: string | null;
  data_criacao: string;
  data_update: string;
}

export interface DocumentoFocusPoint {
  title: string;
  page?: number;
}

export interface DocumentoNorteador {
  id: number;
  profissaoId: number;
  title: string;
  description: string;
  focusPoints: DocumentoFocusPoint[];
  onlineUrl: string | null;
  fileUrl: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_HOST = 'http://localhost:8080';
const API_BASE_URL = `${API_HOST}/api`;

const toStringValue = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const normalizeResourceUrl = (pathOrUrl: string | null): string | null => {
  if (!pathOrUrl) {
    return null;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.replace(/^\/+/, '');
  return `${API_HOST}/${normalizedPath}`;
};

const toFocusPoint = (value: unknown): DocumentoFocusPoint | null => {
  if (typeof value === 'string') {
    const title = toStringValue(value);
    return title ? { title } : null;
  }

  if (!value || typeof value !== 'object') {
    return null;
  }

  const focusPoint = value as Record<string, unknown>;

  const title = toStringValue(
    focusPoint.title ??
      focusPoint.titulo ??
      focusPoint.nome ??
      focusPoint.texto ??
      focusPoint.ponto
  );

  if (!title) {
    return null;
  }

  const rawPage = focusPoint.page ?? focusPoint.pagina;
  const parsedPage =
    typeof rawPage === 'number' ? rawPage : Number.parseInt(String(rawPage), 10);

  return Number.isFinite(parsedPage) && parsedPage > 0
    ? { title, page: parsedPage }
    : { title };
};

const isFocusPoint = (
  point: DocumentoFocusPoint | null
): point is DocumentoFocusPoint => point !== null;

const parseFocusPoints = (rawFocusPoints: unknown): DocumentoFocusPoint[] => {
  if (Array.isArray(rawFocusPoints)) {
    return rawFocusPoints.map(toFocusPoint).filter(isFocusPoint);
  }

  if (typeof rawFocusPoints === 'string') {
    const textValue = rawFocusPoints.trim();
    if (!textValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(textValue) as unknown;
      return parseFocusPoints(parsedValue);
    } catch {
      return textValue
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((title) => ({ title }));
    }
  }

  const point = toFocusPoint(rawFocusPoints);
  return point ? [point] : [];
};

export class DocumentosNorteadoresService {
  async listByProfissao(profissaoId: number): Promise<DocumentoNorteador[]> {
    const response = await axios.get<DocumentoApiResponse[]>(
      `${API_BASE_URL}/profissoes/${profissaoId}/documentos`
    );

    return response.data.map((documento) => ({
      id: documento.id,
      profissaoId: documento.profissao_id,
      title: documento.titulo,
      description: documento.descricao ?? '',
      focusPoints: parseFocusPoints(documento.pontos_foco),
      onlineUrl: toStringValue(documento.url_online),
      fileUrl: normalizeResourceUrl(toStringValue(documento.arquivo)),
      coverImageUrl: normalizeResourceUrl(toStringValue(documento.foto_capa)),
      createdAt: documento.data_criacao,
      updatedAt: documento.data_update,
    }));
  }
}
