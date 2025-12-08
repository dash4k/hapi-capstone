const routes = (handler) => [
    {
        method: 'POST',
        path: '/sensors',
        handler: handler.postSensorDataHandler,
    },
    {
        method: 'GET',
        path: '/sensors/{machineId}/history',
        handler: handler.getSensorDataHistoryHandler,
    },
    {
        method: 'GET',
        path: '/sensors/{machineId}/latest',
        handler: handler.getLatestSensorDataHandler,
    },
];

module.exports = routes;
