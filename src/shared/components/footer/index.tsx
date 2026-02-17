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
            <li><button onClick={() => navigation('/documentos-norteadores/1')}>Documentos Norteadores</button></li>
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
          <h4>Conselhos Tutelares</h4>
          <ul>
            <li>C.T. Norte: <a href="tel:832017-0062">(83) 2017-0062</a> / <a href="tel:832017-0125">2017-0125</a></li>
            <li>C.T. Sul: <a href="tel:832017-0059">(83) 2017-0059</a> / <a href="tel:832017-0122">2017-0122</a></li>
            <li>C.T. Leste: <a href="tel:832017-0061">(83) 2017-0061</a> / <a href="tel:832017-0124">2017-0124</a></li>
            <li>C.T. Oeste: <a href="tel:832017-0060">(83) 2017-0060</a> / <a href="tel:832017-0123">2017-0123</a></li>
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
        <p>&copy; 2025 OdontoGuardião. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
