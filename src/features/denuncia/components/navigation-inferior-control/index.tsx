import { useNavigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import './navigation-inferior-control.css';
import { Modal } from '../../../inicio/components/modal';
import React from 'react';

interface NavigationInferiorControlProps {
  totalSteps: number;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  handleFinalStep: () => void;
  isNextDisabled?: boolean;
  isSubmitting?: boolean;
}

export const NavigationInferiorControl = ({
  currentStep,
  setCurrentStep,
  totalSteps,
  handleFinalStep,
  isNextDisabled = false,
  isSubmitting = false,
}: NavigationInferiorControlProps) => {
  const navigate = useNavigate();

  const [modalVisible, setModalVisible] = React.useState(false);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  return (
    <>
      {modalVisible && (
        <Modal
          title="Você tem certeza que deseja sair?"
          primaryLabel="Sair mesmo assim"
          secondayLabel="Não! Voltar de onde parei"
          onPrimary={() => navigate('/')}
          onSecondary={() => setModalVisible(false)}
        />
      )}
      <div className="navigation-buttons">
        {currentStep === 1 && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setModalVisible(true)}
            disabled={isSubmitting}
          >
            Voltar para tela inicial
          </button>
        )}

        {currentStep > 1 && (
          <button
            type="button"
            className="button button-secondary"
            onClick={handlePrevious}
            disabled={isSubmitting}
          >
            Voltar
          </button>
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            className="button button-primary"
            onClick={handleNext}
            disabled={isNextDisabled || isSubmitting}
          >
            Próximo
          </button>
        ) : (
          <button
            type="button"
            className="button button-primary navigation-submit-button"
            onClick={handleFinalStep}
            disabled={isNextDisabled || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={18} className="navigation-button-spinner" />
                Enviando denúncia...
              </>
            ) : (
              'Enviar Denúncia'
            )}
          </button>
        )}
      </div>
    </>
  );
};
