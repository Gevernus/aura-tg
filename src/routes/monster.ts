import { Router } from 'express';
import { Monster } from '../models/Monster';
import { UserMonster } from '../models/UserMonster';
import { State } from '../models/State';
import { config } from '../config/config';

const router = Router();

router.get('/:userId/monsters', async (req, res) => {
    try {
        const userId = req.params.userId;
        const monsters = await Monster.createQueryBuilder("monster")
            .leftJoinAndSelect("monster.userMonsters", "userMonster", "userMonster.user_id = :userId", { userId })
            .getMany();
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
    const monsterId = parseInt(req.params.monsterId);
    try {
        let userMonster = await UserMonster
            .createQueryBuilder("userMonster")
            .innerJoinAndSelect("userMonster.monster", "monster")
            .where("userMonster.user_id = :userId")
            .andWhere("userMonster.monster_id = :monsterId")
            .setParameters({ userId, monsterId })
            .getOne();

        if (!userMonster) {
            const monster = await Monster.findOne({ where: { id: monsterId } });
            if (!monster) {
                console.log(`Monster not found for monsterId: ${monsterId}`);
                return res.status(404).json({ error: 'Monster not found' });
            }
            userMonster = UserMonster.create();
            userMonster.user_id = userId;
            userMonster.monster_id = monster.id;
            userMonster.level = 0;
            userMonster.monster = monster;
            console.log(`Created new UserMonster: ${JSON.stringify(userMonster)}`);
        }

        if (userMonster) {
            const state = await State.findOne({ where: { id: userMonster.user_id } });
            const basePrice = config.cardConfigs[userMonster.monster.rarity].basePrice;
            const price = Math.round(basePrice * Math.pow(1.30, userMonster.level));
            if (state && state.coins >= price){
                userMonster.level += 1;
                await userMonster.save();
                console.log(`Upgraded UserMonster: ${JSON.stringify(userMonster)}`);
            }
            res.status(200).json({ message: 'Monster upgraded successfully', userMonster });
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