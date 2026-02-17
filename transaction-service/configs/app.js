'use strict'

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { dbConnection } from './db.js';

const BASE_PATH = '/paySmart/v1'

const middleware = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors());
    app.use(morgan('dev'));
    app.use(helmet());
}

const routes = (app) => {
    

    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'healthy',
            service: 'PaySmart Admin Server'
        });
    });
}

export const initServer = async() => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('true proxy', 1);

    try {
        await dbConnection();
        middleware(app);
        routes(app);

        app.listen(PORT, () => {
            console.log(`PaySmart's Admin Server running on port: ${PORT}`);
            console.log(`Health Check: http://localhost:${PORT}${BASE_PATH}/health`);
        });
    }catch(err){
        console.error(`Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }
}