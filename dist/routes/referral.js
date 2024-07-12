"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Referral_1 = require("../models/Referral");
const app_1 = require("../app");
const State_1 = require("../models/State");
const router = (0, express_1.Router)();
router.get('/user/:id/referrals', async (req, res) => {
    const userId = req.params.id;
    try {
        const referrals = await Referral_1.Referral.find({
            where: { inviterId: userId }
        });
        res.json(referrals);
    }
    catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).send('Error fetching referrals');
    }
});
router.post('/user/:id/claim', async (req, res) => {
    const userId = req.params.id;
    const { referralId, bonus } = req.body;
    await app_1.AppDataSource.transaction(async (transactionalEntityManager) => {
        const state = await State_1.State.findOne({ where: { id: userId } });
        if (!state) {
            throw new Error('State not found');
        }
        const referral = await Referral_1.Referral.findOne({ where: { id: referralId } });
        if (!referral) {
            throw new Error('Referral not found');
        }
        state.coins += parseInt(bonus, 10);
        await state.save();
        referral.status = 'claimed';
        await referral.save();
    }).then(() => {
        res.send('Bonus claimed successfully');
    }).catch(error => {
        console.error('Error claiming bonus:', error);
        res.status(500).send(`Error claiming bonus: ${error.message}`);
    });
});
exports.default = router;
//# sourceMappingURL=referral.js.map