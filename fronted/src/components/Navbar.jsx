// /frontend/src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Navbar() {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUserRole(decodedToken.rol);
      } catch (error) {
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserRole(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">Cine-G</Link>
      <div className="nav-links">
        <Link to="/">Cartelera</Link>
        {userRole === 'administrador' && <Link to="/admin">Dashboard</Link>}
        
        {userRole ? (
          <button onClick={handleLogout} className="nav-button">Cerrar Sesión</button>
        ) : (
          <>
            <Link to="/login">Iniciar Sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;