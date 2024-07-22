"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const config_1 = __importDefault(require("../config/config"));
const State_1 = require("../models/State");
const Monster_1 = require("../models/Monster");
const UserMonster_1 = require("../models/UserMonster");
const PackItem_1 = require("../models/PackItem");
const UserItem_1 = require("../models/UserItem");
const ShopItem_1 = require("../models/ShopItem");
const router = (0, express_1.Router)();
router.post('/user', async (req, res) => {
    const userData = req.body;
    try {
        let user;
        let state;
        const result = await User_1.User.createQueryBuilder()
            .insert()
            .values(userData)
            .orIgnore()
            .returning("*")
            .execute();
        if (result.raw.length > 0) {
            user = result.raw[0];
            state = State_1.State.create();
            state.id = user.id;
            state.energy = config_1.default.initialEnergy;
            state.passive_income = config_1.default.initialPassiveIncome;
            await state.save();
            const monsters = await Monster_1.Monster.find();
            monsters.forEach(monster => {
                const userMonster = UserMonster_1.UserMonster.create();
                userMonster.user_id = state ? state.id : "";
                userMonster.monster_id = monster.id;
                userMonster.level = 0;
                userMonster.monster = monster;
                userMonster.save();
            });
        }
        else {
            user = await User_1.User.findOne({ where: { id: userData.id } });
            state = await State_1.State.findOne({ where: { id: userData.id } });
        }
        console.log('User updated:', user);
        return res.status(200).json({ message: "User data saved successfully", user, state, config: config_1.default });
    }
    catch (error) {
        console.error(`Error saving user: ${userData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});
router.get('/:userId/calculate_passive', async (req, res) => {
    const userId = req.params.userId;
    try {
        const state = await State_1.State.findOne({ where: { id: userId } });
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
    }
    catch (error) {
        console.error(`Error calculating of passive income for: ${userId}`, error);
        return res.status(500).json({ message: "Error calculating passive income" });
    }
});
router.post('/:userId/purchase/:packId', async (req, res) => {
    const userId = req.params.userId;
    const packId = req.params.packId;
    try {
        const state = await State_1.State.findOne({ where: { id: userId } });
        const pack = await PackItem_1.PackItem.findOne({ where: { id: packId } });
        if (state && pack && state.stars >= pack.price) {
            state.stars -= pack.price;
            state.save();
            const randomItems = await ShopItem_1.ShopItem
                .createQueryBuilder('starItem')
                .orderBy('RANDOM()')
                .limit(5)
                .getMany();
            const userItems = randomItems.map(item => UserItem_1.UserItem.create({
                user_id: userId,
                item_id: item.id,
                item,
            }));
            // Bulk save the created UserItems
            const savedUserItems = await UserItem_1.UserItem.save(userItems);
            return res.status(200).json({ message: "Item purchased", state, items: savedUserItems });
        }
        else {
            return res.status(400).json({ message: "Not enough stars" });
        }
    }
    catch (error) {
        console.error(`Error calculating of passive income for: ${userId}`, error);
        return res.status(500).json({ message: "Error calculating passive income" });
    }
});
router.post('/state', async (req, res) => {
    const stateData = req.body;
    try {
        const state = await State_1.State.findOne({ where: { id: stateData.id } });
        if (state) {
            state.coins = stateData.coins;
            state.energy = stateData.energy;
            state.tap_power = stateData.tap_power;
            state.passive_income = stateData.passive_income;
            state.save();
        }
        return res.status(200).json({ message: "State data saved successfully" });
    }
    catch (error) {
        console.error(`Error saving user: ${stateData}`, error);
        return res.status(500).json({ message: "Error saving user data" });
    }
});
router.get('/packs', async (req, res) => {
    try {
        const packs = await PackItem_1.PackItem.find();
        return res.status(200).json(packs);
    }
    catch (error) {
        console.error(`Error retrieving packs:`, error);
        return res.status(500).json({ message: "Error retrieving packs" });
    }
});
router.get('/:userId/inventory', async (req, res) => {
    try {
        const userId = req.params.userId;
        const userItems = await UserItem_1.UserItem.createQueryBuilder("userItem")
            .leftJoinAndSelect("userItem.item", "item")
            .where("userItem.user_id = :userId", { userId })
            .getMany();
        if (userItems && userItems.length > 0) {
            res.json(userItems);
        }
        else {
            res.status(404).json({ error: 'No items found in inventory' });
        }
    }
    catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Error fetching inventory' });
    }
});
exports.default = router;
//# sourceMappingURL=state.js.map