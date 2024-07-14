const prisma = require("../provider/PrismaClient");
const bot = require("../provider/TelegramBot");

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
  });

  // Event listener untuk callback dari tombol-tombol yang telah ditetapkan
  bot.sessions = {};
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const callbackData = query.data;
    if (callbackData.startsWith("bot_")) {
      const botId = callbackData.split("_")[1];
      console.log("botIdddd", botId);
      const botDetails = await prisma.bot.findFirst({
        where: {
          id: botId,
        },
      });
      console.log("botdetaill", botDetails);
      bot.sendMessage(chatId, `Please enter your token:`);
      const idToken = await prisma.token.create({
        data: { botId: botDetails.id, telegramId: chatId },
      });
      bot.sessions[chatId] = { botId, tokenId: idToken.id };
    }
  });
};
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Check if there's a bot selection session for this user
  if (bot.sessions && bot.sessions[chatId] && bot.sessions[chatId].botId) {
    const { botId, tokenId } = bot.sessions[chatId];
    // Save the token to the database

    if (!text.startsWith("/")) {
      await prisma.token.update({
        where: { id: tokenId },
        data: { token: text, telegramId: chatId },
      });
    }

    await prisma.token.deleteMany({ where: { token: null } });
    // Clear the session
    bot.sendMessage(chatId, "Token saved on database");
    delete bot.sessions[chatId];

    // Send confirmation message
  } else {
    if (!text.startsWith("/")) {
      bot.sendMessage(chatId, "Please select a bot first.");
    }
  }
});
