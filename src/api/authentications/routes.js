const routes = (handler) => [
    {
        method: 'POST',
        path: '/authentications',
        handler: handler.postAuthenticationHandler,
        options: {
            tags: ['api', 'authentications'],
            description: 'User login',
            notes: 'Authenticates a user and returns access and refresh tokens',
        },
    },
    {
        method: 'PUT',
        path: '/authentications',
        handler: handler.putAuthenticationHandler,
        options: {
            tags: ['api', 'authentications'],
            description: 'Refresh access token',
            notes: 'Generates a new access token using a refresh token',
        },
    },
    {
        method: 'DELETE',
        path: '/authentications',
        handler: handler.deleteAuthenticationHandler,
        options: {
            tags: ['api', 'authentications'],
            description: 'User logout',
            notes: 'Deletes the refresh token to log out the user',
        },
    },
];

module.exports = routes;
