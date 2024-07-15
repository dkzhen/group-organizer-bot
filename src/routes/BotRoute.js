const express = require("express");
const prisma = require("../provider/PrismaClient");
const bot = require("../provider/TelegramBot");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const bot = await prisma.bot.findMany();

    return res.status(200).json({ message: "Hello Bot", data: bot });
  } catch (error) {}
  console.log({ error: "on botRoute", message: error });
  return res.status(500).json({ message: "Internal server error" });
});

router.post("/", async (req, res) => {
  const { botId, name } = req.body;

  try {
    if (!botId || !name) {
      return res.status(400).json({ message: "field is required" });
    }

    const bot = await prisma.bot.create({
      data: {
        id: botId,
        name: name,
      },
    });
    return res.status(200).json({ message: "bot created", data: bot });
  } catch (error) {
    console.log({ error: "on botRoute", message: error });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/sendMessage", async (req, res) => {
  const { chatId, message, tokenId } = req.body;

  try {
    if (!chatId || !message || !tokenId) {
      return res.status(400).json({ message: "field is required" });
    }
    await prisma.token.delete({ where: { id: Number(tokenId) } });
    await bot.sendMessage(chatId, message);
    return res.status(200).json({ message: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
