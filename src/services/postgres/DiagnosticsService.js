const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class DiagnosticsService {
    constructor() {
        this._pool = new Pool();
    }

    async addDiagnostic({
        machine_id,
        timestamp,
        risk_score,
        failure_prediction,
        failure_type_probabilities,
        most_likely_failure,
        recommended_action,
        feature_contributions
    }) {

        console.log({
            machine_id,
            timestamp,
            risk_score,
            failure_prediction,
            failure_type_probabilities,
            most_likely_failure,
            recommended_action,
            feature_contributions
        })

        console.log("TYPES:", {
            failure_prediction: typeof failure_prediction,
            failure_type_probabilities: typeof failure_type_probabilities,
            feature_contributions: typeof feature_contributions,
        });

        const result = await this._pool.query({
            text: `
                INSERT INTO diagnostics (
                    machine_id,
                    timestamp,
                    risk_score,
                    failure_prediction,
                    failure_type_probabilities,
                    most_likely_failure,
                    recommended_action,
                    feature_contributions
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `,
            values: [
                machine_id,
                timestamp,
                risk_score,
                JSON.stringify(failure_prediction),
                JSON.stringify(failure_type_probabilities),
                most_likely_failure,
                recommended_action,
                JSON.stringify(feature_contributions) 
            ],
        });

        if (!result.rows[0].id) {
            throw new InvariantError('Failed to add new diagnostics');
        }

        return result.rows[0].id;
    }

    async getDiagnostics(machineId, limit=10) {
        const result = await this._pool.query({
            text: 'SELECT * FROM diagnostics WHERE machine_id = $1 ORDER BY timestamp DESC limit $2',
            values: [machineId, limit],
        });

        if (!result.rows.length) {
            throw new NotFoundError('Diagnostic not found');
        }

        return result.rows;
    }
}

module.exports = DiagnosticsService;
