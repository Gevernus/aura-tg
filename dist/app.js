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
const typeorm_1 = require("typeorm");
require("dotenv/config");
const user_1 = __importDefault(require("./routes/user"));
const referral_1 = __importDefault(require("./routes/referral"));
const database_1 = __importDefault(require("./config/database"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8000;
app.use(body_parser_1.default.json());
exports.AppDataSource = new typeorm_1.DataSource(database_1.default);
exports.AppDataSource.initialize().then(() => {
    console.log('Connected to PostgreSQL database');
    // Routes
    app.use('/api', user_1.default);
    app.use('/api', referral_1.default);
    // Static content route
    app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
    // Default route to redirect to index.html
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../views', 'index.html'));
    });
    // Start the server
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}).catch(error => console.log('TypeORM connection error: ', error));
exports.default = app;
//# sourceMappingURL=app.js.map