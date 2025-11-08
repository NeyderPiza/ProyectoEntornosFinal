// /frontend/src/components/Navbar.jsx (CÓDIGO FINAL PARA ESTE ARCHIVO)

import React, { useEffect, useState } from 'react'; // Importamos hooks adicionales
import { Link, useNavigate, useLocation } from 'react--router-dom';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation(); // Hook para detectar cambios en la URL
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Este efecto se ejecutará cada vez que la URL cambie
    useEffect(() => {
        setToken(localStorage.getItem('token'));
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null); // Actualizamos el estado para que la UI reaccione
        navigate('/');
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

export default Navbar;