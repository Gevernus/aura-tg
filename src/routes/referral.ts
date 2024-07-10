import { Router } from 'express';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { AppDataSource } from '../app';

const router = Router();

router.get('/user/:id/referrals', async (req, res) => {
    const userId = req.params.id;

    try {
        const referrals = await Referral.find({
            where: { inviterId: userId }
        });
        res.json(referrals);
    } catch (error) {
        console.error('Error fetching referrals:', error);
        res.status(500).send('Error fetching referrals');
    }
});

router.post('/user/:id/claim', async (req, res) => {
    const userId = req.params.id;
    const { referralId, bonus } = req.body;

    await AppDataSource.transaction(async transactionalEntityManager => {
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        const referral = await Referral.findOne({ where: { id: referralId } });
        if (!referral) {
            throw new Error('Referral not found');
        }

        user.coins += parseInt(bonus, 10);
        await user.save();
        
        referral.status = 'claimed';
        await referral.save();
    }).then(() => {
        res.send('Bonus claimed successfully');
    }).catch(error => {
        console.error('Error claiming bonus:', error);
        res.status(500).send(`Error claiming bonus: ${error.message}`);
    });
});

export default router;