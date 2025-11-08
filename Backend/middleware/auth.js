// /backend/middleware/auth.js (VERSIÓN FINAL Y ROBUSTA DEFINITIVA)

const jwt = require('jsonwebtoken');

// Middleware para verificar que el token es válido (para CUALQUIER usuario logueado)
const verifyToken = (req, res, next) => {
    // 1. Obtener la cabecera de autorización
    const authHeader = req.headers['authorization'];

    // 2. Si no hay cabecera, responder inmediatamente con un error.
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }

    // 3. El formato debe ser "Bearer <token>". Lo separamos.
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Formato de token inválido. Debe ser "Bearer <token>".' });
    }

    try {
        // 4. Verificamos el token con nuestro secreto.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 5. Si es válido, guardamos los datos del usuario en el objeto 'req'
        req.user = decoded;
        
        // 6. ¡LA PARTE MÁS IMPORTANTE! Continuamos al siguiente middleware o a la ruta final.
        next();
    } catch (err) {
        // 7. Si jwt.verify falla (token inválido o expirado), respondemos con un error.
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

// Middleware para verificar que el usuario es Administrador (se ejecuta después de verifyToken)
const checkAdmin = (req, res, next) => {
    // req.user ya debería existir gracias a verifyToken, pero verificamos por si acaso.
    if (!req.user || req.user.rol !== 'administrador') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    // Si el rol es correcto, continuamos.
    next();
};

module.exports = {
    verifyToken,
    checkAdmin
};