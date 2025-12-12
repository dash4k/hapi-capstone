require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');

// exceptions
const ClientError = require('./exceptions/ClientError');

// utils
const TokenManager = require('./tokenize/TokenManager');
const swaggerOptions = require('./config/swagger');

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

// Agent (AI Maintenance Assistant)
const agent = require('./api/agent');
const AgentService = require('./services/agent/AgentService');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationValidator = require('./validator/authentications/index');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UserValidator = require('./validator/users/index');
const AgentValidator = require('./validator/agent');

const init = async () => {
    const machinesService = new MachinesService();
    const sensorsService = new SensorsService();
    const diagnosticsService = new DiagnosticsService();
    const authenticationsService = new AuthenticationsService();
    const usersService = new UsersService();
    
    const agentService = new AgentService(
        diagnosticsService,
        sensorsService,
        machinesService
    );
    
    setInterval(() => {
        agentService.cleanupSessions(30);
    }, 5 * 60 * 1000);

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    // Register Swagger and authentication plugins
    await server.register([
        {
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
        {
            plugin: Vision,
        },
        {
            plugin: HapiSwagger,
            options: swaggerOptions,
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

    // Register API plugins
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
        {
            plugin: agent,
            options: {
                service: agentService,
                validator: AgentValidator,
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
    console.log(`Swagger documentation available at ${server.info.uri}/documentation`);
}

init();
