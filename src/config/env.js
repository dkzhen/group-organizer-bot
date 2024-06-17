import { config } from "dotenv";

// Configure dotenv
config();

// Access your environment variable
const envTELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const envAPI_KEY_GOOGLE = process.env.API_KEY_GOOGLE;

export { envTELEGRAM_BOT_TOKEN, envAPI_KEY_GOOGLE };
