// /frontend/src/components/PeliculaDetalle.jsx (VERSIÓN FINAL CORREGIDA)

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/PeliculaDetalle.css';

function PeliculaDetalle() {
    const { id } = useParams();
    const [pelicula, setPelicula] = useState(null);
    const [funciones, setFunciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetalles = async () => {
            try {
                setLoading(true);
                const [resPelicula, resFunciones] = await Promise.all([
                    axios.get(`http://localhost:5000/api/peliculas/${id}`),
                    axios.get(`http://localhost:5000/api/peliculas/${id}/funciones`)
                ]);
                
                setPelicula(resPelicula.data);
                setFunciones(resFunciones.data);
                setError('');
            } catch (err) {
                console.error("Error al cargar detalles de la película:", err);
                setError(err.response?.data?.error || 'No se pudo cargar la información de la película.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetalles();
    }, [id]);

    if (loading) return <div className="loading-message content-container">Cargando...</div>;
    if (error) return <div className="content-container"><p className="error-message">{error}</p></div>;
    if (!pelicula) return <div className="content-container"><p>Película no encontrada.</p></div>;

    // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
    // Agregamos un objeto vacío `{}` como valor inicial al .reduce().
    // Ahora, si el array 'funciones' está vacío, el resultado será un objeto vacío,
    // lo cual es perfectamente válido y no causará un error.
    const funcionesPorCiudad = funciones.reduce((acc, funcion) => {
        const ciudad = funcion.ciudad_nombre || 'Cine Principal'; // Maneja el caso de que una sala no tenga ciudad
        (acc[ciudad] = acc[ciudad] || []).push(funcion);
        return acc;
    }, {}); // <-- ESTE ES EL VALOR INICIAL

    const formatTime = (isoString) => new Date(isoString).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="detalle-container content-container">
            <div className="detalle-header">
                <div className="detalle-poster">
                    <img src={pelicula.url_poster || 'https://via.placeholder.com/400x600'} alt={pelicula.titulo} />
                </div>
                <div className="detalle-info">
                    <h1>{pelicula.titulo}</h1>
                    <p className="sinopsis">{pelicula.sinopsis}</p>
                    <div className="info-tags">
                        <span><strong>Director:</strong> {pelicula.director || 'N/A'}</span>
                        <span><strong>Género:</strong> {pelicula.genero || 'N/A'}</span>
                        <span><strong>Duración:</strong> {pelicula.duracion_minutos ? `${pelicula.duracion_minutos} min` : 'N/A'}</span>
                        <span><strong>Clasificación:</strong> {pelicula.clasificacion || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className="funciones-section">
                <h2>Horarios Disponibles</h2>
                {Object.keys(funcionesPorCiudad).length > 0 ? (
                    Object.entries(funcionesPorCiudad).map(([ciudad, funcs]) => (
                        <div key={ciudad} className="ciudad-group">
                            <h3>{ciudad}</h3>
                            <div className="horarios-grid">
                                {funcs.map(funcion => (
                                    <Link to={`/reservar/funcion/${funcion.id}`} key={funcion.id} className="horario-box">
                                        <span className="hora">{formatTime(funcion.fecha_hora)}</span>
                                        <span className="sala">{funcion.sala_nombre}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No hay funciones programadas para esta película por el momento. ¡Vuelve a consultar pronto!</p>
                )}
            </div>
        </div>
    );
}

export default PeliculaDetalle;