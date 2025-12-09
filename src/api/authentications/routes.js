const Joi = require('joi');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/authentications',
        handler: handler.postAuthenticationHandler,
        options: {
            tags: ['api', 'authentications'],
            description: 'User login',
            notes: 'Authenticates a user and returns access and refresh tokens',
            validate: {
                payload: Joi.object({
                    username: Joi.string().required().description('Username').example('johndoe'),
                    password: Joi.string().required().description('Password').example('password123'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        201: {
                            description: 'Authentication successful',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Authentication added successfully'),
                                data: Joi.object({
                                    accessToken: Joi.string().example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
                                    refreshToken: Joi.string().example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
                                }),
                            }),
                        },
                        401: {
                            description: 'Authentication failed - invalid credentials',
                        },
                    },
                },
            },
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
            validate: {
                payload: Joi.object({
                    refreshToken: Joi.string().required().description('Refresh token').example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Access token refreshed successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Access Token updated successfully'),
                                data: Joi.object({
                                    accessToken: Joi.string().example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
                                }),
                            }),
                        },
                        400: {
                            description: 'Invalid or expired refresh token',
                        },
                    },
                },
            },
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
            validate: {
                payload: Joi.object({
                    refreshToken: Joi.string().required().description('Refresh token').example('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'Logout successful',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('Access Token deleted successfully'),
                            }),
                        },
                        400: {
                            description: 'Invalid refresh token',
                        },
                    },
                },
            },
        },
    },
];

module.exports = routes;
