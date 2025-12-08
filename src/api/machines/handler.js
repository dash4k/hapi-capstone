const autoBind = require('auto-bind');

class MachinesHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postMachineHandler(request, h) {
        this._validator.validatePostPayload(request.payload);

        const machineId = await this._service.addMachine(request.payload);

        return h
            .response({
                status: 'success',
                message: 'Machine added successfully',
                data: {
                    machineId,
                },
            })
            .code(201);
    }

    async getMachinesHandler(request, h) {
        const machines = await this._service.listAllMachines();

        return h
            .response({
                status: 'success',
                data: {
                    machines,
                },
            })
            .code(200);
    }

    async getMachineByIdHandler(request, h) {
        const { id } = request.params;
        const machine = await this._service.getMachine(id);

        return h
            .response({
                status: 'success',
                data: {
                    machine,
                },
            })
            .code(200);
    }
}

module.exports = MachinesHandler;
