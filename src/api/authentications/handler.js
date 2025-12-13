const autoBind = require("auto-bind");

class AuthenticationsHandler {
    constructor(authenticationsService, usersService, tokenManager, validator) {
        this._authenticationsService = authenticationsService;
        this._usersService = usersService;
        this._tokenManager = tokenManager;
        this._validator = validator;

        autoBind(this);
    }

    async postAuthenticationHandler(request, h) {
        this._validator.validatePostAuthenticationPayload(request.payload);

        const id = await this._usersService.verifyUserCredential(request.payload);

        const accessToken = this._tokenManager.generateAccessToken({ id });
        const refreshToken = this._tokenManager.generateRefreshToken({ id });

        await this._authenticationsService.addRefreshToken(refreshToken);

        return h
            .response({
                status: 'success',
                message: 'Authentication added successfully',
                data: {
                    accessToken,
                    refreshToken,
                },
            })
            .code(201);
    }

    async putAuthenticationHandler(request, h) {
        this._validator.validatePutAuthenticationPayload(request.payload);

        const { refreshToken: oldRefreshToken } = request.payload;
        await this._authenticationsService.verifyRefreshToken(oldRefreshToken);
        const { id } = this._tokenManager.verifyRefreshToken(oldRefreshToken);

        // Generate new tokens
        const accessToken = this._tokenManager.generateAccessToken({ id });
        const refreshToken = this._tokenManager.generateRefreshToken({ id });

        // Rotate refresh token: delete old, add new
        await this._authenticationsService.deleteRefreshToken(oldRefreshToken);
        await this._authenticationsService.addRefreshToken(refreshToken);

        return h
            .response({
                status: 'success',
                message: 'Tokens refreshed successfully',
                data: {
                    accessToken,
                    refreshToken,
                },
            })
            .code(200);
    }

    async deleteAuthenticationHandler(request, h) {
        this._validator.validateDeleteAuthenticationPayload(request.payload);

        const { refreshToken } = request.payload;
        await this._authenticationsService.verifyRefreshToken(refreshToken);
        await this._authenticationsService.deleteRefreshToken(refreshToken);

        return h
            .response({
                status: 'success',
                message: 'Access Token deleted successfully',
            })
            .code(200);
    }
}

module.exports = AuthenticationsHandler;
