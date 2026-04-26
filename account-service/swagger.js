import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PaySmart - Account Service API',
            version: 'v1',
            description: 'API de gestión de cuentas bancarias para PaySmart.',
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
    apis: ['./src/account/account.routes.js']
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app, basePath) => {
    app.use(`${basePath}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger disponible en: ${basePath}/docs`);
};