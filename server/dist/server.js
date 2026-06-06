"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const cron_service_1 = require("./services/cron.service");
const startServer = async () => {
    await (0, db_1.connectDB)();
    app_1.default.listen(env_1.env.PORT, () => {
        console.log(`Server running in ${env_1.env.NODE_ENV} mode on port ${env_1.env.PORT}`);
        (0, cron_service_1.startCronJobs)();
    });
};
startServer();
