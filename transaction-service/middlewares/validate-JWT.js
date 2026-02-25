'use strict';

import jwt from 'jsonwebtoken';

/**
 * Middleware para validar JWT y extraer información del usuario
 * req.user = { id, email, role }
 */
export const middleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verificar token usando el mismo secret que AuthService
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Mapear claims relevantes a req.user
        req.user = {
            id: decoded.sub,               // ID del usuario
            email: decoded.email || decoded.Email,  // Email del usuario
            role: decoded.role             // Role del usuario
        };

        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};