import { DataSourceOptions } from 'typeorm';
import { User } from '../models/User';
import { Referral } from '../models/Referral';
import { State } from '../models/State';
import dotenv from 'dotenv';
import { Inventory } from '../models/Inventory';
import { ShopItem } from '../models/ShopItem';
import { Monster } from '../models/Monster';
import { UserMonster } from '../models/UserMonster';

// Load environment variables from .env file
dotenv.config();

const dbConfig: DataSourceOptions = {
    type: "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, Referral, State, Inventory, ShopItem, Monster, UserMonster],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development'
};

export default dbConfig;