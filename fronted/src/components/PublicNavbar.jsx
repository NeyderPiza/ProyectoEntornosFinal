// /frontend/src/components/PublicNavbar.jsx (CÓDIGO FINAL Y DINÁMICO)

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css'; // Reutilizamos los mismos estilos, ¡eficiente!

function PublicNavbar() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook para detectar cambios en la URL

    // Usamos un estado para que el componente se re-renderice cuando cambie el token
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Este efecto escucha los cambios de ruta. Si el usuario navega a /login
    // y luego vuelve, la barra se actualizará.
    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null); // Actualiza el estado para que la UI cambie instantáneamente
        navigate('/'); // Redirige al inicio
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    NBL CINEMAX
                </Link>
                <ul className="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-links">
                            Cartelera
                        </Link>
                    </li>
                    {token ? (
                        // Menú para usuarios autenticados
                        <>
                            <li className="nav-item">
                                <Link to="/mis-compras" className="nav-links">
                                    Mis Compras
                                </Link>
                            </li>
                            <li className="nav-item">
                                <button onClick={handleLogout} className="nav-button">
                                    Cerrar Sesión
                                </button>
                            </li>
                        </>
                    ) : (
                        // Menú para usuarios no autenticados
                        <>
                            <li className="nav-item">
                                <Link to="/login" className="nav-links">
                                    Iniciar Sesión
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/register" className="nav-button">
                                    Registrarse
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default PublicNavbar;