// /frontend/src/components/AdminRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/login" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    // Si el token es válido pero el rol no es 'administrador', redirige a la página principal
    if (decodedToken.rol !== 'administrador') {
      return <Navigate to="/" />;
    }
  } catch (error) {
    // Si el token es inválido, redirige al login
    return <Navigate to="/login" />;
  }

  // Si todo está bien, muestra el componente hijo (el dashboard)
  return children;
};

export default AdminRoute;