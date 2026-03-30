import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../login-style.css';

export const LoginContent: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

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

    // Here you would typically send the data to your backend for authentication
    // For this example, we'll just simulate a successful login
    if (formData.email && formData.password) {
      navigate('/home');
    } else {
      setError('Por favor, preencha todos os campos.');
    }
  };

  return (
    <div className="login-page">
      <div className="app-logo">
        <img
          className="logo-mark"
          src="/icon-192x192.png"
          alt="Icone do ProtegeSaude"
        />
        <div className="logo-full">ProtegeSaúde</div>
      </div>
      <div className="login-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="E-mail"
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
          <div className="form-links">
            <Link to="/forgot-password" className="forgot-password-link">Esqueci minha senha</Link>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">Entrar</button>
        </form>
        <p className="register-link">
          Não tem uma conta? <a href="/register">Cadastre-se</a>
        </p>
        <Link to="/" className="back-to-initial">Voltar para a tela inicial</Link>
      </div>
    </div>
  );
};
