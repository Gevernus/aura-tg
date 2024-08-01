import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface CardConfig {
    basePrice: number;
    incomePerLevel: number;
}

type CardConfigs = {
    [key in string]: CardConfig;
};

interface GameConfig {
    initialEnergy: number;
    initialPassiveIncome: number;
    appURL: string;
    levels: string[];
    levelRequirements: number[];
    images: string[];
    cardConfigs: CardConfigs;
}

export const config: GameConfig = {
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
        'background.webp',
        'background.webp',
        'background.webp',
        'background.webp',
        'background.webp',
        'background.webp'
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

export default config;