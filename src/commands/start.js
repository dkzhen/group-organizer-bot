import { bot } from "../provider/TelegramBot.js";

// Event listener untuk polling error
bot.on("polling_error", (error) => {
  console.error(`Polling Error: ${error.code} - ${error.response.body}`);
});

// Event listener untuk startup bot
bot.on("webhook_error", (error) => {
  console.error(`Webhook Error: ${error.code} - ${error.response.body}`);
});

// Menggunakan method getMe untuk memvalidasi koneksi
bot
  .getMe()
  .then((botInfo) => {
    console.log(`Bot connected successfully: ${botInfo.username}`);
  })
  .catch((error) => {
    console.error(`Failed to connect: ${error.code} - ${error.response.body}`);
  });

// Tambahan optional untuk handle pesan yang tidak terdefinisi atau tidak diketahui
bot.on("error", (error) => {
  console.error(
    `An unexpected error occurred: ${error.code} - ${error.response.body}`
  );
});

export { bot as startBot };
