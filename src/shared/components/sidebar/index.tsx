import { Home, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import './sidebar-style.css';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const handleLogout = () => navigate("/");

  const menuItems = [
    { icon: <Home size={24} />, label: 'Início', path: '/' },
    { icon: <User size={24} />, label: 'Perfil', path: '/profile' },
    { icon: <Settings size={24} />, label: 'Configurações', path: '/settings' },
    { icon: <HelpCircle size={24} />, label: 'Ajuda', path: '/help' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              className="logo-icon"
              src="/icon-192x192.png"
              alt="Icone do ProtegeSaude"
            />
            <span className="logo-text">ProtegeSaúde</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="sidebar-item"
              onClick={() => console.log(`Navegando para ${item.path}`)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item logout-button" onClick={handleLogout}>
            <LogOut size={24} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
};
