// /frontend/src/components/LoginPage.jsx (VERSIÓN NUEVA Y FUNCIONAL)

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Error en el inicio de sesión.');
    }
  };

  return (
    <div className="auth-form-card">
      <form onSubmit={handleLogin}>
        <h2>Iniciar Sesión</h2>

        {error && <p className="error-message">{error}</p>}

        <div className="input-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }}>
          Entrar
        </button>

        <div className="auth-footer">
          <Link to="/register">¿No tienes cuenta? Regístrate</Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;