const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class MachinesService {
    constructor() {
        this._pool = new Pool();
    }

    async addMachine({ id, type, location }) {
        const time = new Date().toISOString();
        
        const result = await this._pool.query({
            text: 'INSERT INTO machines VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, type, location, time],
        });

        if (!result.rows[0].id) {
            throw new InvariantError('Failed to add machine');
        }

        return result.rows[0].id;
    }

    async getMachine(id) {
        const result = await this._pool.query({
            text: 'SELECT * FROM machines WHERE id = $1',
            values: [id],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Machine not found');
        }

        return result.rows[0];
    }

    async listAllMachines() {
        const result = await this._pool.query({
            text: 'SELECT * FROM machines ORDER BY created_at DESC',
        });

        return result.rows;
    }

    async deleteMachine(id) {
        const result = await this._pool.query({
            text: 'DELETE FROM machines WHERE id = $1 RETURNING id',
            values: [id],
        });
        if (!result.rows.length) {
            throw new NotFoundError('Machine not found');
        }
        return;
    }

    // Alias for agent service
    async getMachines() {
        return this.listAllMachines();
    }

    // Alias for agent service
    async getMachineById(id) {
        return this.getMachine(id);
    }
}

module.exports = MachinesService;
