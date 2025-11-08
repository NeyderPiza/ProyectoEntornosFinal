// /frontend/src/components/MisComprasPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import '../styles/MisComprasPage.css'; // Crearemos este archivo a continuación

function MisComprasPage() {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCompras = async () => {
            // Esta es una ruta protegida, necesitamos el token
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Debes iniciar sesión para ver tus compras.");
                setLoading(false);
                return;
            }

            try {
                const response = await apiClient.get('/mis-compras', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setCompras(response.data);
            } catch (err) {
                setError('No se pudo cargar tu historial de compras. Inténtalo de nuevo.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCompras();
    }, []); // El array vacío asegura que esto se ejecute solo una vez, al montar el componente

    if (loading) {
        return <div className="loading-message content-container">Cargando tu historial...</div>;
    }

    if (error) {
        return <div className="error-message content-container">{error}</div>;
    }

    return (
        <div className="mis-compras-container content-container">
            <h1>Mis Compras</h1>
            {compras.length === 0 ? (
                <div className="no-compras">
                    <p>Aún no has realizado ninguna compra.</p>
                    <Link to="/" className="btn-primary">Ver Cartelera</Link>
                </div>
            ) : (
                <div className="compras-list">
                    {compras.map(compra => (
                        <div key={compra.compra_id} className="compra-card">
                            <h2>{compra.pelicula_titulo}</h2>
                            <div className="compra-details">
                                <p><strong>Fecha de la función:</strong> {new Date(compra.funcion_fecha_hora).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' })}</p>
                                <p><strong>Sala:</strong> {compra.sala_nombre}</p>
                                <p><strong>Asientos:</strong> {compra.asientos}</p>
                                <p><strong>Total Pagado:</strong> ${new Intl.NumberFormat('es-CO').format(compra.total_pagado)}</p>
                                <p className="compra-fecha"><em>Comprado el: {new Date(compra.fecha_compra).toLocaleDateString('es-CO')}</em></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MisComprasPage;