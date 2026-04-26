import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PaySmart - Transaction Service API',
            version: 'v1',
            description: 'API de transacciones bancarias (depositos, transferencias, compras y reversiones) para PaySmart.',
            contact: {
                name: 'FazeCode'
            }
        },
        components: {
            securitySchemes: {
                Bearer: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Ingresa tu JWT token. Ejemplo: Bearer {token}'
                }
            }
        },
        security: [{ Bearer: [] }]
    },
    apis: ['./src/transactions/transaction.routes.js']
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app, basePath) => {
    app.use(`${basePath}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger disponible en: ${basePath}/docs`);
};