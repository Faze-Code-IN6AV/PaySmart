'use strict'

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { dbConnection } from './db.js';
import { corsOptions } from './cors.configuration.js';
import { helmetOptions } from './helmet.configuration.js';
import { requestLimit } from './rateLimit.configuration.js';
import { errorHandler } from '../middlewares/handle-errors.js';
import favoriteAccountRoutes from '../src/favoriteaccounts/favoriteAccount.routes.js';

const BASE_PATH = '/paySmart/v1'

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(morgan('dev'));
    app.use(helmet(helmetOptions));
    app.use(requestLimit);
};

const routes = (app) => {
    app.use(`${BASE_PATH}/favoriteAccounts`, favoriteAccountRoutes);

    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'healthy',
            service: 'PaySmart Favorite Account Service'
        });
    });
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3035;
    app.set('trust proxy', 1);

    try {
        await dbConnection();
        middlewares(app);
        routes(app);

        app.use(errorHandler);
        app.listen(PORT, () => {
            console.log(`PaySmart's Favorite Account Service running on port: ${PORT}`);
            console.log(`Health Check: http://localhost:${PORT}${BASE_PATH}/health`);
        });
    } catch (err) {
        console.error(`Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }
}