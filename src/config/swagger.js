const swaggerOptions = {
    info: {
        title: 'Predictive Maintenance API Documentation',
        version: '1.0.0',
        description: 'API documentation for Predictive Maintenance System',
    },
    schemes: ['http', 'https'],
    host: `${process.env.HOST}:${process.env.PORT}`,
    documentationPath: '/documentation',
    jsonPath: '/swagger.json',
    grouping: 'tags',
    tags: [
        { name: 'machines', description: 'Machine management endpoints' },
        { name: 'sensors', description: 'Sensor data endpoints' },
        { name: 'diagnostics', description: 'Diagnostic endpoints' },
        { name: 'users', description: 'User management endpoints' },
        { name: 'authentications', description: 'Authentication endpoints' },
    ],
    securityDefinitions: {
        jwt: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
        },
    },
};

module.exports = swaggerOptions;
