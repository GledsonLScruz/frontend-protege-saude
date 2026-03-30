import React from 'react';
import './denuncia-page-style.css';
import { ComplaintForm } from './components/denuncia-content';
import { useLocation } from 'react-router-dom';

export const DenunciaPage: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/denuncia') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [location]);

  return (
    <div className="report-flow-container">
      <ComplaintForm />
    </div>
  );
};
