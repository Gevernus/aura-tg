"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const Referral_1 = require("../models/Referral");
const State_1 = require("../models/State");
const dotenv_1 = __importDefault(require("dotenv"));
const Inventory_1 = require("../models/Inventory");
const ShopItem_1 = require("../models/ShopItem");
// Load environment variables from .env file
dotenv_1.default.config();
const dbConfig = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User_1.User, Referral_1.Referral, State_1.State, Inventory_1.Inventory, ShopItem_1.ShopItem],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development'
};
exports.default = dbConfig;
//# sourceMappingURL=database.js.map