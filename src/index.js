const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { envPORT } = require("./config/env");
const { StatusBotTelegram } = require("./commands/StatusBot");
const router = require("./routes");
const { listBot } = require("./commands/ListBot");

const app = express();
const PORT = envPORT || 101;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(router);

app.listen(PORT, () => {
  StatusBotTelegram();
  listBot();
  console.log(`Server running on port ${PORT}`);
});
