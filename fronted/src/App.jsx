// /frontend/src/App.jsx (VERSIÓN SIMPLIFICADA)

import React from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';

// Componentes y Layouts
import MovieList from './components/MovieList';
import PeliculaDetalle from './components/PeliculaDetalle';
import ReservaPage from './components/ReservaPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import MisCompras from './components/MisCompras';
import AdminDashboard from './components/AdminDashboard'; // Importamos el componente todo-en-uno
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import PublicNavbar from './components/PublicNavbar';
import AuthLayout from './components/layouts/AuthLayout';

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
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<PublicLayout />}>
            <Route path="/" element={<MovieList />} />
            <Route path="/pelicula/:id" element={<PeliculaDetalle />} />
            <Route path="/reservar/funcion/:id" element={<ReservaPage />} />
            <Route path="/mis-compras" element={<ProtectedRoute><MisCompras /></ProtectedRoute>} />
        </Route>
        
        {/* RUTA DE ADMINISTRADOR SIMPLIFICADA */}
        <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  );
}

export default App;