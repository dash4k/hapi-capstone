const routes = (handler) => [
    {
        method: 'POST',
        path: '/sensors',
        handler: handler.postSensorDataHandler,
        options: {
            tags: ['api', 'sensors'],
            description: 'Add sensor data',
            notes: 'Records new sensor data for a machine',
        },
    },
    {
        method: 'GET',
        path: '/sensors/{machineId}/history',
        handler: handler.getSensorDataHistoryHandler,
        options: {
            tags: ['api', 'sensors'],
            description: 'Get sensor data history',
            notes: 'Returns historical sensor data for a specific machine',
        },
    },
    {
        method: 'GET',
        path: '/sensors/{machineId}/latest',
        handler: handler.getLatestSensorDataHandler,
        options: {
            tags: ['api', 'sensors'],
            description: 'Get latest sensor data',
            notes: 'Returns the most recent sensor data for a specific machine',
        },
    },
];

module.exports = routes;
