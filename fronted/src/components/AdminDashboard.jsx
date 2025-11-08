// /frontend/src/components/AdminDashboard.jsx (VERSIÓN FINAL, CORREGIDA Y COMPLETA)

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/axiosConfig.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
    // Estados para las listas de datos
    const [peliculas, setPeliculas] = useState([]);
    const [ciudades, setCiudades] = useState([]);
    const [salas, setSalas] = useState([]);
    const [funciones, setFunciones] = useState([]);
    
    // Estado para controlar el modal y el elemento a editar
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null,
        data: null
    });
    
    // Estados de UI
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [resPeli, resCiudades, resSalas, resFunc] = await Promise.all([
                apiClient.get('/peliculas'), apiClient.get('/ciudades'),
                apiClient.get('/salas'), apiClient.get('/funciones'),
            ]);
            setPeliculas(resPeli.data);
            setCiudades(resCiudades.data);
            setSalas(resSalas.data);
            setFunciones(resFunc.data);
        } catch (error) {
            setMensaje({ texto: 'Error al cargar datos. Verifica tu sesión de administrador.', tipo: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleOpenModal = (type, item = null) => {
        setModalState({ isOpen: true, type, data: item || {} });
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, type: null, data: null });
    };

    // --- LÓGICA DE GUARDADO Y BORRADO CORREGIDA ---
    const getEndpointForType = (type) => {
        // CORRECCIÓN CLAVE: Mapeamos el tipo singular al endpoint plural correcto.
        const typeMap = {
            'ciudad': 'ciudades',
            'sala': 'salas',
            'pelicula': 'peliculas',
            'funcion': 'funciones'
        };
        return typeMap[type] || `${type}s`;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const { data, type } = modalState;
        const endpoint = getEndpointForType(type);
        const url = `/${endpoint}${data.id ? `/${data.id}` : ''}`;
        const method = data.id ? 'put' : 'post';
        
        try {
            const response = await apiClient[method](url, data);
            setMensaje({ texto: response.data.message || 'Guardado con éxito', tipo: 'success' });
            fetchData();
            handleCloseModal();
        } catch (err) {
            setMensaje({ texto: err.response?.data?.error || `Error al guardar ${type}.`, tipo: 'error' });
        }
    };
    
    const handleDelete = async (id, type) => {
        if (window.confirm('¿Estás seguro?')) {
            try {
                const endpoint = getEndpointForType(type);
                const url = `/${endpoint}/${id}`;
                const response = await apiClient.delete(url);
                setMensaje({ texto: response.data.message, tipo: 'success' });
                fetchData();
            } catch (err) {
                setMensaje({ texto: err.response?.data?.error || `Error al eliminar ${type}.`, tipo: 'error' });
            }
        }
    };

    const handleModalChange = (e) => {
        setModalState(prevState => ({
            ...prevState,
            data: { ...prevState.data, [e.target.name]: e.target.value }
        }));
    };

    const renderModalContent = () => {
        if (!modalState.isOpen) return null;
        const { data, type } = modalState;
        const title = `${data.id ? 'Editar' : 'Añadir'} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        const formatForInput = (iso) => iso ? new Date(new Date(iso).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';

        return (
            <div className="modal-container">
                <div className="modal-content">
                    <span className="close-modal-button" onClick={handleCloseModal}>&times;</span>
                    <h2>{title}</h2>
                    <form id="modal-form" onSubmit={handleSave}>
                        {type === 'ciudad' && (<div className="form-group"><label>Nombre</label><input name="nombre" type="text" value={data.nombre || ''} onChange={handleModalChange} required /></div>)}
                        {type === 'sala' && (<><div className="form-group"><label>Ciudad</label><select name="ciudad_id" value={data.ciudad_id || ''} onChange={handleModalChange} required><option value="">-- Selecciona --</option>{ciudades.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div><div className="form-group"><label>Nombre</label><input name="nombre" type="text" value={data.nombre || ''} onChange={handleModalChange} required /></div><div className="form-group"><label>Filas</label><input name="filas" type="number" value={data.filas || ''} onChange={handleModalChange} required /></div><div className="form-group"><label>Columnas</label><input name="columnas" type="number" value={data.columnas || ''} onChange={handleModalChange} required /></div></>)}
                        {type === 'pelicula' && (<><div className="form-group"><label>Título</label><input name="titulo" type="text" value={data.titulo || ''} onChange={handleModalChange} required /></div><div className="form-group"><label>Director</label><input name="director" type="text" value={data.director || ''} onChange={handleModalChange} /></div><div className="form-group"><label>Género</label><input name="genero" type="text" value={data.genero || ''} onChange={handleModalChange} /></div><div className="form-group"><label>Duración (min)</label><input name="duracion_minutos" type="number" value={data.duracion_minutos || ''} onChange={handleModalChange} /></div><div className="form-group"><label>Clasificación</label><input name="clasificacion" type="text" value={data.clasificacion || ''} onChange={handleModalChange} /></div><div className="form-group"><label>URL Póster</label><input name="url_poster" type="text" value={data.url_poster || ''} onChange={handleModalChange} /></div><div className="form-group"><label>Sinopsis</label><textarea name="sinopsis" value={data.sinopsis || ''} onChange={handleModalChange} rows="3" required /></div></>)}
                        {type === 'funcion' && (<><div className="form-group"><label>Película</label><select name="pelicula_id" value={data.pelicula_id || ''} onChange={handleModalChange} required><option value="">-- Selecciona --</option>{peliculas.map(p => <option key={p.id} value={p.id}>{p.titulo}</option>)}</select></div><div className="form-group"><label>Sala</label><select name="sala_id" value={data.sala_id || ''} onChange={handleModalChange} required><option value="">-- Selecciona --</option>{salas.map(s => <option key={s.id} value={s.id}>{s.nombre} ({s.ciudad_nombre})</option>)}</select></div><div className="form-group"><label>Fecha y Hora</label><input name="fecha_hora" type="datetime-local" value={formatForInput(data.fecha_hora)} onChange={handleModalChange} required /></div><div className="form-group"><label>Precio</label><input name="precio_boleto" type="number" step="100" value={data.precio_boleto || ''} onChange={handleModalChange} required /></div></>)}
                        <button type="submit" className="btn-primary">{data.id ? 'Actualizar' : 'Guardar'}</button>
                    </form>
                </div>
            </div>
        );
    };

    if (loading) return <div className="loading-message content-container">Cargando dashboard...</div>;

    return (
        <div className="admin-dashboard">
            <h1>Panel de Administrador</h1>
            {mensaje.texto && <div className={`message ${mensaje.tipo}`} onClick={() => setMensaje({ texto: '', tipo: '' })}>{mensaje.texto}</div>}
            
            <div className="management-section"><header><h2>Gestionar Ciudades ({ciudades.length})</h2><button className="btn-primary" onClick={() => handleOpenModal('ciudad')}>Añadir Ciudad</button></header><table className="content-table"><thead><tr><th>Nombre</th><th>Acciones</th></tr></thead><tbody>{ciudades.map(c => (<tr key={c.id}><td>{c.nombre}</td><td className="actions"><FontAwesomeIcon icon={faEdit} onClick={() => handleOpenModal('ciudad', c)} /><FontAwesomeIcon icon={faTrashAlt} onClick={() => handleDelete(c.id, 'ciudad')} /></td></tr>))}</tbody></table></div>
            <div className="management-section"><header><h2>Gestionar Salas ({salas.length})</h2><button className="btn-primary" onClick={() => handleOpenModal('sala')}>Añadir Sala</button></header><table className="content-table"><thead><tr><th>Nombre</th><th>Ciudad</th><th>Capacidad</th><th>Acciones</th></tr></thead><tbody>{salas.map(s => (<tr key={s.id}><td>{s.nombre}</td><td>{s.ciudad_nombre}</td><td>{s.filas}x{s.columnas}</td><td className="actions"><FontAwesomeIcon icon={faEdit} onClick={() => handleOpenModal('sala', s)} /><FontAwesomeIcon icon={faTrashAlt} onClick={() => handleDelete(s.id, 'sala')} /></td></tr>))}</tbody></table></div>
            <div className="management-section"><header><h2>Gestionar Películas ({peliculas.length})</h2><button className="btn-primary" onClick={() => handleOpenModal('pelicula')}>Añadir Película</button></header><table className="content-table"><thead><tr><th>Título</th><th>Director</th><th>Acciones</th></tr></thead><tbody>{peliculas.map(p => (<tr key={p.id}><td>{p.titulo}</td><td>{p.director || 'N/A'}</td><td className="actions"><FontAwesomeIcon icon={faEdit} onClick={() => handleOpenModal('pelicula', p)} /><FontAwesomeIcon icon={faTrashAlt} onClick={() => handleDelete(p.id, 'pelicula')} /></td></tr>))}</tbody></table></div>
            <div className="management-section"><header><h2>Gestionar Funciones ({funciones.length})</h2><button className="btn-primary" onClick={() => handleOpenModal('funcion')}>Añadir Función</button></header><table className="content-table"><thead><tr><th>Película</th><th>Sala</th><th>Fecha</th><th>Acciones</th></tr></thead><tbody>{funciones.map(f => (<tr key={f.id}><td>{f.pelicula_titulo}</td><td>{f.sala_nombre} ({f.ciudad_nombre})</td><td>{new Date(f.fecha_hora).toLocaleString('es-CO')}</td><td className="actions"><FontAwesomeIcon icon={faEdit} onClick={() => handleOpenModal('funcion', f)} /><FontAwesomeIcon icon={faTrashAlt} onClick={() => handleDelete(f.id, 'funcion')} /></td></tr>))}</tbody></table></div>
            
            {modalState.isOpen && renderModalContent()}
        </div>
    );
}

export default AdminDashboard;