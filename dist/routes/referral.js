"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Referral_1 = require("../models/Referral");
const router = (0, express_1.Router)();
router.get('/:userId/referrals', async (req, res) => {
    const userId = req.params.userId;
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
router.post('/:userId/claim', async (req, res) => {
    const userId = req.params.userId;
    const { referralId } = req.body;
    try {
        const referral = await Referral_1.Referral.findOne({ where: { inviterId: userId, id: referralId } });
        if (!referral) {
            throw new Error('Referral not found');
        }
        referral.status = 'claimed';
        await referral.save();
        res.send('Bonus claimed successfully');
    }
    catch (error) {
        console.error('Error claiming bonus:', error);
        res.status(500).send(`Error claiming bonus: ${error}`);
    }
});
exports.default = router;
//# sourceMappingURL=referral.js.map