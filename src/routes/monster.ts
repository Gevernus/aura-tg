import { Router } from 'express';
import { Monster } from '../models/Monster';
import { UserMonster } from '../models/UserMonster';
import { config } from '../config/config';
import { State } from '../models/State';

const router = Router();

router.get('/:userId/monsters', async (req, res) => {
    try {
        const userId = req.params.userId;
        const monsters = await Monster.createQueryBuilder("monster")
            .leftJoinAndSelect("monster.userMonsters", "userMonster", "userMonster.user_id = :userId", { userId })
            .getMany();
        console.log(monsters);
        if (monsters) {
            res.json(monsters);
        } else {
            res.status(404).json({ error: 'Monsters not found' });
        }
    } catch (error) {
        console.error('Error fetching monsters:', error);
        res.status(500).json({ error: 'Error fetching monsters' });
    }
});

router.post('/:userId/monsters/upgrade/:monsterId', async (req, res) => {
    const userId = req.params.userId;
    const monsterId = req.params.monsterId;
    try {
        const userMonster = await UserMonster
            .createQueryBuilder("userMonster")
            .innerJoinAndSelect("userMonster.monster", "monster")
            .where("userMonster.user_id = :userId")
            .andWhere("userMonster.monster_id = :monsterId")
            .setParameters({ userId, monsterId })
            .getOne();

        if (userMonster) {
            const cardConfig = config.cardConfigs[userMonster.monster.rarity]
            const price = Math.round(cardConfig.basePrice * Math.pow(1.30, userMonster.level))
            // const state = await State.findOne({ where: { id: userId } })
            userMonster.level += 1;
            await userMonster.save();
            console.log(`Upgraded UserMonster: ${JSON.stringify(userMonster)}`);
            res.status(200).json({ message: 'Monster upgraded successfully', userMonster });
            // if (state) {
            //     userMonster.level += 1;
            //     state.coins -= price;
            //     await userMonster.save();
            //     await state.save();
            //     console.log(`Upgraded UserMonster: ${JSON.stringify(userMonster)}`);
            //     res.status(200).json({ message: 'Monster upgraded successfully', userMonster, coins: state.coins });
            // } else {
            //     res.status(200).json({ message: 'Not enough coins to buy', userMonster });
            // }
        } else {
            console.log(`UserMonster not found for userId: ${userId} and monsterId: ${monsterId}`);
            res.status(404).json({ error: 'UserMonster not found' });
        }


    } catch (error) {
        console.error('Error of upgrading a monster:', error);
        res.status(500).json({ error: 'Error of upgrading a monster' });
    }
});

export default router;