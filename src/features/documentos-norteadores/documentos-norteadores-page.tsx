import { useLocation } from 'react-router-dom';
import DocumentosNorteadoresContent from './components/documentos-norteadores-content';
import React from 'react';

export const DocumentosNorteadoresPage = () => {
  const location = useLocation();
  const profissaoId = 1;

  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [location]);

  return <DocumentosNorteadoresContent profissaoId={profissaoId} />;
};
