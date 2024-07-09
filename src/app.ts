import "reflect-metadata";
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import { DataSource } from "typeorm";
import 'dotenv/config';
import userRoutes from './routes/user';
import referralRoutes from './routes/referral';
import config from './config/database';
import webApp from 'telegram-webapps-types'


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
    app.use(express.static(path.join(__dirname, '../dist')));

    const viewsDir = path.join(__dirname, '../views');

    // Read all HTML files from the views directory
    const htmlFiles = fs.readdirSync(viewsDir).filter((file: string) => file.endsWith('.html'));
    // Serve each HTML file found as a route
    htmlFiles.forEach((file: string) => {
        console.log(`/${path.parse(file).name}`)
        app.get(`/${path.parse(file).name}`, (req, res) => {
            res.sendFile(path.join(viewsDir, file));
        });
    });

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