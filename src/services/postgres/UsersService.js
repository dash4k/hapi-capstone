const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class UsersService {
    constructor() {
        this._pool = new Pool();
    }

    async addUser({ username, password, fullname, role }) {
        await this.verifyNewUsername(username);

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await this._pool.query({
            text: 'INSERT INTO users (username, password, fullname, role) VALUES($1, $2, $3, $4) RETURNING id',
            values: [username, hashedPassword, fullname, role],
        });

        if (!result.rows.length) {
            throw new InvariantError('Failed to add new User');
        }

        return result.rows[0].id;
    }

    async verifyNewUsername(username) {
        const result = await this._pool.query({
            text: 'SELECT username FROM users WHERE username = $1',
            values: [username],
        });

        if (result.rows.length > 0) {
            throw new InvariantError('Failed to add new User. Username is already used');
        }
    }

    async getUserById(userId) {
        const result = await this._pool.query({
            text: 'SELECT id, username, fullname, role FROM users WHERE id = $1',
            values: [userId],
        });

        if (!result.rows.length) {
            throw new NotFoundError('User not found');
        }

        return result.rows[0];
    }

    async getAllUsers() {
        const result = await this._pool.query({
            text: 'SELECT id, username, fullname, role FROM users ORDER BY id',
        });

        return result.rows;
    }

    // unused for now
    async updateUserById(userId, { username, fullname, role }) {
        const result = await this._pool.query({
            text: 'UPDATE users SET username = $1, fullname = $2, role = $3 WHERE id = $4 RETURNING id',
            values: [username, fullname, role, userId],
        });
        if (!result.rows.length) {
            throw new NotFoundError('User not found');
        }
        return;
    }

    async deleteUserById(userId) {
        const result = await this._pool.query({
            text: 'DELETE FROM users WHERE id = $1 RETURNING id',
            values: [userId],
        });
        if (!result.rows.length) {
            throw new NotFoundError('User not found');
        }
        return;
    }

    async verifyUserCredential({ username, password }) {
        const result = await this._pool.query({
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username],
        });

        if (!result.rows.length) {
            throw new AuthenticationError('The credentials provided is invalid');
        }

        const { id, password: hashedPassword } = result.rows[0];

        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            throw new AuthenticationError('The credentials provided is invalid');
        }

        return id;
    }

    async verifyUserExist(id) {
        const result = await this._pool.query({
            text: 'SELECT id FROM users where id = $1',
            values: [id],
        });

        if (!result.rows.length) {
            throw new NotFoundError('User not found');
        }
    }
}

module.exports = UsersService;
