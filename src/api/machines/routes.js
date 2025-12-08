const routes = (handler) => [
    {
        method: 'POST',
        path: '/machines',
        handler: handler.postMachineHandler,
    },
    {
        method: 'GET',
        path: '/machines',
        handler: handler.getMachinesHandler,
    },
    {
        method: 'GET',
        path: '/machines/{id}',
        handler: handler.getMachineByIdHandler,
    },
];

module.exports = routes;
