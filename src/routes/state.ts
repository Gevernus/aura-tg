import { Router } from 'express';
import { User } from '../models/User';
import config from '../config/config';
import { State } from '../models/State';
import { Inventory } from '../models/Inventory';
import { Monster } from '../models/Monster';
import { UserMonster } from '../models/UserMonster';

const router = Router();

router.post('/user', async (req, res) => {
    const userData: User = req.body;
    try {
        let user;
        let state: State | null;
        const result = await User.createQueryBuilder()
            .insert()
            .values(userData)
            .orIgnore()
            .returning("*")
            .execute();
        if (result.raw.length > 0) {
            user = result.raw[0];
            state = State.create();
            state.id = user.id;
            state.energy = config.initialEnergy;
            state.passive_income = config.initialPassiveIncome;
            const inventory = Inventory.create();
            inventory.id = user.id;;
            state.inventory = inventory;
            await state.save();

            const monsters = await Monster.find();
            monsters.forEach(monster => {
                const userMonster = UserMonster.create();
                userMonster.user_id = state ? state.id : "";
                userMonster.monster_id = monster.id;
                userMonster.level = 0;
                userMonster.monster = monster;
                userMonster.save();
            });
        } else {
            user = await User.findOne({ where: { id: userData.id } });
            state = await State.findOne({ where: { id: userData.id } });
        }
        console.log('User updated:', user);
        return res.status(200).json({ message: "User data saved successfully", user, state, config });
    } catch (error) {
        console.error(`Error saving user: ${userData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});
router.post('/state', async (req, res) => {
    const stateData: State = req.body;
    try {
        const state = await State.findOne({ where: { id: stateData.id } })
        if (state) {
            state.coins = stateData.coins;
            state.energy = stateData.energy;
            state.tap_power = stateData.tap_power;
            state.passive_income = stateData.passive_income;
            state.save();
        }
        return res.status(200).json({ message: "State data saved successfully" });
    } catch (error) {
        console.error(`Error saving user: ${stateData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});
export default router;