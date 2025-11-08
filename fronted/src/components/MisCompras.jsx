// /frontend/src/components/MisCompras.jsx (VERSIÓN FINAL Y DINÁMICA)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/MisCompras.css'; // Crearemos este archivo para los estilos

function MisCompras() {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompras = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Debes iniciar sesión para ver tus compras.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/mis-compras', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCompras(response.data);
      } catch (err) {
        setError("No se pudo cargar tu historial de compras.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompras();
  }, []);

  const formatDateTime = (isoString) => new Date(isoString).toLocaleString('es-CO', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  if (loading) return <div className="loading-message content-container">Cargando tu historial...</div>;
  if (error) return <div className="content-container"><p className="error-message">{error}</p></div>;

  return (
    <div className="content-container">
      <h1>Mi Historial de Compras</h1>

      {compras.length === 0 ? (
        <p>Aún no has realizado ninguna compra.</p>
      ) : (
        <div className="compras-list">
          {compras.map(compra => (
            <div key={compra.compra_id} className="compra-card">
              <div className="compra-card-header">
                <h3>{compra.pelicula_titulo}</h3>
                <span className="compra-total">${Number(compra.total_pagado).toLocaleString('es-CO')}</span>
              </div>
              <div className="compra-card-body">
                <p><strong>Fecha de la función:</strong> {formatDateTime(compra.funcion_fecha_hora)}</p>
                <p><strong>Comprado el:</strong> {formatDateTime(compra.fecha_compra)}</p>
                {/* En el futuro, podríamos añadir los asientos comprados aquí */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MisCompras;