const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SensorsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSensorData({ 
        machineId, 
        airTemp, 
        processTemp, 
        rotationalSpeed, 
        torque, 
        toolWear 
    }) {
        const timestamp = new Date().toISOString();

        const result = await this._pool.query({
            text: `
                INSERT INTO sensor_data (
                    machine_id,
                    air_temp,
                    process_temp,
                    rotational_speed,
                    torque,
                    tool_wear,
                    timestamp
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `,
            values: [
                machineId,
                airTemp,
                processTemp,
                rotationalSpeed,
                torque,
                toolWear,
                timestamp,
            ],
        });

        if (!result.rows[0].id) {
            throw new InvariantError('Failed to add new sensor data');
        }

        return result.rows[0].id;
    }

    async getLatestSensorData(machineId) {
        const result = await this._pool.query({
            text: 'SELECT * FROM sensor_data WHERE machine_id = $1 ORDER BY timestamp DESC LIMIT 1',
            values: [machineId],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Sensor data not found');
        }

        return result.rows[0];
    }

    async getSensorDataHistory(machineId, limit=10) {
        const result = await this._pool.query({
            text: 'SELECT * FROM sensor_data WHERE machine_id = $1 ORDER BY timestamp DESC LIMIT $2',
            values: [machineId, limit],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Sensor data not found');
        }
        
        return result.rows;
    }
}

module.exports = SensorsService;
