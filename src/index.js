import scheduleJob from "node-schedule";
import { helpBot } from "./commands/help.js";
import { startBot } from "./commands/start.js";
import { bot } from "./provider/TelegramBot.js";
import { prisma } from "./provider/PrismaClient.js";
import { envTELEGRAM_BOT_TOKEN } from "./config/env.js";
import express from "express";

const app = express();
const port = 101;

// Buat aturan jadwal dengan waktu 12 malam UTC+7
const jadwal = "00 00 * * *"; // '0 0 17 * * *' artinya jam 17:00 UTC, yang setara dengan 12 malam WIB

// Buat job yang akan dijalankan pada jadwal yang telah ditentukan
async function scheduledJob() {
  const dataShow = await prisma.reminder.findMany();
  // console.log(data);
  if (dataShow.length > 0) {
    const now = new Date();
    const utc7 = new Date(now.getTime());
    const formattedDate = `${utc7.getDate()}/${
      utc7.getMonth() + 1
    }/${utc7.getFullYear()}`;
    const formattedTime = `${utc7.getHours()}:${utc7
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    let message = `🪂 List Project Airdrop\n⏰ ${formattedDate} ${formattedTime}\n\n`;

    const emote = ["🐉", "🐯", "🦊", "🐨", "🐲", "🦄", "🐔", "🐸"];

    dataShow.forEach(async (item, index) => {
      const randomEmote = emote[Math.floor(Math.random() * emote.length)];

      message += `${randomEmote} - [${item.message}](${
        item.link
      })  (${item.chatId.toString()})\n`;
    });
    const optsType = {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    };
    bot.sendMessage("-1001167721775", message, optsType);
  } else {
    let message = `🪂 List Project Airdrop\n⏰ ${formattedDate} ${formattedTime}\n\n`;

    message += `no list.\n`;

    const optsType = {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    };
    bot.sendMessage(chatId, message, optsType);
  }
}
const job = scheduleJob.scheduleJob(jadwal, function () {
  console.log(
    "Tugas yang dijadwalkan telah dijalankan pada waktu:",
    new Date()
  );
  scheduledJob();
});

// Tampilkan pesan bahwa jadwal telah dibuat
console.log("Jadwal telah dibuat pada:", job.nextInvocation());

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
