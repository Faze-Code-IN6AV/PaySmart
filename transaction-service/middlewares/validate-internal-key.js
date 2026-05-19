'use strict';

/**
 * Middleware para proteger los endpoints /internal entre microservicios.
 */
export const validateInternalApiKey = (req, res, next) => {
    const apiKey = req.headers['x-internal-api-key'];

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: 'API Key interna requerida',
            error: 'MISSING_INTERNAL_API_KEY'
        });
    }

    if (apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({
            success: false,
            message: 'API Key interna inválida',
            error: 'INVALID_INTERNAL_API_KEY'
        });
    }

    next();
};
