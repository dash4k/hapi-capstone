const swaggerOptions = {
    info: {
        title: 'Predictive Maintenance API Documentation',
        version: '1.0.0',
        description: 'API documentation for Predictive Maintenance System - Monitor machines, collect sensor data, and predict failures',
        contact: {
            name: 'API Support',
            email: 'support@example.com',
        },
    },
    schemes: ['http', 'https'],
    documentationPath: '/documentation',
    jsonPath: '/swagger.json',
    swaggerUIPath: '/swaggerui/',
    grouping: 'tags',
    sortEndpoints: 'ordered',
    tags: [
        {
            name: 'authentications',
            description: 'Authentication endpoints - Login, logout, and token refresh',
        },
        {
            name: 'users',
            description: 'User management endpoints - Register and retrieve user information',
        },
        {
            name: 'machines',
            description: 'Machine management endpoints - Add and retrieve machine information',
        },
        {
            name: 'sensors',
            description: 'Sensor data endpoints - Record and retrieve sensor readings',
        },
        {
            name: 'diagnostics',
            description: 'Diagnostic endpoints - Run predictive analysis and retrieve diagnostic history',
        },
        {
            name: 'agent',
            description: 'AI Agent endpoints - Chat with maintenance assistant, get recommendations, and system overview',
        },
    ],
    securityDefinitions: {
        jwt: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'JWT token for authentication. Format: Bearer {token}',
        },
    },
};

module.exports = swaggerOptions;
