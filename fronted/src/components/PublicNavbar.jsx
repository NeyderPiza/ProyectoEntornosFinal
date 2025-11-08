// /frontend/src/components/PublicNavbar.jsx

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import '../styles/App.css';
import '../styles/Navbar.css'; // Usaremos el App.css para los estilos de esta navbar

function PublicNavbar() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                setUserRole(jwtDecode(token).rol);
            } catch (error) { setUserRole(null); }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav className="public-navbar">
            <NavLink to="/" className="nav-logo-public">NBL CINEMAX</NavLink>
            <div className="public-nav-links">
                <NavLink to="/">Cartelera</NavLink>
                {userRole === 'administrador' && <NavLink to="/admin">Dashboard</NavLink>}
                
                {userRole ? (
                    <button onClick={handleLogout} className="nav-button-public">Cerrar Sesión</button>
                ) : (
                    <>
                        <NavLink to="/login">Iniciar Sesión</NavLink>
                        <NavLink to="/register">Registrarse</NavLink>
                        <NavLink to="/mis-compras">Mis Compras</NavLink>
                    </>
                )}
            </div>
        </nav>
    );
}

export default PublicNavbar;