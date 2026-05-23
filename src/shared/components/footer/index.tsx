import { useNavigate } from 'react-router-dom'
import './style.css'
import ufcg from '../../../assets/ufcg.png'
import uepb from '../../../assets/uepb2.png'

export const Footer = ({
  pageTitle,
  pageDescription,
}: {
  pageTitle: string
  pageDescription: string
}) => {
  const navigation = useNavigate();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{pageTitle}</h3>
          <p className="footer-description">{pageDescription}</p>
        </div>

        <div className="footer-section">
          <h4>Links Rápidos</h4>
          <ul>
            <li><button onClick={() => navigation('/denuncia')}>Fazer denúncia</button></li>
            <li><button onClick={() => navigation('/documentos-norteadores')}>Documentos Norteadores</button></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contatos de Emergência</h4>
          <ul>
            <li>Disque 100 - Direitos Humanos</li>
            <li>Disque 180 - Violência contra Mulher</li>
            <li>Disque 190 - Polícia Militar</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Parcerias</h4>
          <div className="parcerias">
            <img src={ufcg} width={80} height={75}/>
            <img src={uepb} width={200} height={70}/>
          </div>
        </div>
      </div>

     

      <div className="footer-bottom">
        <p>&copy; 2025 ProtegeSaúde. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
