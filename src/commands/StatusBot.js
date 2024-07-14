const bot = require("../provider/TelegramBot");

exports.StatusBotTelegram = async () => {
  bot.getMe().then((botInfo) => {
    const botUsername = botInfo.username;
    console.log(`Bot ${botUsername} is running and polling for updates...`);
  });
  bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    const username = msg.chat.username || msg.from.username;

    // Send a message back to the user
    if (text === "/start") {
      bot.sendMessage(chatId, `Welcome ${username}`);
    }
  });
  bot.on("polling_error", (error) => {
    console.error("Polling error:", error);
    bot
      .getMe()
      .then((botInfo) => {
        console.log(
          `Polling error on bot ${botInfo.username}: ${error.message}`
        );
      })
      .catch((getMeError) => {
        console.error(
          "Error getting bot info after polling error:",
          getMeError
        );
      });
  });

  // Event listener for other errors
  bot.on("error", (error) => {
    console.error("Error:", error);
    bot
      .getMe()
      .then((botInfo) => {
        console.log(`Error on bot ${botInfo.username}: ${error.message}`);
      })
      .catch((getMeError) => {
        console.error("Error getting bot info after error:", getMeError);
      });
  });
};
