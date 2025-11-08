// /frontend/src/components/MovieList.jsx (VERSIÓN FINAL CON BÚSQUEDA Y FILTRO DE CIUDAD)

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import '../styles/MovieList.css';

function MovieList() {
    // Estados para los datos originales
    const [allMovies, setAllMovies] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    
    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState(''); // ID de la ciudad seleccionada

    // Estado para los datos que se van a mostrar (ya filtrados)
    const [filteredMovies, setFilteredMovies] = useState([]);
    
    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Función para obtener las ciudades (solo se ejecuta una vez)
    useEffect(() => {
        const fetchCiudades = async () => {
            try {
                const response = await apiClient.get('/ciudades-publicas');
                setCiudades(response.data);
            } catch (err) {
                console.error("Error al cargar ciudades", err);
            }
        };
        fetchCiudades();
    }, []);

    // Función para obtener las películas. Se ejecuta cuando cambia la ciudad seleccionada.
    const fetchMovies = useCallback(async () => {
        setLoading(true);
        try {
            const params = { ciudadId: selectedCity };
            const response = await apiClient.get('/peliculas', { params });
            setAllMovies(response.data); // Guardamos la lista (ya filtrada por ciudad)
        } catch (err) {
            setError('No se pudieron cargar las películas. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    }, [selectedCity]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    // Este efecto filtra LOCALMENTE por el término de búsqueda,
    // sobre la lista de películas que ya fue filtrada por ciudad desde el backend.
    useEffect(() => {
        if (!searchTerm) {
            setFilteredMovies(allMovies);
            return;
        }
        const filtered = allMovies.filter(movie =>
            movie.titulo.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredMovies(filtered);
    }, [searchTerm, allMovies]);

    if (loading) return <div className="loading-message">Cargando cartelera...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="movielist-container">
            <h1>Cartelera</h1>

            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Busca por título..."
                    className="search-input"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                <select 
                    className="city-select" 
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                >
                    <option value="">Todas las ciudades</option>
                    {ciudades.map(ciudad => (
                        <option key={ciudad.id} value={ciudad.id}>
                            {ciudad.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {filteredMovies.length > 0 ? (
                <div className="movie-grid">
                    {filteredMovies.map(pelicula => (
                        <div key={pelicula.id} className="movie-card">
                            <Link to={`/pelicula/${pelicula.id}`}>
                                <img src={pelicula.url_poster} alt={`Póster de ${pelicula.titulo}`} />
                                <div className="movie-card-title">{pelicula.titulo}</div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-results">
                    <p>No se encontraron películas que coincidan con tus filtros.</p>
                </div>
            )}
        </div>
    );
}

export default MovieList;