import React from 'react';
import { X, Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react';
import './compartilha-app-comunidade.css';

interface CompartilhaAppComunidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompartilhaAppComunidadeModal: React.FC<CompartilhaAppComunidadeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shareText = "Junte-se a nós na luta contra maus-tratos e violência. Conheça o ProtegeSaúde, um aplicativo que ajuda a identificar e denunciar casos de abuso. Juntos, podemos fazer a diferença! #ProtegeSaude #ProtecaoInfantil";

  const shareUrl = "https://protegesaude.com"; // Substitua pela URL real do seu app

  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareViaLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText + " " + shareUrl);
    alert("Texto copiado para a área de transferência!");
  };

  return (
    <div className="modal-overlay">
      <div className="share-modal">
        <button className="close-button" onClick={onClose}>
          <X size={24} />
        </button>
        <h2>Compartilhe o ProtegeSaúde</h2>
        <p>Ajude a divulgar nossa missão de proteger crianças e adolescentes contra maus-tratos e violência.</p>

        <div className="share-stats">
          <div className="stat-item">
            <strong>500+</strong>
            <span>Denúncias feitas</span>
          </div>
          <div className="stat-item">
            <strong>1000+</strong>
            <span>Profissionais cadastrados</span>
          </div>
          <div className="stat-item">
            <strong>50+</strong>
            <span>Casos resolvidos</span>
          </div>
        </div>

        <div className="share-buttons">
          <button onClick={shareViaFacebook} className="share-button facebook">
            <Facebook size={20} />
            Facebook
          </button>
          <button onClick={shareViaTwitter} className="share-button twitter">
            <Twitter size={20} />
            Twitter
          </button>
          <button onClick={shareViaLinkedIn} className="share-button linkedin">
            <Linkedin size={20} />
            LinkedIn
          </button>
          <button onClick={copyToClipboard} className="share-button copy">
            <LinkIcon size={20} />
            Copiar Link
          </button>
        </div>

        <div className="share-text">
          <h3>Texto para compartilhamento:</h3>
          <p>{shareText}</p>
        </div>
      </div>
    </div>
  );
};
