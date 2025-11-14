// /frontend/src/components/PublicNavbar.jsx (VERSIÓN FINAL CON LÓGICA DE ROL)

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Necesitamos decodificar el token aquí también
import '../styles/Navbar.css';

function PublicNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    // Creamos estados separados para el token y el rol del usuario
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userRole, setUserRole] = useState(null);

    // Este efecto se ejecuta cada vez que la URL cambia o el token cambia
    useEffect(() => {
        const currentToken = localStorage.getItem('token');
        setToken(currentToken);

        if (currentToken) {
            try {
                // Si hay un token, lo decodificamos y guardamos el rol en el estado
                const decodedToken = jwtDecode(currentToken);
                setUserRole(decodedToken.rol);
            } catch (error) {
                // Si el token es inválido, limpiamos todo
                console.error("Token inválido en Navbar:", error);
                localStorage.removeItem('token');
                setToken(null);
                setUserRole(null);
            }
        } else {
            setUserRole(null);
        }
    }, [location]); // Se ejecuta cada vez que navegamos a una nueva página

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUserRole(null);
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
                        // --- MENÚ PARA USUARIOS AUTENTICADOS ---
                        <>
                            {/* --- ¡AQUÍ ESTÁ LA LÓGICA CLAVE! --- */}
                            {/* Si el rol del usuario es 'administrador', muestra este enlace */}
                            {userRole === 'administrador' && (
                                <li className="nav-item">
                                    <Link to="/admin" className="nav-links admin-link">
                                        Panel Admin
                                    </Link>
                                </li>
                            )}

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