const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class MachinesService {
    constructor() {
        this._pool = new Pool();
    }

    async addMachine({ name, type }) {
        const time = new Date().toISOString();
        
        const result = await this._pool.query({
            text: 'INSERT INTO machines (name, type, timestamp) VALUES($1, $2, $3) RETURNING id',
            values: [name, type, time],
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
            text: 'SELECT * FROM machines ORDER BY timestamp DESC',
        });

        return result.rows;
    }

    async updateMachine(id, updates) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (updates.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(updates.name);
        }
        if (updates.type !== undefined) {
            fields.push(`type = $${paramIndex++}`);
            values.push(updates.type);
        }

        if (fields.length === 0) {
            throw new InvariantError('No fields to update');
        }

        values.push(id);
        const result = await this._pool.query({
            text: `UPDATE machines SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values,
        });

        if (!result.rows.length) {
            throw new NotFoundError('Machine not found');
        }

        return result.rows[0];
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

    async getMachinesCount() {
        const result = await this._pool.query({
            text: 'SELECT COUNT(*) AS total_machine from machines',
        });

        return parseInt(result.rows[0].total_machine, 10);
    }

    async getMachinesHealth() {
        const result = await this._pool.query({
            text: `
                SELECT 
                    machines.id,
                    machines.name,
                    diagnostics.risk_score,
                    ROUND((1 - diagnostics.risk_score) * 100)::INTEGER as health_score,
                    TO_CHAR(diagnostics.timestamp, 'DD-MM-YYYY') as date
                FROM machines
                LEFT JOIN LATERAL (
                    SELECT 
                        risk_score,
                        timestamp
                    FROM diagnostics
                    WHERE diagnostics.machine_id = machines.id
                    ORDER BY diagnostics.timestamp DESC
                    LIMIT 5
                ) diagnostics ON true
                ORDER BY machines.id, diagnostics.timestamp ASC
            `
        });
        
        return result.rows.reduce((acc, row) => {
            const machine = acc.find(m => m.id === row.id);
            
            if (machine) {
                machine.healthHistory.push({
                    health: row.health_score,
                    date: row.date
                });
            } else {
                acc.push({
                    id: row.id,
                    name: row.name,
                    healthHistory: row.health_score ? [{
                        health: row.health_score,
                        date: row.date
                    }] : []
                });
            }
            return acc;
        }, []);
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
