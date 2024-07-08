import "reflect-metadata";
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { DataSource } from "typeorm";
import 'dotenv/config';
import userRoutes from './routes/user';
import referralRoutes from './routes/referral';
import config from './config/database';

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());

export const AppDataSource = new DataSource(config);

AppDataSource.initialize().then(() => {
    console.log('Connected to PostgreSQL database');

    // Routes
    app.use('/api', userRoutes);
    app.use('/api', referralRoutes);

    // Static content route
    app.use(express.static(path.join(__dirname, '../public')));

    // Default route to redirect to index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../views', 'index.html'));
    });

    // Start the server
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(error => console.log('TypeORM connection error: ', error));

export default app;