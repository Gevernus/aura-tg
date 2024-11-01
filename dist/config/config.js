"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
exports.config = {
    initialEnergy: 500,
    initialPassiveIncome: 1,
    appURL: process.env.TELEGRAM_APP_LINK || "",
    levels: [
        'Novice Soul',
        'Seeker Soul',
        'Traveler Soul',
        'Adept Soul',
        'Sage Soul',
        'Guardian Soul',
        'Ascended Soul'
    ],
    levelRequirements: [
        0,
        100000,
        1000000,
        10000000,
        50000000,
        250000000,
        1000000000
    ],
    images: [
        'background.webp',
        'halloween_cover.webp',
        'halloween_cover.webp',
        'halloween_cover.webp',
        'halloween_cover.webp',
        'halloween_cover.webp',
        'halloween_cover.webp'
    ],
    cardConfigs: {
        ["Common"]: {
            basePrice: 100,
            incomePerLevel: 5
        },
        ["Rare"]: {
            basePrice: 500,
            incomePerLevel: 30
        },
        ["Very rare"]: {
            basePrice: 2000,
            incomePerLevel: 150
        },
        ["Epic"]: {
            basePrice: 10000,
            incomePerLevel: 750
        },
        ["Legendary"]: {
            basePrice: 50000,
            incomePerLevel: 3750
        }
    }
};
exports.default = exports.config;
//# sourceMappingURL=config.js.map