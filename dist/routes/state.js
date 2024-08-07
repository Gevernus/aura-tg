"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const config_1 = __importDefault(require("../config/config"));
const State_1 = require("../models/State");
const Task_1 = require("../models/Task");
const PackItem_1 = require("../models/PackItem");
const UserItem_1 = require("../models/UserItem");
const ShopItem_1 = require("../models/ShopItem");
const app_1 = require("../app");
const Referral_1 = require("../models/Referral");
const UserTask_1 = require("../models/UserTask");
const typeorm_1 = require("typeorm");
const router = (0, express_1.Router)();
router.post('/user', async (req, res) => {
    const { userData, inviterId } = req.body;
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
            if (inviterId && inviterId != user.id) {
                const referral = Referral_1.Referral.create();
                referral.inviterId = inviterId;
                referral.userId = user.id;
                referral.username = user.username;
                referral.bonus = 10;
                referral.status = 'accepted';
                await referral.save();
            }
            await state.save();
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
        let energyRestored = 0;
        if (state) {
            const now = new Date();
            const lastUpdated = new Date(state.last_updated);
            const timeDiffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
            const maxAccumulationTime = Math.min(timeDiffInSeconds, 3 * 60 * 60);
            passive_income = Math.floor(state.passive_income / 3600 * maxAccumulationTime);
            energyRestored = state.energy_restore * timeDiffInSeconds;
            shouldShowPopup = timeDiffInSeconds > 300 && passive_income > 0;
            console.log(`Time since last update in sec: ${timeDiffInSeconds}, should show popup: ${shouldShowPopup}`);
        }
        return res.status(200).json({ passive_income, shouldShowPopup, energyRestored });
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
        if (state && pack) {
            const randomItems = await ShopItem_1.ShopItem
                .createQueryBuilder('starItem')
                .orderBy('RANDOM()')
                .limit(5)
                .getMany();
            const itemIds = randomItems.map(item => item.id);
            const stringifiedPayload = JSON.stringify({ itemIds, userId });
            const invoiceLink = await app_1.bot.api.createInvoiceLink(`Pack of various items: ${pack.name}`, 'Pack of various items', stringifiedPayload, "", "XTR", [{ label: pack.name, amount: pack.price }]);
            return res.status(200).json({ invoiceLink, items: randomItems });
        }
        else {
            return res.status(400).json({ message: "Error while creating invoice" });
        }
    }
    catch (error) {
        console.error(`Error while creating invoice: ${userId}`, error);
        return res.status(500).json({ message: "Error while creating invoice" });
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
            .innerJoinAndSelect("userItem.item", "item")
            .where("userItem.user_id = :userId", { userId })
            .getMany();
        if (userItems && userItems.length > 0) {
            const inventory = userItems.map(item => item.item);
            res.json(inventory);
        }
        else {
            res.status(200).json([]);
        }
    }
    catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Error fetching inventory' });
    }
});
router.get('/ratings', async (req, res) => {
    try {
        const excludedUsernames = ['farequest312', 'vvvvvvv300300', 'eeshishko'];
        const ratings = await User_1.User
            .createQueryBuilder("user")
            .leftJoinAndSelect("user.referrals", "referral")
            .leftJoinAndSelect("State", "userState", "userState.id = user.id")
            .leftJoinAndSelect("State", "referralState", "referralState.id = referral.userId")
            .select([
            "user.id AS user_id",
            "user.username AS user_username",
            "userState.coins AS coins",
            "userState.passive_income AS passive_income",
            "COUNT(referral.id) AS friendsCount",
            "SUM(DISTINCT COALESCE(referralState.passive_income, 0)) AS friendsPassiveIncome",
            "AVG(DISTINCT COALESCE(referralState.level, 1)) AS friendsAverageLevel",
        ])
            .where("user.username NOT IN (:...excludedUsernames)", { excludedUsernames })
            .groupBy("user.id, user.username, userState.coins, userState.passive_income")
            .getRawMany();
        res.status(200).json(ratings);
    }
    catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ error: 'Error fetching ratings' });
    }
});
router.get('/:userId/tasks', async (req, res) => {
    try {
        const userId = req.params.userId;
        await removeExpiredDailyTasks(userId);
        const tasks = await Task_1.Task.createQueryBuilder('task')
            .leftJoinAndSelect('task.userTasks', 'userTask', 'userTask.user.id = :userId', { userId })
            .select([
            'task.id',
            'task.name',
            'task.description',
            'task.image',
            'task.targetAction',
            'task.requiredActionCount',
            'task.coins_bonus',
            'userTask.claimed as claimed',
            'userTask.completed as completed',
            'COALESCE(userTask.progress, 0) as progress'
        ])
            .addSelect('CASE WHEN task.requiredActionCount = 0 THEN 0 ELSE COALESCE(userTask.progress, 0) * 100.0 / task.requiredActionCount END', 'completionPercentage')
            .orderBy('task.id', 'ASC')
            .getRawMany();
        console.log(`Loaded tasks`, tasks);
        res.status(200).json(tasks);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'An error occurred while fetching tasks' });
    }
});
router.post('/:userId/tasks/:taskId/progress', async (req, res) => {
    try {
        const userId = req.params.userId;
        const taskId = parseInt(req.params.taskId);
        let userTask = await UserTask_1.UserTask.findOne({
            where: { user: { id: userId }, task: { id: taskId } },
            relations: ['task', 'user'] // Explicitly load the task and user relations
        });
        if (!userTask) {
            console.log(`Creating a task object: ${userId}:${taskId}`);
            const user = await User_1.User.findOne({ where: { id: userId } });
            const task = await Task_1.Task.findOne({ where: { id: taskId } });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            userTask = UserTask_1.UserTask.create();
            userTask.user = user;
            userTask.task = task;
            userTask.progress = 0;
            console.log(`User task created: ${userTask.id}`);
        }
        if (!userTask.completed) {
            userTask.progress += 1;
        }
        if (userTask.progress >= userTask.task.requiredActionCount) {
            userTask.completed = true;
        }
        // Save updated UserTask
        await userTask.save();
        const tasks = await Task_1.Task.createQueryBuilder('task')
            .leftJoinAndSelect('task.userTasks', 'userTask', 'userTask.user.id = :userId', { userId })
            .select([
            'task.id',
            'task.name',
            'task.description',
            'task.image',
            'task.targetAction',
            'task.requiredActionCount',
            'task.coins_bonus',
            'userTask.claimed as claimed',
            'userTask.completed as completed',
            'COALESCE(userTask.progress, 0) as progress'
        ])
            .addSelect('CASE WHEN task.requiredActionCount = 0 THEN 0 ELSE COALESCE(userTask.progress, 0) * 100.0 / task.requiredActionCount END', 'completionPercentage')
            .orderBy('task.id', 'ASC')
            .getRawMany();
        res.status(200).json(tasks);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'An error occurred while fetching tasks' });
    }
});
router.post('/:userId/tasks/:taskId/claim', async (req, res) => {
    try {
        const userId = req.params.userId;
        const taskId = parseInt(req.params.taskId);
        let userTask = await UserTask_1.UserTask.findOne({
            where: { user: { id: userId }, task: { id: taskId } },
            relations: ['task', 'user'] // Explicitly load the task and user relations
        });
        if (!userTask) {
            return res.status(404).json({ error: `UserTask not found: ${userId}:${taskId}` });
        }
        // Increment progress
        userTask.claimed = true;
        userTask.claimedAt = new Date();
        // Save updated UserTask
        await userTask.save();
        const tasks = await Task_1.Task.createQueryBuilder('task')
            .leftJoinAndSelect('task.userTasks', 'userTask', 'userTask.user.id = :userId', { userId })
            .select([
            'task.id',
            'task.name',
            'task.description',
            'task.image',
            'task.targetAction',
            'task.requiredActionCount',
            'task.coins_bonus',
            'userTask.claimed as claimed',
            'userTask.completed as completed',
            'COALESCE(userTask.progress, 0) as progress'
        ])
            .addSelect('CASE WHEN task.requiredActionCount = 0 THEN 0 ELSE COALESCE(userTask.progress, 0) * 100.0 / task.requiredActionCount END', 'completionPercentage')
            .orderBy('task.id', 'ASC')
            .getRawMany();
        res.status(200).json({ tasks, reward: userTask.task.coins_bonus });
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'An error occurred while fetching tasks' });
    }
});
async function removeExpiredDailyTasks(userId) {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredDailyTasks = await UserTask_1.UserTask.find({
        where: {
            user: { id: userId },
            task: { daily: true },
            claimed: true,
            claimedAt: (0, typeorm_1.LessThan)(twentyFourHoursAgo)
        },
        relations: ['task']
    });
    for (const userTask of expiredDailyTasks) {
        await UserTask_1.UserTask.remove(userTask);
    }
}
exports.default = router;
//# sourceMappingURL=state.js.map