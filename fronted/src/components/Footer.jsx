// /frontend/src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram } from '@fortawesome/free-brands-svg-icons';
import '../styles/Footer.css'; // Crearemos este archivo a continuación

function Footer() {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-section about">
                    <h3 className="footer-logo">NBL CINEMAX</h3>
                    <p>
                        La mejor experiencia cinematográfica, ahora al alcance de un clic.
                        Reserva tus boletos para los estrenos más esperados y disfruta de la magia del cine.
                    </p>
                </div>
                <div className="footer-section links">
                    <h3>Enlaces Rápidos</h3>
                    <ul>
                        <li><Link to="/">Cartelera</Link></li>
                        <li><Link to="#">Promociones</Link></li>
                        <li><Link to="#">Términos y Condiciones</Link></li>
                        <li><Link to="#">Contacto</Link></li>
                    </ul>
                </div>
                <div className="footer-section social">
                    <h3>Síguenos</h3>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><FontAwesomeIcon icon={faFacebookF} /></a>
                        <a href="#" aria-label="Twitter"><FontAwesomeIcon icon={faTwitter} /></a>
                        <a href="#" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} /></a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} NBL Cinemax | Todos los derechos reservados.
            </div>
        </footer>
    );
}

export default Footer;