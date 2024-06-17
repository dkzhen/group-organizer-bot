import TelegramBot from "node-telegram-bot-api";
import { envTELEGRAM_BOT_TOKEN } from "../config/env.js";

const bot = new TelegramBot(envTELEGRAM_BOT_TOKEN, { polling: true });

export { bot };
