// /frontend/src/App.jsx (VERSIÓN CORREGIDA Y FINAL)

import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Componentes y Layouts
import MovieList from './components/MovieList';
import PeliculaDetalle from './components/PeliculaDetalle';
import ReservaPage from './components/ReservaPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MisComprasPage from './components/MisComprasPage'; // El componente de la página de compras
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import PublicNavbar from './components/PublicNavbar';
import AuthLayout from './components/layouts/AuthLayout';

// Tu PublicLayout está perfecto. La <PublicNavbar> va aquí y el contenido
// de cada página se renderiza en el <Outlet />.
const PublicLayout = () => (
    <>
        <PublicNavbar />
        <main className="content-container">
            <Outlet />
        </main>
    </>
);

function App() {
  return (
      <Routes>
        {/* Rutas de Autenticación con su propio layout (sin Navbar principal) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        
        {/* Rutas Públicas y Protegidas que usan la Navbar principal */}
        <Route element={<PublicLayout />}>
            <Route path="/" element={<MovieList />} />
            <Route path="/pelicula/:id" element={<PeliculaDetalle />} />
            <Route path="/reservar/funcion/:id" element={<ReservaPage />} />
            
            {/* --- CORRECCIÓN AQUÍ --- */}
            {/* Esta es la forma correcta de proteger una ruta. */}
            {/* La ruta /mis-compras renderizará el componente MisComprasPage SÓLO SI */}
            {/* el usuario pasa la validación de ProtectedRoute. */}
            <Route 
              path="/mis-compras" 
              element={
                <ProtectedRoute>
                  <MisComprasPage />
                </ProtectedRoute>
              } 
            />
        </Route>
        
        {/* Ruta de Administrador */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        {/* Redirección para cualquier otra ruta no encontrada */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  );
}

export default App;