// /backend/index.js (VERSIÓN FINAL, COMPLETA Y FUNCIONAL)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { sendConfirmationEmail } = require('./services/emailService');

const { verifyToken, checkAdmin } = require('./middleware/auth');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// --- 1. API DE AUTENTICACIÓN ---
app.post('/api/auth/register', async (req, res) => {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) return res.status(400).json({ error: "Todos los campos son obligatorios." });
    try {
        const password_hash = await bcrypt.hash(password, 10);
        const { rows } = await pool.query('INSERT INTO Usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email', [nombre, email, password_hash]);
        res.status(201).json({ message: "Usuario registrado con éxito.", user: rows[0] });
    } catch (error) {
        if (error.code === '23505') return res.status(409).json({ error: "El correo electrónico ya está en uso." });
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email y contraseña son obligatorios." });
    try {
        const { rows } = await pool.query('SELECT * FROM Usuarios WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(401).json({ error: "Credenciales inválidas." });
        const user = rows[0];
        const passwordValida = await bcrypt.compare(password, user.password_hash);
        if (!passwordValida) return res.status(401).json({ error: "Credenciales inválidas." });
        const payload = { id: user.id, rol: user.rol };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ message: "Login exitoso.", token });
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor." });
    }
});

// --- 2. API PÚBLICA (para clientes) ---

app.get('/api/peliculas/:id', async (req, res) => { try { const { rows } = await pool.query('SELECT * FROM Peliculas WHERE id = $1', [req.params.id]); if(rows.length === 0) return res.status(404).json({error: 'Película no encontrada'}); res.json(rows[0]); } catch (e) { res.status(500).json({ error: 'Error al obtener película.'})}});
app.get('/api/peliculas/:id/funciones', async (req, res) => { try { const query = `SELECT f.id, f.fecha_hora, f.precio_boleto, s.nombre AS sala_nombre, c.nombre AS ciudad_nombre FROM Funciones f JOIN Salas s ON f.sala_id = s.id JOIN Ciudades c ON s.ciudad_id = c.id WHERE f.pelicula_id = $1 AND f.fecha_hora > NOW() ORDER BY c.nombre, f.fecha_hora ASC;`; const { rows } = await pool.query(query, [req.params.id]); res.json(rows); } catch (e) { res.status(500).json({ error: 'Error al obtener funciones.'})}});
app.get('/api/funciones/:id/detalles', async (req, res) => { try { const fQuery = `SELECT f.id, f.fecha_hora, f.precio_boleto, p.titulo AS pelicula_titulo, p.url_poster, s.nombre AS sala_nombre, s.filas, s.columnas FROM Funciones f JOIN Peliculas p ON f.pelicula_id = p.id JOIN Salas s ON f.sala_id = s.id WHERE f.id = $1;`; const fRes = await pool.query(fQuery, [req.params.id]); if(fRes.rows.length === 0) return res.status(404).json({error: 'Función no encontrada'}); const aQuery = 'SELECT fila, numero FROM Asientos_Reservados WHERE funcion_id = $1'; const aRes = await pool.query(aQuery, [req.params.id]); res.json({ funcion: fRes.rows[0], asientosOcupados: aRes.rows }); } catch (e) { res.status(500).json({ error: 'Error al obtener detalles de función.'})}});
app.get('/api/peliculas', async (req, res) => { 
    try {
        const { ciudadId } = req.query; // Leemos el parámetro de consulta ?ciudadId=
        let query = '';
        let params = [];

        if (ciudadId) {
            // Si nos piden una ciudad específica, la consulta es más compleja.
            // Selecciona solo las películas (DISTINCT) que tienen al menos una función
            // en una sala de la ciudad especificada.
            query = `
                SELECT DISTINCT p.* 
                FROM Peliculas p
                JOIN Funciones f ON p.id = f.pelicula_id
                JOIN Salas s ON f.sala_id = s.id
                WHERE s.ciudad_id = $1 AND f.fecha_hora > NOW()
                ORDER BY p.titulo ASC
            `;
            params = [ciudadId];
        } else {
            // Si no se especifica ciudad, devolvemos todas las películas como antes.
            query = 'SELECT * FROM Peliculas ORDER BY titulo ASC';
        }

        const { rows } = await pool.query(query, params);
        res.json(rows);

    } catch (e) { 
        console.error("Error al obtener películas:", e);
        res.status(500).json({ error: 'Error al obtener películas.' });
    }
});

app.get('/api/ciudades-publicas', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM Ciudades ORDER BY nombre ASC');
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: 'Error al obtener las ciudades.' });
    }
});
// --- 3. API PROTEGIDA (para usuarios logueados) ---
// ¡¡¡AQUÍ ESTÁ LA CORRECCIÓN!!!
app.post('/api/reservas', verifyToken, async (req, res) => {
    const usuarioId = req.user.id;
    const { funcionId, asientos, totalPagado } = req.body;

    if (!funcionId || !asientos || asientos.length === 0) {
        return res.status(400).json({ error: "Faltan datos para la reserva." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        const compraQuery = 'INSERT INTO Compras (usuario_id, funcion_id, total_pagado) VALUES ($1, $2, $3) RETURNING id';
        const compraResult = await client.query(compraQuery, [usuarioId, funcionId, totalPagado]);
        const compraId = compraResult.rows[0].id;
        
        const asientoQuery = 'INSERT INTO Asientos_Reservados (compra_id, funcion_id, fila, numero) VALUES ($1, $2, $3, $4)';
        for (const asiento of asientos) {
            const fila = asiento.charAt(0);
            const numero = parseInt(asiento.substring(1), 10);
            await client.query(asientoQuery, [compraId, funcionId, fila, numero]);
        }

        await client.query('COMMIT');
        
        // Enviamos la respuesta de éxito ANTES de intentar mandar el correo.
        // Esto asegura que el frontend deje de "Procesar..." inmediatamente.
        res.status(201).json({ message: "Reserva realizada con éxito.", compraId: compraId });
        
        // AHORA, intentamos enviar el correo de forma asíncrona "en segundo plano".
        // Si esto falla, el usuario no se verá afectado.
        try {
            const infoQuery = `
                SELECT u.email, p.titulo, f.fecha_hora, s.nombre as sala_nombre
                FROM Compras c JOIN Usuarios u ON c.usuario_id = u.id JOIN Funciones f ON c.funcion_id = f.id
                JOIN Peliculas p ON f.pelicula_id = p.id JOIN Salas s ON f.sala_id = s.id
                WHERE c.id = $1
            `;
            const infoResult = await pool.query(infoQuery, [compraId]);
            const details = infoResult.rows[0];

            const compraDetails = {
                userEmail: details.email, peliculaTitulo: details.titulo, fechaFuncion: details.fecha_hora,
                salaNombre: details.sala_nombre, asientos: asientos, totalPagado: totalPagado
            };
            
            sendConfirmationEmail(compraDetails); // No usamos 'await' para que no bloquee

        } catch (emailError) {
            console.error("El envío de email post-compra falló:", emailError);
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en la transacción de reserva:", error);
        // Asegúrate de enviar una respuesta también en caso de error
        if (!res.headersSent) {
            res.status(500).json({ error: "No se pudo procesar la reserva." });
        }
    } finally {
        // Esta línea es CRUCIAL. Se asegura de que la conexión a la BD siempre se libere.
        client.release();
    }
});

app.get('/api/mis-compras', verifyToken, async (req, res) => {
    const usuarioId = req.user.id;
    try {
        const query = `
            SELECT 
                c.id AS compra_id, 
                c.fecha_compra, 
                c.total_pagado, 
                p.titulo AS pelicula_titulo, 
                f.fecha_hora AS funcion_fecha_hora,
                s.nombre as sala_nombre,
                (SELECT STRING_AGG(ar.fila || ar.numero, ', ') FROM Asientos_Reservados ar WHERE ar.compra_id = c.id) as asientos
            FROM Compras c
            JOIN Funciones f ON c.funcion_id = f.id
            JOIN Peliculas p ON f.pelicula_id = p.id
            JOIN Salas s ON f.sala_id = s.id
            WHERE c.usuario_id = $1
            ORDER BY c.fecha_compra DESC;
        `;
        const { rows } = await pool.query(query, [usuarioId]);
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener mis compras:", error);
        res.status(500).json({ error: "No se pudo obtener el historial de compras." });
    }
});

// --- 4. API DE ADMINISTRACIÓN (protegida por [verifyToken, checkAdmin]) ---
// (El resto del código de administración se queda exactamente igual)
app.get('/api/ciudades', [verifyToken, checkAdmin], async (req, res) => res.json((await pool.query('SELECT * FROM Ciudades ORDER BY nombre ASC')).rows));
app.post('/api/ciudades', [verifyToken, checkAdmin], async (req, res) => { const { nombre } = req.body; const { rows } = await pool.query('INSERT INTO Ciudades (nombre) VALUES ($1) RETURNING *', [nombre]); res.status(201).json({ message: "Ciudad creada.", data: rows[0] }); });
app.put('/api/ciudades/:id', [verifyToken, checkAdmin], async (req, res) => { const { id } = req.params; const { nombre } = req.body; const { rows } = await pool.query('UPDATE Ciudades SET nombre = $1 WHERE id = $2 RETURNING *', [nombre, id]); res.json({ message: "Ciudad actualizada.", data: rows[0] }); });
app.delete('/api/ciudades/:id', [verifyToken, checkAdmin], async (req, res) => { await pool.query('DELETE FROM Ciudades WHERE id = $1', [req.params.id]); res.status(200).json({ message: 'Ciudad eliminada.' }); });

app.get('/api/salas', [verifyToken, checkAdmin], async (req, res) => { const query = `SELECT s.id, s.nombre, s.filas, s.columnas, s.ciudad_id, c.nombre AS ciudad_nombre FROM Salas s LEFT JOIN Ciudades c ON s.ciudad_id = c.id ORDER BY c.nombre, s.nombre;`; res.json((await pool.query(query)).rows); });
app.post('/api/salas', [verifyToken, checkAdmin], async (req, res) => { const { nombre, filas, columnas, ciudad_id } = req.body; const { rows } = await pool.query('INSERT INTO Salas (nombre, filas, columnas, ciudad_id) VALUES ($1, $2, $3, $4) RETURNING *', [nombre, filas, columnas, ciudad_id]); res.status(201).json({ message: "Sala creada.", data: rows[0] }); });
app.put('/api/salas/:id', [verifyToken, checkAdmin], async (req, res) => { const { id } = req.params; const { nombre, filas, columnas, ciudad_id } = req.body; const { rows } = await pool.query('UPDATE Salas SET nombre = $1, filas = $2, columnas = $3, ciudad_id = $4 WHERE id = $5 RETURNING *', [nombre, filas, columnas, ciudad_id, id]); res.json({ message: "Sala actualizada.", data: rows[0] }); });
app.delete('/api/salas/:id', [verifyToken, checkAdmin], async (req, res) => { await pool.query('DELETE FROM Salas WHERE id = $1', [req.params.id]); res.status(200).json({ message: 'Sala eliminada.' }); });

app.post('/api/peliculas', [verifyToken, checkAdmin], async (req, res) => { const d = req.body; const { rows } = await pool.query('INSERT INTO Peliculas (titulo, sinopsis, director, genero, duracion_minutos, clasificacion, url_poster) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', [d.titulo, d.sinopsis, d.director, d.genero, d.duracion_minutos, d.clasificacion, d.url_poster]); res.status(201).json({ message: "Película añadida.", data: rows[0] }); });
app.put('/api/peliculas/:id', [verifyToken, checkAdmin], async (req, res) => { const { id } = req.params; const d = req.body; const { rows } = await pool.query('UPDATE Peliculas SET titulo=$1, sinopsis=$2, director=$3, genero=$4, duracion_minutos=$5, clasificacion=$6, url_poster=$7 WHERE id=$8 RETURNING *', [d.titulo, d.sinopsis, d.director, d.genero, d.duracion_minutos, d.clasificacion, d.url_poster, id]); res.json({ message: "Película actualizada.", data: rows[0] }); });
app.delete('/api/peliculas/:id', [verifyToken, checkAdmin], async (req, res) => { await pool.query('DELETE FROM Peliculas WHERE id = $1', [req.params.id]); res.status(200).json({ message: 'Película eliminada.' }); });

app.get('/api/funciones', [verifyToken, checkAdmin], async (req, res) => { const query = `SELECT f.id, f.fecha_hora, f.precio_boleto, f.pelicula_id, f.sala_id, p.titulo AS pelicula_titulo, s.nombre AS sala_nombre, c.nombre AS ciudad_nombre FROM Funciones f JOIN Peliculas p ON f.pelicula_id = p.id JOIN Salas s ON f.sala_id = s.id LEFT JOIN Ciudades c ON s.ciudad_id = c.id ORDER BY f.fecha_hora DESC;`; res.json((await pool.query(query)).rows); });
app.post('/api/funciones', [verifyToken, checkAdmin], async (req, res) => { const { pelicula_id, sala_id, fecha_hora, precio_boleto } = req.body; const { rows } = await pool.query('INSERT INTO Funciones (pelicula_id, sala_id, fecha_hora, precio_boleto) VALUES ($1, $2, $3, $4) RETURNING *', [pelicula_id, sala_id, fecha_hora, precio_boleto]); res.status(201).json({ message: "Función creada.", data: rows[0] }); });
app.put('/api/funciones/:id', [verifyToken, checkAdmin], async (req, res) => { const { id } = req.params; const { pelicula_id, sala_id, fecha_hora, precio_boleto } = req.body; const { rows } = await pool.query('UPDATE Funciones SET pelicula_id = $1, sala_id = $2, fecha_hora = $3, precio_boleto = $4 WHERE id = $5 RETURNING *', [pelicula_id, sala_id, fecha_hora, precio_boleto, id]); res.json({ message: "Función actualizada.", data: rows[0] }); });
app.delete('/api/funciones/:id', [verifyToken, checkAdmin], async (req, res) => { await pool.query('DELETE FROM Funciones WHERE id = $1', [req.params.id]); res.status(200).json({ message: 'Función eliminada.' }); });

app.put('/api/usuarios/:id/cambiar-rol', [verifyToken, checkAdmin], async (req, res) => {
    const { id } = req.params; // El ID del usuario a modificar
    const { rol } = req.body;   // El nuevo rol que enviaremos desde Postman

    // Validación simple para asegurarnos de que el rol es uno de los permitidos
    if (!rol || (rol !== 'cliente' && rol !== 'administrador')) {
        return res.status(400).json({ error: "Rol no válido. Debe ser 'cliente' o 'administrador'." });
    }

    try {
        const query = 'UPDATE Usuarios SET rol = $1 WHERE id = $2 RETURNING id, nombre, email, rol';
        const { rows } = await pool.query(query, [rol, id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        res.json({ message: "Rol de usuario actualizado con éxito.", usuario: rows[0] });

    } catch (error) {
        console.error("Error al cambiar el rol del usuario:", error);
        res.status(500).json({ error: "Error interno del servidor." });
    }
});
// --- 5. INICIAR SERVIDOR ---
app.listen(PORT, () => { console.log(`Servidor corriendo en http://localhost:${PORT}`); });