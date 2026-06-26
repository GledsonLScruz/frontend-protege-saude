import { useRef, useState } from 'react';
import { Header } from '../../../../shared/components/header/components'
import { useNavigate } from 'react-router-dom';
import { FAQ } from '../faq';
import illustration from '../../../../assets/protege-saude-home-illustration.png'

import './inicio-v3-content.css'
import { Footer } from '../../../../shared/components/footer';

export const InicioV3Content = () => {
  const navigation = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const openModal = () => {
    setShowModal(true);
  };

  const goToDenunciaForm = () => {
    navigation('/denuncia');
  }

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container">
      <nav className="nav-inicio">
        <Header.Logo />
      </nav>

      <main>
        <div className="hero-content">
          <h1 className="hero-title">
            Protegendo vidas através do seu {" "}
            <span>olhar profissional</span>
          </h1>
          <p className="hero-description">
            Como profissional da Saúde você tem um papel fundamental para a identificação de sinais de violência infantojuvenil. Use nossa plataforma para reportar anonimamente casos suspeitos e ajudar a proteger quem mais precisa.
          </p>
          <div className="cta-button-container">
            <button className="cta-button" onClick={openModal}>
              Realizar Denúncia
            </button>
            <button className="cta-button outline" onClick={() => navigation('/documentos-norteadores')}>
              Documentos Norteadores
            </button>
          </div>
        </div>

        <div className="illustration">
          <img className="animated-kid-image" src={illustration} alt="Profissional de saúde abraçando uma criança" width={550} height={367} />
        </div>

      </main>
      <FAQ />
      <Footer pageTitle='ProtegeSaúde' pageDescription='Plataforma dedicada ao combate à violência infantojuvenil através do olhar atento dos profissionais da saúde.' />

      {showModal && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal" ref={modalRef}>
            <button className="close-modal" onClick={closeModal}>×</button>
            <div className="feedback-modal-content">
              <h2>Sua identidade está protegida</h2>
              <p>Fique tranquilo(a), sua denúncia será totalmente anônima. Nosso compromisso é garantir sua segurança enquanto ajudamos a proteger quem mais precisa.</p>
              <div className="feedback-buttons">
                <button className="button button-primary" onClick={goToDenunciaForm}>
                  Prosseguir com a denúncia
                </button>
                <button className="button button-secondary" onClick={closeModal}>
                  Voltar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
