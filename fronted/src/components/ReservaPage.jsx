// /frontend/src/components/ReservaPage.jsx (VERSIÓN FINAL, COMPLETA Y FUNCIONAL)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ReservaPage.css';

function ReservaPage() {
    const { id: funcionId } = useParams();
    const navigate = useNavigate();
    
    const [funcion, setFuncion] = useState(null);
    const [asientosOcupados, setAsientosOcupados] = useState(new Set());
    const [asientosSeleccionados, setAsientosSeleccionados] = useState(new Set());
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    const fetchDatosFuncion = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/funciones/${funcionId}/detalles`);
            setFuncion(response.data.funcion);
            setAsientosOcupados(new Set(response.data.asientosOcupados.map(a => `${a.fila}${a.numero}`)));
        } catch (err) {
            setError('No se pudo cargar la información de la función.');
        } finally {
            setLoading(false);
        }
    }, [funcionId]);

    useEffect(() => {
        fetchDatosFuncion();
    }, [fetchDatosFuncion]);

    const handleSeatClick = (fila, numero) => {
        const seatId = `${fila}${numero}`;
        if (asientosOcupados.has(seatId) || isConfirming) return;
        const nuevosSeleccionados = new Set(asientosSeleccionados);
        if (nuevosSeleccionados.has(seatId)) {
            nuevosSeleccionados.delete(seatId);
        } else {
            nuevosSeleccionados.add(seatId);
        }
        setAsientosSeleccionados(nuevosSeleccionados);
    };

    const handleConfirmarReserva = async () => {
        setIsConfirming(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Debes iniciar sesión para poder reservar.");
            setIsConfirming(false);
            navigate('/login');
            return;
        }

        const datosReserva = {
            funcionId: funcionId,
            asientos: [...asientosSeleccionados],
            totalPagado: asientosSeleccionados.size * (funcion?.precio_boleto || 0)
        };

        try {
            const response = await axios.post('http://localhost:5000/api/reservas', 
                datosReserva, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert(response.data.message);
            navigate('/mis-compras');
        } catch (err) {
            setError(err.response?.data?.error || "Ocurrió un error al confirmar la reserva.");
            setIsConfirming(false); // Vuelve a habilitar el botón si hay un error
        }
    };
    
    const renderAsientos = () => {
        if (!funcion) return null;
        const { filas, columnas } = funcion;
        const letrasFilas = Array.from({ length: filas }, (_, i) => String.fromCharCode(65 + i));
        let grid = [];
        for (const fila of letrasFilas) {
            let rowSeats = [];
            for (let numero = 1; numero <= columnas; numero++) {
                const seatId = `${fila}${numero}`;
                let status = 'disponible';
                if (asientosOcupados.has(seatId)) status = 'ocupado';
                if (asientosSeleccionados.has(seatId)) status = 'seleccionado';
                rowSeats.push(<div key={seatId} className={`seat ${status}`} onClick={() => handleSeatClick(fila, numero)}>{numero}</div>);
            }
            grid.push(<div key={fila} className="seat-row"><div className="row-letter">{fila}</div>{rowSeats}</div>);
        }
        return grid;
    };
    
    if (loading) return <div className="loading-message content-container">Cargando sala...</div>;
    // Si hay un error al cargar, pero no al confirmar, lo muestra aquí
    if (error && !funcion) return <div className="content-container"><p className="error-message">{error}</p></div>;
    // Si no hay función después de cargar, es un problema
    if (!funcion) return <div className="content-container"><p className="error-message">No se encontró la información de la función.</p></div>;

    const totalAPagar = asientosSeleccionados.size * (funcion.precio_boleto || 0);

    return (
        <div className="reserva-container content-container">
            {/* Muestra errores de confirmación aquí, sin romper la página */}
            {error && <p className="error-message">{error}</p>}
            
            <div className="reserva-header">
                <h1>Selecciona tus asientos</h1>
                <h3>{funcion.pelicula_titulo}</h3>
                <p>{new Date(funcion.fecha_hora).toLocaleString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} | {funcion.sala_nombre}</p>
            </div>

            <div className="sala-cine">
                <div className="screen">PANTALLA</div>
                <div className="seats-grid">{renderAsientos()}</div>
            </div>

            <div className="leyenda">
                <div className="leyenda-item"><div className="seat disponible"></div> Disponible</div>
                <div className="leyenda-item"><div className="seat seleccionado"></div> Seleccionado</div>
                <div className="leyenda-item"><div className="seat ocupado"></div> Ocupado</div>
            </div>

            <div className="reserva-summary">
                <h4>Resumen de tu compra</h4>
                <p><strong>Asientos seleccionados:</strong> {[...asientosSeleccionados].sort().join(', ')}</p>
                <p><strong>Total a pagar:</strong> ${totalAPagar.toLocaleString('es-CO')}</p>
                <button 
                    className="btn-primary" 
                    disabled={asientosSeleccionados.size === 0 || isConfirming}
                    onClick={handleConfirmarReserva}
                >
                    {isConfirming ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
            </div>
        </div>
    );
}

export default ReservaPage;