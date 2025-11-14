// /frontend/src/components/LoginPage.jsx (TU CÓDIGO + VISIBILIDAD DE CONTRASEÑA)

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// --- 1. IMPORTAR FONT AWESOME Y LOS ICONOS DE OJO ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- 2. AÑADIR UN ESTADO PARA CONTROLAR LA VISIBILIDAD ---
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
      // La lógica de redirección inteligente que hicimos antes
      if (response.data.rol === 'administrador') {
          navigate('/admin');
      } else {
          navigate('/');
      }
      window.location.reload();

    } catch (err) {
      setError(err.response?.data?.error || 'Error en el inicio de sesión.');
    }
  };

  // --- 3. FUNCIÓN PARA CAMBIAR EL ESTADO DE VISIBILIDAD ---
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
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

        {/* --- 4. MODIFICAR EL GRUPO DE LA CONTRASEÑA --- */}
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          {/* Añadimos un contenedor para el input y el icono */}
          <div className="password-input-wrapper">
            <input
              // El tipo de input ahora cambia según el estado
              type={isPasswordVisible ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* El icono que llama a la función de cambio al hacer clic */}
            <FontAwesomeIcon
              icon={isPasswordVisible ? faEyeSlash : faEye}
              className="password-toggle-icon"
              onClick={togglePasswordVisibility}
            />
          </div>
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