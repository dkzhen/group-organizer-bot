const express = require("express");
const prisma = require("../provider/PrismaClient");

const router = express.Router();

router.get("/:botid", async (req, res) => {
  const id = req.params.botid;

  try {
    const botToken = await prisma.bot.findMany({
      where: {
        id: id,
      },
      include: {
        tokenList: true,
      },
    });
    if (!botToken.length > 0) {
      return res.status(404).json({ message: `bot token not found` });
    }

    return res
      .status(200)
      .json({ message: `bot token ${id} found`, data: botToken });
  } catch (error) {
    console.log({ error: "on tokenRoute", message: error });
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
