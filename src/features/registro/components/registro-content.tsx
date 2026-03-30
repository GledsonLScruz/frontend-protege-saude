import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../registro-style.css';

export const RegisterContent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    professionalId: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // Here you would typically send the data to your backend
    // For this example, we'll just simulate a successful registration
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 1000);
  };

  return (
    <div className="register-page">
      <div className="app-logo">
        <img
          className="logo-mark"
          src="/icon-192x192.png"
          alt="Icone do ProtegeSaude"
        />
        <div className="logo-full">ProtegeSaúde</div>
      </div>
      <div className="register-container">
        <h1>Cadastro</h1>
        <p className="register-info">
          Suas informações não serão expostas. Você ainda pode fazer denúncias anônimas.
          Seu cadastro é importante para mantermos uma comunidade proativa.
        </p>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Nome completo"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail"
            required
          />
          <input
            type="text"
            name="professionalId"
            value={formData.professionalId}
            onChange={handleChange}
            placeholder="CRM, CRO ou similar"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Senha"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirme a senha"
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="register-button">Cadastrar</button>
        </form>
        <p className="login-link">
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
        <Link to="/" className="back-to-initial">Voltar para a tela inicial</Link>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Cadastro Realizado com Sucesso!</h2>
            <p>Sua conta foi criada. Você já pode fazer login.</p>
            <button onClick={() => navigate('/login')} className="modal-button">
              Ir para Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
