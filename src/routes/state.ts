import { Router } from 'express';
import { User } from '../models/User';
import config from '../config/config';
import { State } from '../models/State';
import { Monster } from '../models/Monster';
import { UserMonster } from '../models/UserMonster';
import { PackItem } from '../models/PackItem';
import { UserItem } from '../models/UserItem';
import { ShopItem } from '../models/ShopItem';
import { bot } from '../app';

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

router.get('/:userId/calculate_passive', async (req, res) => {
    const userId = req.params.userId;
    try {
        const state = await State.findOne({ where: { id: userId } })
        let passive_income = 0;
        let shouldShowPopup = false;
        if (state) {
            const now = new Date();
            const lastUpdated = new Date(state.last_updated);
            const timeDiffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
            const maxAccumulationTime = Math.min(timeDiffInSeconds, 3 * 60 * 60);
            passive_income = Math.floor(state.passive_income / 3600 * maxAccumulationTime);
            shouldShowPopup = timeDiffInSeconds > 300 && passive_income > 0;
            console.log(`Time since last update in sec: ${timeDiffInSeconds}, should show popup: ${shouldShowPopup}`);
        }
        return res.status(200).json({ passive_income, shouldShowPopup });
    } catch (error) {
        console.error(`Error calculating of passive income for: ${userId}`, error);
        return res.status(500).json({ message: "Error calculating passive income" });
    }
});

router.post('/:userId/purchase/:packId', async (req, res) => {
    const userId = req.params.userId;
    const packId = req.params.packId;
    try {
        const state = await State.findOne({ where: { id: userId } })
        const pack = await PackItem.findOne({ where: { id: packId } })
        if (state && pack) {
            const randomItems = await ShopItem
                .createQueryBuilder('starItem')
                .orderBy('RANDOM()')
                .limit(5)
                .getMany();

            const itemIds = randomItems.map(item => item.id);
            const stringifiedPayload = JSON.stringify({ itemIds, userId });

            const invoiceLink = await bot.api.createInvoiceLink(
                `Pack of various items: ${pack.name}`,
                'Pack of various items',
                stringifiedPayload,
                "",
                "XTR",
                [{ label: pack.name, amount: pack.price }],
            );

            return res.status(200).json({ invoiceLink, items: randomItems });
        } else {
            return res.status(400).json({ message: "Error while creating invoice" });
        }
    } catch (error) {
        console.error(`Error while creating invoice: ${userId}`, error);
        return res.status(500).json({ message: "Error while creating invoice" });
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

router.get('/packs', async (req, res) => {
    try {
        const packs = await PackItem.find();

        return res.status(200).json(packs);
    } catch (error) {
        console.error(`Error retrieving packs:`, error);
        return res.status(500).json({ message: "Error retrieving packs" });
    }
});

router.get('/:userId/inventory', async (req, res) => {
    try {
        const userId = req.params.userId;
        const userItems = await UserItem.createQueryBuilder("userItem")
            .leftJoinAndSelect("userItem.item", "item")
            .where("userItem.user_id = :userId", { userId })
            .getMany();

        if (userItems && userItems.length > 0) {
            res.json(userItems);
        } else {
            res.status(404).json({ error: 'No items found in inventory' });
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Error fetching inventory' });
    }
});

export default router;