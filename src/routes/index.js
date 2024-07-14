const express = require("express");
const BotRoute = require("./BotRoute");
const TokenRoute = require("./TokenRoute");
const router = express.Router();

router.use("/bot", BotRoute);
router.use("/token", TokenRoute);
router.get("/", (req, res) => {
  return res.send("server running ...");
});

module.exports = router;
