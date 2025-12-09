require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// exceptions
const ClientError = require('./exceptions/ClientError');

// utils
const TokenManager = require('./tokenize/TokenManager');

// Machines
const machines = require('./api/machines');
const MachinesService = require('./services/postgres/MachinesService');
const MachineValidator = require('./validator/machines/index');

// Sensors
const sensors = require('./api/sensors');
const SensorsService = require('./services/postgres/SensorsService');
const SensorValidator = require('./validator/sensors/index');

// Diagnostics
const diagnostics = require('./api/diagnostics');
const DiagnosticsService = require('./services/postgres/DiagnosticsService');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationValidator = require('./validator/authentications/index');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UserValidator = require('./validator/users/index');

const init = async () => {
    const machinesService = new MachinesService();
    const sensorsService = new SensorsService();
    const diagnosticsService = new DiagnosticsService();
    const authenticationsService = new AuthenticationsService();
    const usersService = new UsersService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: Jwt,
        },
    ]);

    server.auth.strategy('pm_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });

    await server.register([
        {
            plugin: machines,
            options: {
                service: machinesService,
                validator: MachineValidator,
            },
        },
        {
            plugin: sensors,
            options: {
                service: sensorsService,
                validator: SensorValidator,
            },
        },
        {
            plugin: diagnostics,
            options: {
                diagnosticsService,
                sensorsService,
                machinesService,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationValidator,
            },
        },
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UserValidator,
            },
        },
    ]);

    server.ext('onPreResponse', (request, h) => {
        const { response } = request;

        if (response instanceof ClientError) {
            return h
                .response({
                    status: 'fail',
                    message: response.message,
                })
                .code(response.statusCode);
        }

        console.log(response);
        return h.continue;
    });

    await server.start();
    console.log(`Server is running at ${server.info.uri}`);
}

init();
