import Calendar from "telegram-inline-calendar/src/Calendar.js";
import { bot } from "../provider/TelegramBot.js";
import { prisma } from "../provider/PrismaClient.js";

// Event listener untuk perintah /help
let onChatPromise = false;
bot.on("text", (msg) => {
  const chatId = msg.chat.id;
  if (msg.text.toLowerCase() === "/start") {
    onChatPromise = false;
    bot.sendMessage(
      chatId,
      "Welcome! Please use /help to see available commands."
    );
  }
});
bot.onText(/\/help/, (msg) => {
  onChatPromise = false;
  const chatId = msg.chat.id;

  // Menyusun tombol-tombol bantuan
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Show", callback_data: "show" },
          { text: "Add Reminder", callback_data: "add" },
          { text: "Delete Reminder", callback_data: "delete" },
        ],
      ],
    },
  };

  bot.sendMessage(chatId, "Choose one of the following:", opts);
});

// Event listener untuk callback dari tombol-tombol yang telah ditetapkan
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  onChatPromise = false;
  switch (query.data) {
    case "add":
      onChatPromise = true;
      const supportMessage =
        "Halo! Untuk dapat membantu Anda lebih baik, mohon isi informasi berikut:";
      const optsName = {
        reply_markup: {
          force_reply: true, // Mengaktifkan fitur force_reply untuk memastikan respon
        },
      };

      // Kirim pesan pertama untuk meminta nama
      bot
        .sendMessage(
          chatId,
          supportMessage + "\n\nMasukkan detail yang ingin di reminder:",
          optsName
        )
        .then(() => {
          // Mendengarkan balasan dari pengguna untuk nama
          bot.once("message", async (replyMsg) => {
            const detail = replyMsg.text ? replyMsg.text.trim() : "";

            bot
              .sendMessage(
                chatId,
                "Masukkan link yang ingin di reminder:",
                optsName
              )
              .then(async () => {
                bot.once("message", async (replyMsg) => {
                  const link = replyMsg.text ? replyMsg.text.trim() : null;
                  if (onChatPromise) {
                    await prisma.reminder.create({
                      data: {
                        chatId: replyMsg.chat.id.toString(),
                        message: detail,
                        link: link,
                      },
                    });
                    bot.sendMessage(chatId, "Reminder added successfully!");
                  }
                  onChatPromise = false;
                });
              });
          });
        });

      break;
    case "delete":
      const data = await prisma.reminder.findMany({
        where: { chatId: chatId.toString() },
      });
      if (data.length > 0) {
        const opts = {
          reply_markup: {
            inline_keyboard: [
              data.map((item) => ({
                text: item.message,
                callback_data: item.id.toString(),
              })),
            ],
          },
        };

        bot.sendMessage(chatId, "Pilih salah satu untuk dihapus:", opts);
      } else {
        bot.sendMessage(chatId, "Tidak ada reminder yang ditemukan");
      }

      break;
    case "show":
      const dataShow = await prisma.reminder.findMany({
        where: { chatId: chatId.toString() },
      });
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

        dataShow.forEach((item, index) => {
          const randomEmote = emote[Math.floor(Math.random() * emote.length)];
          message += `${randomEmote} [${item.message}](${item.link})\n`;
        });
        const optsType = {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        };
        bot.sendMessage(chatId, message, optsType);
      } else {
        let message = `🪂 List Project Airdrop\n⏰ ${formattedDate} ${formattedTime}\n\n`;

        message += `no list.\n`;

        const optsType = {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        };
        bot.sendMessage(chatId, message, optsType);
      }
      break;
    default:
      // Menangani callback lainnya jika diperlukan
      break;
  }
});

bot.on("callback_query", async (query) => {
  try {
    const reminders = await prisma.reminder.findMany({
      where: { chatId: query.message.chat.id.toString() },
      select: { id: true },
    });
    const reminderIds = reminders.map((reminder) => reminder.id.toString());
    const queryData = query.data;
    if (!queryData || isNaN(queryData) || !reminderIds.includes(queryData)) {
      return null;
    }
    const reminder = await prisma.reminder.findUnique({
      where: { id: parseInt(queryData) },
    });

    if (reminder) {
      await prisma.reminder.delete({ where: { id: reminder.id } });
      bot.answerCallbackQuery(query.id, {
        text: "Reminder deleted!",
        show_alert: true,
      });
      const helpMessage = {
        update_id: new Date().getTime(), // Unique ID for the update
        message: {
          message_id: query.message.message_id,
          from: query.from,
          chat: query.message.chat,
          date: Math.floor(Date.now() / 1000),
          text: "/help",
        },
      };
      bot.processUpdate(helpMessage);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error handling callback query:", error);
    bot.answerCallbackQuery(query.id, {
      text: "An error occurred.",
      show_alert: true,
    });
  }
});
export { bot as helpBot };
