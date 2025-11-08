// /frontend/src/components/RegisterPage.jsx (VERSIÓN MEJORADA)

import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';


function RegisterPage() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', { nombre, email, password });
      setSuccess('¡Registro exitoso! Serás redirigido al login en 3 segundos...');
      setTimeout(() => navigate('/login'), 3000); // Redirige al login después de 3s
    } catch (err) {
      setError(err.response?.data?.error || 'Ocurrió un error en el registro.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleRegister} className="login-form">
        <div className="form-header">
          <h1>Crear Cuenta</h1>
          <p>Únete a la experiencia del futuro</p>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="input-group">
          <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <label htmlFor="nombre">Nombre Completo</label>
        </div>
        <div className="input-group">
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="email">Correo Electrónico</label>
        </div>
        <div className="input-group">
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <label htmlFor="password">Contraseña</label>
        </div>
        <button type="submit" className="btn-login">Registrarse</button>
        <div className="form-footer">
          <Link to="/login">¿Ya tienes cuenta? Inicia Sesión</Link>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;