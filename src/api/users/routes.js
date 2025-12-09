const routes = (handler) => [
    {
        method: 'POST',
        path: '/users',
        handler: handler.postUserHandler,
        options: {
            tags: ['api', 'users'],
            description: 'Register a new user',
            notes: 'Creates a new user account',
        },
    },
    {
        method: 'GET',
        path: '/users/{id}',
        handler: handler.getUserByIdHandler,
        options: {
            tags: ['api', 'users'],
            description: 'Get user by ID',
            notes: 'Returns user information by ID',
        },
    },
];

module.exports = routes;
