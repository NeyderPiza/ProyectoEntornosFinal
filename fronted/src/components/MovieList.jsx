// /frontend/src/components/MovieList.jsx (VERSIÓN CON FILTROS)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import '../styles/MovieList.css'; // Asumo que tienes un CSS, lo crearemos/modificaremos

function MovieList() {
    // Estados para los datos originales
    const [allMovies, setAllMovies] = useState([]);
    
    // Estados para los filtros
    const [searchTerm, setSearchTerm] = useState('');

    // Estado para los datos que se van a mostrar (ya filtrados)
    const [filteredMovies, setFilteredMovies] = useState([]);
    
    // Estados de UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Hacemos ambas peticiones en paralelo para más eficiencia
                const moviesResponse = await apiClient.get('/peliculas');
                setAllMovies(moviesResponse.data);
                setFilteredMovies(moviesResponse.data); // Inicialmente, mostramos todas
            } catch (err) {
                setError('No se pudieron cargar las películas. Inténtalo de nuevo más tarde.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Este efecto se ejecuta cada vez que el término de búsqueda cambia
    useEffect(() => {
        let movies = [...allMovies];

        // 1. Filtrar por término de búsqueda
        if (searchTerm) {
            movies = movies.filter(movie =>
                movie.titulo.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredMovies(movies);
    }, [searchTerm, allMovies]);


    if (loading) {
        return <div className="loading-message">Cargando cartelera...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="movielist-container">
            <h1>En Cartelera</h1>

            {/* --- SECCIÓN DE FILTROS --- */}
            <div className="filters-container">
                <input
                    type="text"
                    placeholder="Busca por título..."
                    className="search-input"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* --- GRID DE PELÍCULAS --- */}
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
                    <p>No se encontraron películas que coincidan con tu búsqueda.</p>
                </div>
            )}
        </div>
    );
}

export default MovieList;