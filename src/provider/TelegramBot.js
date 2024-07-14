const TelegramBot = require("node-telegram-bot-api");
const { envTELEGRAM_BOT_TOKEN } = require("../config/env");
const bot = new TelegramBot(envTELEGRAM_BOT_TOKEN, {
  polling: true,
});

module.exports = bot;
