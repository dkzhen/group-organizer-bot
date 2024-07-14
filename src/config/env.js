const dotenv = require("dotenv");
// Configure dotenv
dotenv.config();

// Access your environment variable
const envTELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const envPORT = process.env.PORT;

module.exports = { envTELEGRAM_BOT_TOKEN, envPORT };
