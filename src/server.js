require('dotenv').config();
const Hapi = require('@hapi/hapi');

// exceptions
const ClientError = require('./exceptions/ClientError');

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

const init = async () => {
    const machinesService = new MachinesService();
    const sensorsService = new SensorsService();
    const diagnosticsService = new DiagnosticsService();

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
