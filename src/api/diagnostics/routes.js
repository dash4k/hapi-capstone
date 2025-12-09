const routes = (handler) => [
    {
        method: 'POST',
        path: '/diagnostics/{machineId}',
        handler: handler.postDiagnosticHandler,
        options: {
            tags: ['api', 'diagnostics'],
            description: 'Run diagnostics',
            notes: 'Runs diagnostic analysis on the latest sensor data for a machine',
        },
    },
    {
        method: 'GET',
        path: '/diagnostics/{machineId}',
        handler: handler.getDiagnosticHandler,
        options: {
            tags: ['api', 'diagnostics'],
            description: 'Get diagnostic history',
            notes: 'Returns diagnostic history for a specific machine',
        },
    },
];

module.exports = routes;
