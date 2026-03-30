import React from 'react';
import './documentos-norteadores-content.css';
import { Header } from '../../../shared/components/header/components';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../../shared/components/footer';
import { CustomSelect, CustomSelectOption } from '../../../shared/components/select';
import {
  DocumentoNorteador,
  DocumentosNorteadoresService,
  Profissao,
} from '../documentos-norteadores-service';

type DownloadStatus = 'downloading' | 'success' | 'error';

const documentosNorteadoresService = new DocumentosNorteadoresService();
const DEFAULT_PROFESSION_ACCENT = '#F4B63C';

const normalizeHexColor = (rawColor?: string | null): string | null => {
  if (!rawColor) {
    return null;
  }

  const trimmed = rawColor.trim();
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;

  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(normalized)) {
    if (normalized.length === 4) {
      return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
    }

    return normalized.toUpperCase();
  }

  return null;
};

const hexToRgb = (hexColor: string): [number, number, number] => {
  const normalized = hexColor.replace('#', '');
  const parsed = Number.parseInt(normalized, 16);

  return [
    (parsed >> 16) & 255,
    (parsed >> 8) & 255,
    parsed & 255,
  ];
};

const darkenHexColor = (hexColor: string, amount: number): string => {
  const [red, green, blue] = hexToRgb(hexColor);
  const nextChannel = (channel: number) =>
    Math.max(0, Math.min(255, Math.round(channel * (1 - amount))));

  return `#${[nextChannel(red), nextChannel(green), nextChannel(blue)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
};

interface DocumentosNorteadoresContentProps {
  initialProfissaoId?: string;
}

const getFilename = (documento: DocumentoNorteador, url: string): string => {
  try {
    const parsedUrl = new URL(url);
    const urlFilename = parsedUrl.pathname.split('/').pop();
    if (urlFilename) {
      return decodeURIComponent(urlFilename);
    }
  } catch {
    return `${documento.title}.pdf`;
  }

  return `${documento.title}.pdf`;
};

const DocumentosNorteadoresContent: React.FC<DocumentosNorteadoresContentProps> = ({
  initialProfissaoId,
}) => {
  const navigate = useNavigate();

  const [profissoes, setProfissoes] = React.useState<Profissao[]>([]);
  const [isLoadingProfissoes, setIsLoadingProfissoes] = React.useState(true);
  const [profissoesError, setProfissoesError] = React.useState<string | null>(null);
  const [selectedProfissaoId, setSelectedProfissaoId] = React.useState('');
  const [documentos, setDocumentos] = React.useState<DocumentoNorteador[]>([]);
  const [isLoadingDocumentos, setIsLoadingDocumentos] = React.useState(false);
  const [documentosError, setDocumentosError] = React.useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = React.useState<
    Record<number, DownloadStatus>
  >({});

  React.useEffect(() => {
    let isActive = true;

    const loadProfissoes = async () => {
      setIsLoadingProfissoes(true);
      setProfissoesError(null);

      try {
        const response = await documentosNorteadoresService.listProfissoes();
        if (!isActive) {
          return;
        }

        setProfissoes(response);

        const normalizedInitialProfissaoId = initialProfissaoId?.trim();
        const initialSelection =
          normalizedInitialProfissaoId &&
          response.some(
            (profissao) => String(profissao.id) === normalizedInitialProfissaoId
          )
            ? normalizedInitialProfissaoId
            : '';

        setSelectedProfissaoId(initialSelection);
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error('Erro ao carregar profissões:', error);
        setProfissoes([]);
        setSelectedProfissaoId('');
        setProfissoesError(
          'Não foi possível carregar a lista de profissões no momento.'
        );
      } finally {
        if (isActive) {
          setIsLoadingProfissoes(false);
        }
      }
    };

    void loadProfissoes();

    return () => {
      isActive = false;
    };
  }, [initialProfissaoId]);

  React.useEffect(() => {
    let isActive = true;

    if (!selectedProfissaoId) {
      setDocumentos([]);
      setDocumentosError(null);
      setIsLoadingDocumentos(false);

      return () => {
        isActive = false;
      };
    }

    const loadDocumentos = async () => {
      setIsLoadingDocumentos(true);
      setDocumentosError(null);
      setDocumentos([]);

      try {
        const response = await documentosNorteadoresService.listByProfissao(
          Number(selectedProfissaoId)
        );

        if (!isActive) {
          return;
        }

        setDocumentos(response);
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error('Erro ao carregar documentos norteadores:', error);
        setDocumentos([]);
        setDocumentosError(
          'Não foi possível carregar os documentos desta profissão no momento.'
        );
      } finally {
        if (isActive) {
          setIsLoadingDocumentos(false);
        }
      }
    };

    void loadDocumentos();

    return () => {
      isActive = false;
    };
  }, [selectedProfissaoId]);

  const profissaoOptions = React.useMemo<CustomSelectOption[]>(
    () =>
      profissoes.map((profissao) => ({
        label: profissao.nome,
        value: String(profissao.id),
      })),
    [profissoes]
  );

  const selectedProfissao = React.useMemo(
    () =>
      profissoes.find((profissao) => String(profissao.id) === selectedProfissaoId) ??
      null,
    [profissoes, selectedProfissaoId]
  );
  const themeStyle = React.useMemo<React.CSSProperties>(() => {
    const accent = normalizeHexColor(selectedProfissao?.cor) ?? DEFAULT_PROFESSION_ACCENT;
    const [red, green, blue] = hexToRgb(accent);

    return {
      ['--profession-accent' as string]: accent,
      ['--profession-accent-rgb' as string]: `${red}, ${green}, ${blue}`,
      ['--profession-accent-strong' as string]: darkenHexColor(accent, 0.12),
      ['--primary-color' as string]: accent,
    };
  }, [selectedProfissao]);

  React.useEffect(() => {
    const root = document.documentElement;
    const previousPrimaryColor = root.style.getPropertyValue('--primary-color');
    const previousProfessionAccent = root.style.getPropertyValue('--profession-accent');
    const previousProfessionAccentRgb = root.style.getPropertyValue('--profession-accent-rgb');
    const previousProfessionAccentStrong = root.style.getPropertyValue('--profession-accent-strong');
    const accent = normalizeHexColor(selectedProfissao?.cor);

    if (accent) {
      const [red, green, blue] = hexToRgb(accent);
      root.style.setProperty('--primary-color', accent);
      root.style.setProperty('--profession-accent', accent);
      root.style.setProperty('--profession-accent-rgb', `${red}, ${green}, ${blue}`);
      root.style.setProperty('--profession-accent-strong', darkenHexColor(accent, 0.12));
    } else {
      root.style.removeProperty('--primary-color');
      root.style.removeProperty('--profession-accent');
      root.style.removeProperty('--profession-accent-rgb');
      root.style.removeProperty('--profession-accent-strong');
    }

    return () => {
      if (previousPrimaryColor) {
        root.style.setProperty('--primary-color', previousPrimaryColor);
      } else {
        root.style.removeProperty('--primary-color');
      }

      if (previousProfessionAccent) {
        root.style.setProperty('--profession-accent', previousProfessionAccent);
      } else {
        root.style.removeProperty('--profession-accent');
      }

      if (previousProfessionAccentRgb) {
        root.style.setProperty('--profession-accent-rgb', previousProfessionAccentRgb);
      } else {
        root.style.removeProperty('--profession-accent-rgb');
      }

      if (previousProfessionAccentStrong) {
        root.style.setProperty('--profession-accent-strong', previousProfessionAccentStrong);
      } else {
        root.style.removeProperty('--profession-accent-strong');
      }
    };
  }, [selectedProfissao]);

  const clearDownloadStatus = (documentoId: number) => {
    setTimeout(() => {
      setDownloadStatus((prevState) => {
        const nextState = { ...prevState };
        delete nextState[documentoId];
        return nextState;
      });
    }, 3000);
  };

  const handleDownload = async (documento: DocumentoNorteador) => {
    const sourceUrl = documento.fileUrl ?? documento.onlineUrl;
    const documentoId = documento.id;

    if (!sourceUrl) {
      setDownloadStatus((prevState) => ({ ...prevState, [documentoId]: 'error' }));
      clearDownloadStatus(documentoId);
      return;
    }

    try {
      setDownloadStatus((prevState) => ({ ...prevState, [documentoId]: 'downloading' }));

      const response = await fetch(sourceUrl);

      if (!response.ok) {
        throw new Error(`Falha no download: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = getFilename(documento, sourceUrl);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadStatus((prevState) => ({ ...prevState, [documentoId]: 'success' }));
    } catch (error) {
      console.error(`Erro ao baixar ${documento.title}:`, error);
      setDownloadStatus((prevState) => ({ ...prevState, [documentoId]: 'error' }));

      if (
        documento.onlineUrl &&
        window.confirm(
          'Não foi possível baixar o arquivo. Deseja abrir o documento online?'
        )
      ) {
        window.open(documento.onlineUrl, '_blank', 'noopener,noreferrer');
      }
    } finally {
      clearDownloadStatus(documentoId);
    }
  };

  const getButtonText = (documentoId: number) => {
    const status = downloadStatus[documentoId];

    switch (status) {
      case 'downloading':
        return 'Baixando...';
      case 'success':
        return 'Download Concluído';
      case 'error':
        return 'Erro ao Baixar';
      default:
        return 'Download';
    }
  };

  return (
    <>
      <div className="legaldoc-container" style={themeStyle}>
        <Header>
          <Header.Left>
            <Header.BackButton onClick={() => navigate('/')} />
          </Header.Left>

          <Header.Center>
            <Header.Title>Documentos Norteadores</Header.Title>
          </Header.Center>

          <Header.Right>
            <></>
          </Header.Right>
        </Header>

        <main className="legaldoc-main-content">
          <div className="legaldoc-hero-section">
            <h1 className="legaldoc-hero-title">
              Biblioteca de <span className="legaldoc-highlight">Documentos Legais</span>
            </h1>
            <p className="legaldoc-hero-description">
              Acesse documentos importantes com foco em artigos específicos relevantes
              para profissionais da saúde e educação.
            </p>
          </div>

          {!profissoesError && (
            <section className="legaldoc-filter-section" aria-label="Filtro por profissão">
              <CustomSelect
                label="Profissão"
                value={selectedProfissaoId}
                onChange={setSelectedProfissaoId}
                options={profissaoOptions}
                placeholder="Selecione sua profissão"
                searchPlaceholder="Buscar profissão..."
              />
              {selectedProfissao?.descricao && (
                <p className="legaldoc-selected-description">
                  {selectedProfissao.descricao}
                </p>
              )}
            </section>
          )}

          {isLoadingProfissoes && (
            <div className="legaldoc-loading" role="status" aria-live="polite">
              <span className="legaldoc-loading-spinner" aria-hidden="true" />
              <p className="legaldoc-feedback">Carregando profissões...</p>
            </div>
          )}

          {profissoesError && (
            <p className="legaldoc-feedback legaldoc-feedback-error">{profissoesError}</p>
          )}

          {!isLoadingProfissoes && !profissoesError && !selectedProfissaoId && (
            <p className="legaldoc-feedback">
              Selecione sua profissão para visualizar os documentos norteadores.
            </p>
          )}

          {!isLoadingProfissoes &&
            !profissoesError &&
            selectedProfissaoId &&
            isLoadingDocumentos && (
              <div className="legaldoc-loading" role="status" aria-live="polite">
                <span className="legaldoc-loading-spinner" aria-hidden="true" />
                <p className="legaldoc-feedback">Carregando documentos da profissão...</p>
              </div>
            )}

          {documentosError && (
            <p className="legaldoc-feedback legaldoc-feedback-error">{documentosError}</p>
          )}

          {!isLoadingProfissoes &&
            !profissoesError &&
            selectedProfissaoId &&
            !isLoadingDocumentos &&
            !documentosError &&
            documentos.length === 0 && (
              <p className="legaldoc-feedback">
                Nenhum documento foi encontrado para a profissão selecionada.
              </p>
            )}

          {!isLoadingProfissoes &&
            !profissoesError &&
            selectedProfissaoId &&
            !isLoadingDocumentos &&
            !documentosError &&
            documentos.length > 0 && (
            <div className="legaldoc-document-grid">
              {documentos.map((documento) => {
                const hasOnlineUrl = Boolean(documento.onlineUrl);
                const hasDownloadSource = Boolean(documento.fileUrl);

                return (
                  <div className="legaldoc-document-card" key={documento.id}>
                    <div className="legaldoc-document-icon">
                      {documento.coverImageUrl ? (
                        <img src={documento.coverImageUrl} alt={documento.title} />
                      ) : (
                        <div className="legaldoc-document-placeholder">Sem capa</div>
                      )}
                    </div>
                    <div className="legaldoc-document-content">
                      <h3 className="legaldoc-document-title">{documento.title}</h3>
                      <p className="legaldoc-document-description">
                        {documento.description || 'Sem descrição disponível.'}
                      </p>

                      {documento.focusPoints.length > 0 && (
                        <div className="legaldoc-focus-points">
                          <h4 className="legaldoc-focus-points-title">Pontos de Foco:</h4>
                          <ul className="legaldoc-focus-points-list">
                            {documento.focusPoints.map((point, index) => (
                              <li className="legaldoc-focus-point-item" key={index}>
                                {point.title}
                                {point.page && (
                                  <span className="legaldoc-page-number">
                                    {' '}
                                    (Página {point.page})
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(hasOnlineUrl || hasDownloadSource) && (
                        <div className="legaldoc-document-actions">
                          {hasOnlineUrl && (
                            <a
                              href={documento.onlineUrl ?? undefined}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="legaldoc-cta-button legaldoc-cta-primary"
                            >
                              Visualizar Online
                            </a>
                          )}

                          {hasDownloadSource && (
                            <button
                              type="button"
                              onClick={() => handleDownload(documento)}
                              className={`legaldoc-cta-button legaldoc-cta-outline ${
                                downloadStatus[documento.id]
                                  ? `legaldoc-status-${downloadStatus[documento.id]}`
                                  : ''
                              }`}
                              disabled={downloadStatus[documento.id] === 'downloading'}
                            >
                              {getButtonText(documento.id)}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Footer
        pageTitle="Biblioteca Legal"
        pageDescription="Acesso a documentos legais importantes para profissionais cadastrados."
      />
    </>
  );
};

export default DocumentosNorteadoresContent;
