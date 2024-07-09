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
import cors from 'cors';


const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.json());

export const AppDataSource = new DataSource(config);

AppDataSource.initialize().then(() => {
    console.log('Connected to database');
    app.use(cors());
    app.use((req, res, next) => {
        console.log(`${req.method} request for ${req.url}`);
        next();
    });

    // API Routes (should come before static and catch-all routes)
    app.use('/api', userRoutes);
    app.use('/api', referralRoutes);

    // Static content routes
    app.use(express.static(path.join(__dirname, '../public')));
    app.use(express.static(path.join(__dirname, '../dist')));

    // HTML file routes
    const viewsDir = path.join(__dirname, '../views');
    const htmlFiles = fs.readdirSync(viewsDir).filter((file: string) => file.endsWith('.html'));
    htmlFiles.forEach((file: string) => {
        console.log(`/${path.parse(file).name}`);
        app.get(`/${path.parse(file).name}`, (req, res) => {
            res.sendFile(path.join(viewsDir, file));
        });
    });

    // Catch-all route (should be last)
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../views', 'index.html'));
    });

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });

    // Start the server
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(error => console.log('TypeORM connection error: ', error));

export default app;