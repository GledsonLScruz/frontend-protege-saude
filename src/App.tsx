import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import * as Pages from './features';
import { SidebarProvider } from './shared/components/sidebar/use-sidebar-context';

function App() {
  return (
    <SidebarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Pages.InicioPage />} />
          <Route path="/sobre" element={<Pages.SobrePage />} />
          <Route path="/home" element={<Pages.HomePage />} />
          <Route path="/register" element={<Pages.RegistroPage />} />
          <Route path="/login" element={<Pages.LoginPage />} />
          <Route path="/pontos-apoio" element={<Pages.PontosApoioPage />} />
          <Route path="/denuncia" element={<Pages.DenunciaPage />} />
          <Route path="/confirmacao-denuncia" element={<Pages.ConfirmacaoDenuncia />} />
          <Route path="/documentos-norteadores" element={<Pages.DocumentosNorteadoresPage />} />
          <Route path="/documentos-norteadores/:profissaoId" element={<Pages.DocumentosNorteadoresPage />} />
        </Routes>
      </Router>
    </SidebarProvider>
  )
}

export default App
