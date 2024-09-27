const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const API_KEY_BOT = "7039887853:AAEFOOvgo2OoZvrrAzHMS4pj_gtU8WqcwkE"; //https://t.me/DosMohamedBot
const EXCHANGE_RATE_API_KEY = "078d3b40a38059fd6683af1c";

const bot = new TelegramBot(API_KEY_BOT, { polling: true });

// Объект для хранения состояния пользователей
const userStates = {};

// Функция для получения текущего курса доллара
async function getDollarRate() {
    try {
        const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/${EXCHANGE_RATE_API_KEY}/latest/USD`
        );
        const rubleRate = response.data.conversion_rates.RUB; // Курс доллара к рублю
        return rubleRate;
    } catch (error) {
        console.error("Ошибка получения курса валют:", error.message);
        return null;
    }
}

// Команда /start для начала диалога
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    userStates[chatId] = { waitingForName: true };

    bot.sendMessage(chatId, "Привет! Как тебя зовут?");
});

// Обработка всех сообщений
bot.on("message", async (msg) => {
    const chatId = msg.chat.id;

    if (userStates[chatId] && userStates[chatId].waitingForName) {
        const userName = msg.text; // Имя, введенное пользователем

        const dollarRate = await getDollarRate();

        if (dollarRate) {
            const welcomeMessage = `Рад знакомству, ${userName}! Курс доллара сегодня ${dollarRate}р.`;

            bot.sendMessage(chatId, welcomeMessage);
        } else {
            bot.sendMessage(
                chatId,
                "Не удалось получить курс доллара. Попробуйте позже."
            );
        }

        userStates[chatId].waitingForName = false;
    }
});
