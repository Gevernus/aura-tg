"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
router.post('/check-user', async (req, res) => {
    const { username } = req.body;
    try {
        const user = await User_1.User.findOne({ where: { username } });
        res.json({ exists: !!user, user: user || undefined });
    }
    catch (error) {
        console.error('Error checking user:', error);
        res.status(500).json({ error: 'Error checking user' });
    }
});
router.post('/register', async (req, res) => {
    const { username } = req.body;
    try {
        const user = User_1.User.create({ username });
        await user.save();
        res.json(user);
    }
    catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user' });
    }
});
router.get('/user/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const user = await User_1.User.findOne({ where: { id: userId } });
        if (user) {
            res.json(user);
        }
        else {
            res.status(404).json({ error: 'User not found' });
        }
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user' });
    }
});
router.post('/user/:id/energy', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { energy } = req.body;
    try {
        const user = await User_1.User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.energy = energy;
        await user.save();
        res.json({ message: 'User energy updated successfully' });
    }
    catch (error) {
        console.error('Error updating user energy:', error);
        res.status(500).json({ error: 'Error updating user energy' });
    }
});
router.post('/user/:id/update', async (req, res) => {
    const userId = parseInt(req.params.id);
    const { coins, tap_power } = req.body;
    try {
        const user = await User_1.User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.coins = coins;
        user.tap_power = tap_power;
        await user.save();
        res.json({ message: 'User data updated successfully' });
    }
    catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Error updating user data' });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map