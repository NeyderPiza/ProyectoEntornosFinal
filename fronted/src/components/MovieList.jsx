// /frontend/src/components/MovieList.jsx (VERSIÓN FINAL CORREGIDA)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/MovieList.css';

function MovieList() {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para saber si estamos cargando
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerPeliculas = async () => {
      try {
        setLoading(true); // Empezamos a cargar
        const respuesta = await axios.get('http://localhost:5000/api/peliculas');
        setPeliculas(respuesta.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching movies:", err); // Log del error para depuración
        setError("No se pudieron cargar las películas en este momento.");
      } finally {
        setLoading(false); // Terminamos de cargar (con o sin error)
      }
    };
    obtenerPeliculas();
  }, []); // El array vacío asegura que se ejecute solo una vez

  // Mostramos un mensaje mientras los datos cargan
  if (loading) {
    return <div className="loading-message">Cargando cartelera...</div>;
  }

  // Mostramos un mensaje de error si la petición falló
  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="movie-grid-container">
      <h2>En Cartelera</h2>
      
      <div className="movie-grid">
        {peliculas.map(pelicula => (
          // La 'key' debe estar en el elemento más externo del bucle, en este caso, el Link.
          <Link to={`/pelicula/${pelicula.id}`} key={pelicula.id} className="movie-card-link">
            <div className="movie-card">
              <div className="movie-card-poster">
                <img src={pelicula.url_poster || 'https://via.placeholder.com/300x450'} alt={`Póster de ${pelicula.titulo}`} />
              </div>
              <div className="movie-card-content">
                <h3>{pelicula.titulo}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MovieList;