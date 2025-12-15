const autoBind = require("auto-bind");
const { default: axios } = require("axios");

class DiagnosticsHandler {
    constructor(diagnosticsService, sensorsService, machinesService, notificationsService) {
        this._diagnosticsService = diagnosticsService;
        this._sensorsService = sensorsService;
        this._machinesService = machinesService;
        this._notificationsService = notificationsService;

        autoBind(this);
    }

    async postDiagnosticHandler(request, h) {
        const { machineId } = request.params;

        const sensor = await this._sensorsService.getLatestSensorData(machineId);
        const machine = await this._machinesService.getMachine(machineId);

        console.log("Sensor Payload Sent to FastAPI:", sensor);

        const payload = {
            machine_id: String(sensor.machine_id),
            Type: machine.type,
            "Air temperature": parseFloat(sensor.air_temp),
            "Process temperature": parseFloat(sensor.process_temp),
            "Rotational speed": parseInt(sensor.rotational_speed),
            "Torque": parseFloat(sensor.torque),
            "Tool wear": parseInt(sensor.tool_wear)
        };

        let response;
        try {
            response = await axios.post(
                `${process.env.FASTAPIPROTOCOL}://${process.env.FASTAPIHOST}:${process.env.FASTAPIPORT}/api/predict`,
                payload,
                { timeout: 10000 }
            );
        } catch (error) {
            if (error.response) {
                console.error("FastAPI Validation Error:", JSON.stringify(error.response.data, null, 2));
            }
            throw error;
        }

        const diagnostics = {
            ...response.data,
            timestamp: new Date().toISOString()
        };

        console.log("TYPES:", {
            failure_prediction: typeof diagnostics.failure_prediction,
            failure_type_probabilities: typeof diagnostics.failure_type_probabilities,
            feature_contributions: typeof diagnostics.feature_contributions,
        });

        console.log("RAW feature_contributions:", diagnostics.feature_contributions);


        const diagnosticsId = await this._diagnosticsService.addDiagnostic(diagnostics);

        // Create notification if failure is predicted
        if (diagnostics.failure_prediction === 1) {
            const failureTypes = diagnostics.failure_type_probabilities || {};
            const maxProb = Math.max(...Object.values(failureTypes));
            const failureType = Object.keys(failureTypes).find(key => failureTypes[key] === maxProb);
            
            const level = maxProb > 0.7 ? 'critical' : 'warning';
            const message = failureType 
                ? `${failureType} failure predicted with ${(maxProb * 100).toFixed(1)}% probability`
                : `Machine failure predicted - immediate inspection recommended`;
            
            try {
                await this._notificationsService.addNotification({
                    machineId: parseInt(machineId),
                    level,
                    message,
                });
            } catch (error) {
                console.error('Failed to create notification:', error);
            }
        }

        return h
            .response({
                status: 'success',
                message: 'Diagnostics added successfully',
                data: { diagnosticsId },
            })
            .code(201);
    }

    async postBulkDiagnosticsHandler(request, h) {
        const machines = await this._machinesService.listAllMachines();
        const results = [];
        const errors = [];

        for (const machine of machines) {
            const machineId = machine.id;
            try {
                const sensor = await this._sensorsService.getLatestSensorData(machineId);
                const machine = await this._machinesService.getMachine(machineId);

                const payload = {
                    machine_id: String(sensor.machine_id),
                    Type: machine.type,
                    "Air temperature": parseFloat(sensor.air_temp),
                    "Process temperature": parseFloat(sensor.process_temp),
                    "Rotational speed": parseInt(sensor.rotational_speed),
                    "Torque": parseFloat(sensor.torque),
                    "Tool wear": parseInt(sensor.tool_wear)
                };

                const response = await axios.post(
                    `${process.env.FASTAPIPROTOCOL}://${process.env.FASTAPIHOST}:${process.env.FASTAPIPORT}/api/predict`,
                    payload,
                    { timeout: 10000 }
                );

                const diagnostics = {
                    ...response.data,
                    timestamp: new Date().toISOString()
                };

                const diagnosticsId = await this._diagnosticsService.addDiagnostic(diagnostics);
                
                // Create notification if failure is predicted
                if (diagnostics.failure_prediction === 1) {
                    const failureTypes = diagnostics.failure_type_probabilities || {};
                    const maxProb = Math.max(...Object.values(failureTypes));
                    const failureType = Object.keys(failureTypes).find(key => failureTypes[key] === maxProb);
                    
                    const level = maxProb > 0.7 ? 'critical' : 'warning';
                    const message = failureType 
                        ? `${failureType} failure predicted with ${(maxProb * 100).toFixed(1)}% probability`
                        : `Machine failure predicted - immediate inspection recommended`;
                    
                    try {
                        await this._notificationsService.addNotification({
                            machineId: parseInt(machineId),
                            level,
                            message,
                        });
                    } catch (error) {
                        console.error('Failed to create notification:', error);
                    }
                }
                
                results.push({
                    machineId,
                    diagnosticsId,
                    success: true
                });
            } catch (error) {
                errors.push({
                    machineId,
                    error: error.message,
                    success: false
                });
            }
        }
        
        return h
            .response({
                status: errors.length === machines.length ? 'fail' : 'success',
                message: `Processed ${results.length} of ${machines.length} machines`,
                data: {
                    successful: results,
                    failed: errors,
                    total: machines.length,
                    successCount: results.length,
                    failureCount: errors.length
                },
            })
            .code(errors.length === machines.length ? 500 : 201);
    }

    async getDiagnosticHandler(request, h) {
        const { machineId } = request.params;
        const { limit } = request.query;

        const diagnostics = await this._diagnosticsService.getDiagnostics(machineId, limit);

        return h
            .response({
                status: 'success',
                data: {
                    diagnostics,
                },
            })
            .code(200);
    }

    async getLatestDiagnosticsHandler(request, h) {
        const diagnostics = await this._diagnosticsService.getLatestDiagnostics();

        return h
            .response({
                status: 'success',
                data: {
                    diagnostics,
                },
            })
            .code(200);
    }
}

module.exports = DiagnosticsHandler;
