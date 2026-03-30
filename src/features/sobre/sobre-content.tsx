import React, { useState, useEffect } from 'react';
import { Share2, Github, Youtube, Book, Users, Code, Heart, Play } from 'lucide-react';
import './sobre-style.css';
import { CompartilhaAppComunidadeModal } from '../../shared/components/compartilha-app-comunidade';
import { TabBottomBar } from '../../shared/components/tab-bottom-bar/tab-bottom-bar';

export const SobreContent: React.FC = () => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="about-container">
      <div className="parallax-header" style={{ backgroundPositionY: scrollY * 0.5 }}>
        <h1>Sobre o ProtegeSaúde</h1>
      </div>

      <div className="content-wrapper">
        <section className="about-section card">
          <Book color="white" size={48} className="section-icon" />
          <h2>Nossa Origem</h2>
          <p>O ProtegeSaúde nasceu de um projeto de extensão do curso de Odontologia da UEPB, visando criar uma ferramenta para auxiliar profissionais de saúde na identificação e denúncia de casos de maus-tratos e violência contra crianças e adolescentes.</p>
        </section>

        <section className="about-section card">
          <Users color="white" size={48} className="section-icon" />
          <h2>Parcerias</h2>
          <p>Este projeto é uma colaboração entre a UFCG e a UEPB, unindo expertise acadêmica e tecnológica para um propósito social crucial.</p>
        </section>

        <section className="about-section card">
          <Code color="white" size={48} className="section-icon" />
          <h2>Desenvolvimento</h2>
          <p>Desenvolvido por Huandrey Pontes, estudante da UFCG, como parte de seu TCC, aplicando teorias de UI para atender às necessidades dos profissionais de saúde.</p>
        </section>

        <section className="about-section card">
          <Github color="white" size={48} className="section-icon" />
          <h2>Código Aberto</h2>
          <p>O ProtegeSaúde é um projeto de código aberto, permitindo que a comunidade contribua para seu desenvolvimento e melhoria contínua.</p>
          <a href="https://github.com/GledsonLScruz/frontend-protege-saude" target="_blank" rel="noopener noreferrer" className="link-button">
            Acessar no GitHub
          </a>
        </section>

        <section className="about-section card">
          <Youtube color="white" size={48} className="section-icon" />
          <h2>Processo Criativo</h2>
          <p>Todo o processo criativo por trás do desenvolvimento do ProtegeSaúde está documentado e disponível para visualização.</p>
          <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer" className="link-button">
            <Play color="white" />
            Ver no YouTube
          </a>
        </section>

        <button onClick={handleShareClick} className="share-button">
          <Share2 size={20} />
          Compartilhar o ProtegeSaúde
        </button>

        <footer className="about-footer">
          <Heart className="heart-icon" />
          <p>Todos os direitos reservados © ProtegeSaúde 2024</p>
        </footer>
      </div>

      <CompartilhaAppComunidadeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <TabBottomBar onShareClick={handleShareClick} />
    </div>
  );
};
