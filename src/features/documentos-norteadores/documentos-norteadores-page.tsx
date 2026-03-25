import { useLocation, useParams } from 'react-router-dom';
import DocumentosNorteadoresContent from './components/documentos-norteadores-content';
import React from 'react';

export const DocumentosNorteadoresPage = () => {
  const location = useLocation();
  const { profissaoId } = useParams<{ profissaoId?: string }>();

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location]);

  return <DocumentosNorteadoresContent initialProfissaoId={profissaoId} />;
};
