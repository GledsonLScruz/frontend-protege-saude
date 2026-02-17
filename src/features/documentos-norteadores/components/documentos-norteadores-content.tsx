import React from 'react';
import './documentos-norteadores-content.css';
import { Header } from '../../../shared/components/header/components';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../../shared/components/footer';
import {
  DocumentoNorteador,
  DocumentosNorteadoresService,
} from '../documentos-norteadores-service';

type DownloadStatus = 'downloading' | 'success' | 'error';

const documentosNorteadoresService = new DocumentosNorteadoresService();

interface DocumentosNorteadoresContentProps {
  profissaoId: number;
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
  profissaoId,
}) => {
  const navigate = useNavigate();

  const [documentos, setDocumentos] = React.useState<DocumentoNorteador[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = React.useState<
    Record<number, DownloadStatus>
  >({});

  React.useEffect(() => {
    let isActive = true;

    const loadDocumentos = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await documentosNorteadoresService.listByProfissao(profissaoId);
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
        setErrorMessage(
          'Não foi possível carregar os documentos desta profissão no momento.'
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadDocumentos();

    return () => {
      isActive = false;
    };
  }, [profissaoId]);

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
      <div className="legaldoc-container">
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

          {isLoading && (
            <div className="legaldoc-loading" role="status" aria-live="polite">
              <span className="legaldoc-loading-spinner" aria-hidden="true" />
              <p className="legaldoc-feedback">Carregando documentos da profissão...</p>
            </div>
          )}

          {errorMessage && (
            <p className="legaldoc-feedback legaldoc-feedback-error">{errorMessage}</p>
          )}

          {!isLoading && !errorMessage && documentos.length === 0 && (
            <p className="legaldoc-feedback">
              Nenhum documento foi encontrado para a profissão selecionada.
            </p>
          )}

          {!isLoading && !errorMessage && documentos.length > 0 && (
            <div className="legaldoc-document-grid">
              {documentos.map((documento) => {
                const hasDownloadSource = Boolean(
                  documento.fileUrl ?? documento.onlineUrl
                );

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

                      <div className="legaldoc-document-actions">
                        {documento.onlineUrl ? (
                          <a
                            href={documento.onlineUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="legaldoc-cta-button legaldoc-cta-primary"
                          >
                            Visualizar Online
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="legaldoc-cta-button legaldoc-cta-primary"
                            disabled
                          >
                            Sem Link Online
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownload(documento)}
                          className={`legaldoc-cta-button legaldoc-cta-outline ${
                            downloadStatus[documento.id]
                              ? `legaldoc-status-${downloadStatus[documento.id]}`
                              : ''
                          }`}
                          disabled={
                            downloadStatus[documento.id] === 'downloading' ||
                            !hasDownloadSource
                          }
                        >
                          {hasDownloadSource
                            ? getButtonText(documento.id)
                            : 'Arquivo Indisponível'}
                        </button>
                      </div>
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
