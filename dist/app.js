"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const typeorm_1 = require("typeorm");
require("dotenv/config");
const user_1 = __importDefault(require("./routes/user"));
const referral_1 = __importDefault(require("./routes/referral"));
const state_1 = __importDefault(require("./routes/state"));
const database_1 = __importDefault(require("./config/database"));
const cors_1 = __importDefault(require("cors"));
const mime_1 = __importDefault(require("mime"));
const promises_1 = require("fs/promises");
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
app.use(body_parser_1.default.json());
exports.AppDataSource = new typeorm_1.DataSource(database_1.default);
exports.AppDataSource.initialize().then(() => {
    console.log('Connected to database');
    app.use((0, cors_1.default)());
    app.use((req, res, next) => {
        console.log(`${req.method} request for ${req.url}`);
        next();
    });
    // API Routes (should come before static and catch-all routes)
    app.use('/api', user_1.default);
    app.use('/api', referral_1.default);
    app.use('/api', state_1.default);
    app.get('/views/:fileName', async (req, res) => {
        const fileName = req.params.fileName;
        const filePath = path_1.default.join(__dirname, '../views', fileName);
        try {
            // Check if file exists
            await (0, promises_1.access)(filePath);
            // Determine the MIME type
            const mimeType = mime_1.default.lookup(filePath) || 'application/octet-stream';
            // Set the correct Content-Type
            res.type(mimeType);
            // Send the file
            res.sendFile(filePath);
        }
        catch (error) {
            console.error(`Error serving file ${fileName}:`, error);
            if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
                // ENOENT error code means "Error NO ENTry" or "Error NO ENTity", which indicates that the file or directory doesn't exist
                res.status(404).send('File not found');
            }
            else {
                // For any other error, send a 500 Internal Server Error
                res.status(500).send('Internal Server Error');
            }
        }
    });
    // Static content routes
    app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
    app.use(express_1.default.static(path_1.default.join(__dirname, '../dist')));
    // HTML file routes
    const viewsDir = path_1.default.join(__dirname, '../views');
    const htmlFiles = fs_1.default.readdirSync(viewsDir).filter((file) => file.endsWith('.html'));
    htmlFiles.forEach((file) => {
        console.log(`/${path_1.default.parse(file).name}`);
        app.get(`/${path_1.default.parse(file).name}`, (req, res) => {
            res.sendFile(path_1.default.join(viewsDir, file));
        });
    });
    // Catch-all route (should be last)
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../views', 'index.html'));
    });
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send('Something broke!');
    });
    // Start the server
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(error => console.log('TypeORM connection error: ', error));
exports.default = app;
//# sourceMappingURL=app.js.map