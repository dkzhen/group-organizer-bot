const { configDotenv } = require("dotenv");
const prisma = require("../provider/PrismaClient");
const bot = require("../provider/TelegramBot");
const { formatToken } = require("./formatToken");
configDotenv();

function groupButtons(buttons, buttonsPerRow) {
  const rows = [];
  for (let i = 0; i < buttons.length; i += buttonsPerRow) {
    rows.push(buttons.slice(i, i + buttonsPerRow));
  }
  return rows;
}

exports.listBot = async () => {
  bot.onText(/\/add/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Please enter the password:");

    bot.once("message", async (msg) => {
      const userPassword = msg.text;
      const PASSWORD = process.env.PASSWORD;

      if (userPassword === PASSWORD) {
        const botList = await prisma.bot.findMany();
        const botButtons = botList.map((bot) => ({
          text: bot.name,
          callback_data: `bot_${bot.id}`,
        }));

        const opts = {
          reply_markup: {
            inline_keyboard: [...botButtons.map((button) => [button])],
          },
        };

        bot.sendMessage(chatId, "Choose one bot:", opts);
      } else {
        bot.sendMessage(chatId, "Incorrect password. Please try again.");
      }
    });
  });

  // Event listener untuk callback dari tombol-tombol yang telah ditetapkan
  bot.sessions = {};

  bot.on("callback_query", async (query) => {
    try {
      await prisma.token.deleteMany({ where: { token: null } });

      const chatId = query.message.chat.id;
      const callbackData = query.data;

      if (callbackData.startsWith("bot_")) {
        const botId = callbackData.split("_")[1];
        const botDetails = await prisma.bot.findUnique({
          where: { id: botId },
        });

        if (botDetails) {
          // const messageBot = formatToken(botDetails);
          await bot.sendMessage(chatId, "Please enter your token: \n");
          const idToken = await prisma.token.create({
            data: { botId: botDetails.id },
          });

          bot.sessions[chatId] = { botId, tokenId: idToken.id };
        } else {
          await bot.sendMessage(chatId, "Bot not found.");
        }
      }
    } catch (error) {
      console.error("Error in callback_query:", error);
    }
  });

  bot.on("message", async (msg) => {
    try {
      const chatId = msg.chat.id;
      const text = msg.text;

      if (bot.sessions[chatId] && bot.sessions[chatId].botId) {
        const { botId, tokenId } = bot.sessions[chatId];

        if (!text.startsWith("/")) {
          const available = await prisma.token.findMany({
            where: { token: text },
          });

          if (available.length > 0) {
            console.log("Token already exists");
          } else {
            await prisma.token.update({
              where: { id: tokenId },
              data: { token: text, telegramId: BigInt(chatId) },
            });
          }

          // Clear any tokens that are still null
          await prisma.token.deleteMany({ where: { token: null } });

          // Clear the session and send confirmation
          delete bot.sessions[chatId];
          await bot.sendMessage(chatId, "Token saved on database");
        } else {
          delete bot.sessions[chatId];
          await bot.sendMessage(chatId, "Please enter valid token");
        }
      }
    } catch (error) {
      console.error("Error in message handler:", error);
    }
  });
};
