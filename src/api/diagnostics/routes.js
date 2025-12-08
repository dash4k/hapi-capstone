const routes = (handler) => [
    {
        method: 'POST',
        path: '/diagnostics/{machineId}',
        handler: handler.postDiagnosticHandler,
    },
    {
        method: 'GET',
        path: '/diagnostics/{machineId}',
        handler: handler.getDiagnosticHandler,
    },
];

module.exports = routes;
