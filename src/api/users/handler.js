const autoBind = require("auto-bind");

class UsersHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postUserHandler(request, h) {
        this._validator.validateUserPayload(request.payload);

        const userId = await this._service.addUser(request.payload);

        return h
            .response({
                status: 'success',
                message: 'User added successfully',
                data: {
                    userId,
                },
            })
            .code(201);
    }

    async getUserByIdHandler(request, h) {
        const { id } = request.params;
        const user = await this._service.getUserById(id);

        return h
            .response({
                status: 'success',
                data: {
                    user,
                },
            })
            .code(200);
    }

    async deleteUserByIdHandler(request, h) {
        const { id } = request.params;
        await this._service.deleteUserById(id);
        return h
            .response({
                status: 'success',
                message: 'User deleted successfully',
            })
            .code(200);
    }
}

module.exports = UsersHandler;
