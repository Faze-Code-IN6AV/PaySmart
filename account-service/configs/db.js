'use strict';

import mongoose from 'mongoose';

export const dbConnection = async () => {
    try {
        mongoose.connection.on('error', () => {
            console.log('MongoDB | ¡No se pudo conectar a MongoDB!');
            mongoose.disconnect();
        });

        mongoose.connection.on('connecting', () => {
            console.log('MongoDB | Intentando conectar a MongoDB...');
        });

        mongoose.connection.on('connected', () => {
            console.log('MongoDB | Conectado a MongoDB.');
        });

        mongoose.connection.on('open', () => {
            console.log('MongoDB | Conectado a la Base de Datos "PaySmart".');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB | Reconectado a MongoDB...');
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | Desconectado de MongoDB.');
        });

        await mongoose.connect(process.env.URI_MONGODB, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
            autoIndex: false
        });

    } catch (error) {
        console.error(`Error al conectar la DB: ${error}`);
        process.exit(1);
    }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`MongoDB | Received ${signal}. Closing database connection...`);

    try {
        await mongoose.connection.close();
        console.log('MongoDB | Database connection closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB | Error during graceful shutdown:', error.message);
        process.exit(1);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
