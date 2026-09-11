import asyncio
import logging
from telegram import Bot
from telegram.error import TelegramError
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime

# Настройки
BOT_TOKEN = "8237609124:AAGdiMvQJZbEgy2yS67xn-I2wQvJlT5Cf-8"
CHANNEL_ID = "@bleebis_bot"  # Замените на ID вашего канала (например, @channelname или -100xxxxxxxxxx)

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Список постов для публикации (можно добавить свои)
POSTS = [
    "👋 Привет! Это автоматический пост от бота.",
    "📢 Новость дня: бот успешно публикует сообщения!",
    "💡 Интересный факт: Python — один из самых популярных языков для создания ботов.",
    "🌟 Хорошего дня! Не забывайте улыбаться.",
    "🤖 Бот продолжает работать и радовать вас постами.",
]

post_index = 0

async def send_post(bot):
    """Отправляет пост в канал"""
    global post_index
    
    try:
        message = POSTS[post_index]
        await bot.send_message(chat_id=CHANNEL_ID, text=message)
        logger.info(f"Пост отправлен: {message}")
        
        # Переход к следующему посту (циклически)
        post_index = (post_index + 1) % len(POSTS)
        
    except TelegramError as e:
        logger.error(f"Ошибка при отправке сообщения: {e}")

def main():
    """Основная функция запуска бота"""
    bot = Bot(token=BOT_TOKEN)
    
    # Создаем планировщик
    scheduler = AsyncIOScheduler()
    
    # Добавляем задачу: публикация каждые 6 часов (можно изменить)
    scheduler.add_job(send_post, 'interval', hours=6, args=[bot], id='post_job')
    
    # Запускаем планировщик
    scheduler.start()
    logger.info("Бот запущен. Посты будут публиковаться каждые 6 часов.")
    
    # Отправляем первый пост сразу при запуске
    asyncio.run(send_post(bot))
    
    # Держим бота запущенным
    try:
        while True:
            asyncio.run(asyncio.sleep(1))
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("Бот остановлен.")

if __name__ == "__main__":
    main()
