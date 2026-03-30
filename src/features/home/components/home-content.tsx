import React from 'react';
import { TabBottomBar } from '../../../shared/components/tab-bottom-bar/tab-bottom-bar';
import '../home-style.css';
import { HelpCircle, MapPin, Users, AlertCircle } from 'lucide-react';
import { Sidebar } from '../../../shared/components/sidebar';
import { CompartilhaAppComunidadeModal } from '../../../shared/components/compartilha-app-comunidade';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../../shared/components/sidebar/use-sidebar';
import { Header } from '../../../shared/components/header/components';

export const HomeContent = () => {
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  const goToFazerDenuncia = () => {
    navigate('/denuncia')
  }

  return (
    <div className="container">
      <Header isMenuOpen={isSidebarOpen} onMenuClick={toggleSidebar}>
        <Header.Left>
          <Header.MenuButton />
        </Header.Left>

        <Header.Center>
          <Header.Logo />
        </Header.Center>

        <Header.Right>
          <Header.NotificationsButton
            count={2}
            onClick={() => { }}
          />
        </Header.Right>
      </Header>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => toggleSidebar()}
      />

      <main className="main-section">
        <div className="grid-container">
          <div className="card" onClick={goToFazerDenuncia}>
            <AlertCircle size={32} />
            <h2>Realizar uma denúncia</h2>
            <p>Reporte casos de agressão e maus-tratos</p>
          </div>

          <div className="card" onClick={() => console.log('Identificar vítima')}>
            <Users size={32} />
            <h2>Identifique uma vítima</h2>
            <p>Ajude a identificar vítimas de maus-tratos</p>
          </div>

          <div className="card" onClick={() => console.log('Pontos de denúncia')}>
            <MapPin size={32} />
            <h2>Pontos de denúncia</h2>
            <p>Localize pontos de apoio a denúncias</p>
          </div>

          <div className="card" onClick={() => console.log('Dúvidas')}>
            <HelpCircle size={32} />
            <h2>Dúvidas frequentes</h2>
            <p>Encontre respostas para suas questões</p>
          </div>
        </div>
      </main>

      <TabBottomBar onShareClick={handleShareClick} />

      <CompartilhaAppComunidadeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
}
