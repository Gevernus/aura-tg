"use strict";
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 8000;
// Parser for JSON data
app.use(bodyParser.json());
// PostgreSQL connection configuration
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'telegramm_aura',
    password: 'sT5lG1pM8c',
    port: 5432,
});
// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    }
    else {
        console.log('Successfully connected to PostgreSQL database');
        release();
    }
});
// Route to check if user exists
app.post('/api/check-user', async (req, res) => {
    const { username } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            res.json({ exists: false });
        }
        else {
            res.json({ exists: true, user: result.rows[0] });
        }
    }
    catch (error) {
        console.error('Error executing database query:', error);
        res.status(500).send('Error executing database query');
    }
});
// Route to register a user
app.post('/api/register', async (req, res) => {
    const { username } = req.body;
    try {
        const result = await pool.query('INSERT INTO users (username) VALUES ($1) RETURNING id', [username]);
        res.json({ id: result.rows[0].id, username });
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Error registering user');
    }
});
// Route to get user data
app.get('/api/user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (result.rows.length === 0) {
            res.status(404).send('User not found');
        }
        else {
            res.json(result.rows[0]);
        }
    }
    catch (error) {
        console.error('Error executing database query:', error);
        res.status(500).send('Error executing database query');
    }
});
// Route to update user's energy
app.post('/api/user/:id/energy', async (req, res) => {
    const userId = req.params.id;
    const { energy } = req.body;
    try {
        await pool.query('UPDATE users SET energy = $1 WHERE id = $2', [energy, userId]);
        res.send('User energy updated successfully');
    }
    catch (error) {
        console.error('Error updating user energy:', error);
        res.status(500).send('Error executing database query');
    }
});
// Route to update user's coins and tap power
app.post('/api/user/:id/update', async (req, res) => {
    const userId = req.params.id;
    const { coins, tap_power } = req.body;
    try {
        await pool.query('UPDATE users SET coins = $1, tap_power = $2 WHERE id = $3', [coins, tap_power, userId]);
        res.send('User data updated successfully');
    }
    catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).send('Error executing database query');
    }
});
// Route to get referrals list
app.get('/api/user/:id/referrals', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM referrals WHERE inviter_id = $1', [userId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Error executing database query:', error);
        res.status(500).send('Error executing database query');
    }
});
// Route to update referral status
app.post('/api/referral/:id/status', async (req, res) => {
    const referralId = req.params.id;
    const { status } = req.body;
    try {
        await pool.query('UPDATE referrals SET status = $1 WHERE id = $2', [status, referralId]);
        res.send('Referral status updated successfully');
    }
    catch (error) {
        console.error('Error updating referral status:', error);
        res.status(500).send('Error executing database query');
    }
});
// Route to claim referral bonus
app.post('/api/user/:id/claim', async (req, res) => {
    const userId = req.params.id;
    const { referralId, bonus } = req.body;
    try {
        await pool.query('BEGIN');
        await pool.query('UPDATE users SET coins = coins + $1 WHERE id = $2', [bonus, userId]);
        await pool.query('UPDATE referrals SET status = $1 WHERE id = $2', ['claimed', referralId]);
        await pool.query('COMMIT');
        res.send('Bonus claimed successfully');
    }
    catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error claiming bonus:', error);
        res.status(500).send('Error executing database query');
    }
});
// Static content route
app.use(express.static(__dirname));
// Default route to redirect to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
//# sourceMappingURL=server.js.map