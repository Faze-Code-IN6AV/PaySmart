import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PaySmart - Product Service API',
            version: 'v1',
            description: 'API de gestion de productos y compras para PaySmart.',
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
    apis: [
        './src/product/product.routes.js',
        './src/purchase/purchase.routes.js'
    ]
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app, basePath) => {
    app.use(`${basePath}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    console.log(`Swagger disponible en: ${basePath}/docs`);
};