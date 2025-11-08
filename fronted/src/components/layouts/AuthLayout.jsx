// /frontend/src/components/layouts/AuthLayout.jsx (VERSIÓN NUEVA)

import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../styles/Auth.css'; // Importamos nuestro nuevo y limpio CSS

function AuthLayout() {
  return (
    <div className="auth-container">
      <Outlet />
    </div>
  );
}

export default AuthLayout;
