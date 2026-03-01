'use strict';

import jwt from 'jsonwebtoken';

// Middleware para validar el token JWT en cada request protegido
export const validateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado',
            error: 'MISSING_TOKEN'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verificar token usando el mismo secret que AuthService
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });

        // Exponer solo la info necesaria del usuario en el request
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            role: decoded.role || 'USER_ROLE'
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'El token ha expirado',
                error: 'TOKEN_EXPIRED'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Token inválido',
            error: 'INVALID_TOKEN'
        });
    }
};