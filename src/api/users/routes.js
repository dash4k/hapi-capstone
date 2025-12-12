const Joi = require('joi');

const routes = (handler) => [
    {
        method: 'POST',
        path: '/users',
        handler: handler.postUserHandler,
        options: {
            tags: ['api', 'users'],
            description: 'Register a new user',
            notes: 'Creates a new user account',
            validate: {
                payload: Joi.object({
                    username: Joi.string().required().description('Username').example('johndoe'),
                    password: Joi.string().min(6).required().description('Password (minimum 6 characters)').example('password123'),
                    fullname: Joi.string().required().description('Full name').example('John Doe'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        201: {
                            description: 'User registered successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('User added successfully'),
                                data: Joi.object({
                                    userId: Joi.number().example(1),
                                }),
                            }),
                        },
                        400: {
                            description: 'Bad request - validation error or username already exists',
                        },
                    },
                },
            },
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
            validate: {
                params: Joi.object({
                    id: Joi.string().required().description('User ID').example('1'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'User retrieved successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                data: Joi.object({
                                    user: Joi.object({
                                        id: Joi.number().example(1),
                                        username: Joi.string().example('johndoe'),
                                        fullname: Joi.string().example('John Doe'),
                                    }),
                                }),
                            }),
                        },
                        404: {
                            description: 'User not found',
                        },
                    },
                },
            },
        },
    },
    {
        method: 'DELETE',
        path: '/users/{id}',
        handler: handler.deleteUserByIdHandler,
        options: {
            tags: ['api', 'users'],
            description: 'Delete user by ID',
            notes: 'Deletes a specific user by their ID',
            validate: {
                params: Joi.object({
                    id: Joi.string().required().description('User ID').example('1'),
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        200: {
                            description: 'User deleted successfully',
                            schema: Joi.object({
                                status: Joi.string().example('success'),
                                message: Joi.string().example('User deleted successfully'),
                            }),
                        },
                        404: {
                            description: 'User not found',
                        },
                    },
                },
            },
        },
    },
];

module.exports = routes;
