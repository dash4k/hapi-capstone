const routes = (handler) => [
    {
        method: 'POST',
        path: '/machines',
        handler: handler.postMachineHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Add a new machine',
            notes: 'Creates a new machine in the system',
        },
    },
    {
        method: 'GET',
        path: '/machines',
        handler: handler.getMachinesHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Get all machines',
            notes: 'Returns a list of all machines',
        },
    },
    {
        method: 'GET',
        path: '/machines/{id}',
        handler: handler.getMachineByIdHandler,
        options: {
            tags: ['api', 'machines'],
            description: 'Get machine by ID',
            notes: 'Returns a specific machine by its ID',
        },
    },
];

module.exports = routes;
