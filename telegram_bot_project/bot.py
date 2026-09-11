import asyncio
from telegram import Bot
from telegram.error import TelegramError

# Конфигурация
BOT_TOKEN = "8237609124:AAGdiMvQJZbEgy2yS67xn-I2wQvJlT5Cf-8"
CHANNEL_ID = "@bleebis_bot"  # Замените на ID канала или юзернейм канала (например, @mychannel)

# Список постов для публикации
POSTS = [
    "👋 Привет! Это первый автоматический пост от бота.",
    "🚀 Бот успешно работает и публикует сообщения в канал.",
    "💡 Этот пост был отправлен автоматически по расписанию.",
    "🌟 Не забудьте подписаться на наш канал!",
    "📢 Следующий пост появится через некоторое время."
]

async def send_posts():
    bot = Bot(token=BOT_TOKEN)
    post_index = 0
    
    print(f"Бот запущен. Канал: {CHANNEL_ID}")
    
    # Отправка первого поста сразу при запуске
    try:
        await bot.send_message(chat_id=CHANNEL_ID, text=POSTS[post_index])
        print(f"Пост отправлен: {POSTS[post_index]}")
        post_index += 1
    except TelegramError as e:
        print(f"Ошибка при отправке поста: {e}")
        return
    
    # Циклическая отправка постов каждые 6 часов (21600 секунд)
    while True:
        if post_index >= len(POSTS):
            post_index = 0  # Начать сначала, если посты закончились
        
        try:
            await bot.send_message(chat_id=CHANNEL_ID, text=POSTS[post_index])
            print(f"Пост отправлен: {POSTS[post_index]}")
            post_index += 1
        except TelegramError as e:
            print(f"Ошибка при отправке поста: {e}")
        
        # Ждем 6 часов перед следующим постом
        await asyncio.sleep(21600)

if __name__ == "__main__":
    asyncio.run(send_posts())
