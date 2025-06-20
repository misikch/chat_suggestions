from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import os
import openai
import logging
import sys

# Настройка логирования на уровне модуля
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Логируем информацию о переменных окружения сразу при импорте модуля
logger.info("=== ДИАГНОСТИКА ENVIRONMENT ПЕРЕМЕННЫХ ===")
logger.info(f"FLASK_ENV: {os.getenv('FLASK_ENV', 'НЕ УСТАНОВЛЕНО')}")
logger.info(f"FLASK_DEBUG: {os.getenv('FLASK_DEBUG', 'НЕ УСТАНОВЛЕНО')}")
logger.info(f"OPENAI_API_KEY установлен: {'Да' if os.getenv('OPENAI_API_KEY') else 'НЕТ'}")
if os.getenv('OPENAI_API_KEY'):
    # Показываем только первые и последние символы ключа для безопасности
    key = os.getenv('OPENAI_API_KEY')
    if key and len(key) > 16:
        masked_key = f"{key[:8]}...{key[-8:]}"
    else:
        masked_key = "КОРОТКИЙ_КЛЮЧ"
    logger.info(f"OPENAI_API_KEY: {masked_key}")
logger.info(f"OPENAI_API_BASE_URL: {os.getenv('OPENAI_API_BASE_URL', 'НЕ УСТАНОВЛЕНО')}")
logger.info(f"OPENAI_MODEL_NAME: {os.getenv('OPENAI_MODEL_NAME', 'НЕ УСТАНОВЛЕНО')}")
logger.info("=== ВСЕ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ ===")
for key, value in os.environ.items():
    if 'OPENAI' in key or 'FLASK' in key:
        if 'API_KEY' in key and value:
            masked_value = f"{value[:8]}...{value[-8:]}" if len(value) > 16 else "КОРОТКИЙ_КЛЮЧ"
            logger.info(f"{key}: {masked_value}")
        else:
            logger.info(f"{key}: {value}")
logger.info("=====================================")

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для фронтенда

# Инициализация OpenAI клиента
def get_openai_client():
    """Получение настроенного OpenAI клиента"""
    api_key = os.getenv('OPENAI_API_KEY')
    api_base_url = os.getenv('OPENAI_API_BASE_URL', 'https://api.openai.com/v1')
    
    if not api_key:
        logger.warning("OPENAI_API_KEY не установлен. LLM будет недоступен.")
        return None
    
    logger.info(f"Инициализация OpenAI клиента с base_url: {api_base_url}")
    
    try:
        # Настраиваем глобальные параметры для openai 0.28.x
        logger.info("Настройка OpenAI для версии 0.28.x...")
        openai.api_key = api_key
        openai.api_base = api_base_url
        
        logger.info("✅ OpenAI настроен через глобальные переменные")
        return "legacy_openai_028"
        
    except Exception as e:
        logger.error(f"❌ Ошибка при настройке OpenAI: {e}")
        return None

def combine_messages_with_llm(messages):
    """
    Комбинирует сообщения с помощью LLM
    """
    try:
        client = get_openai_client()
        if not client:
            logger.warning("OpenAI клиент недоступен")
            return None
        
        model_name = os.getenv('OPENAI_MODEL_NAME', 'gpt-3.5-turbo')
        logger.info(f"Отправка запроса в LLM. Модель: {model_name}, Количество сообщений: {len(messages)}")
        
        # Создаем промпт для LLM
        messages_text = '\n'.join([f"- {msg}" for msg in messages])
        
        prompt = f"""Ты помощник для создания сообщений покупателя автомобиля продавцу. 
Объедини следующие отдельные вопросы/сообщения в одно естественное и вежливое сообщение на русском языке:

{messages_text}

Требования:
- Начни с приветствия "Здравствуйте!"
- Объедини все вопросы в логичный текст
- Сохрани смысл всех вопросов
- Используй вежливые обращения
- Текст должен звучать естественно, как живое сообщение человека
- Не добавляй лишней информации, только то что было в исходных сообщениях

Верни только итоговое сообщение без дополнительных комментариев."""

        logger.debug(f"Промпт для LLM: {prompt}")

        # Используем OpenAI 0.28.x API
        logger.info("🔄 Отправка запроса через OpenAI 0.28.x API")
        response = openai.ChatCompletion.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "Ты помощник для создания вежливых сообщений покупателей автомобилей."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        result = response.choices[0].message.content.strip()
        
        logger.info("LLM успешно обработал запрос")
        logger.debug(f"Результат от LLM: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Ошибка при работе с LLM: {e}")
        return None

def fallback_combine_messages(messages):
    """Fallback функция для простого объединения сообщений"""
    logger.info("Использование fallback метода для объединения сообщений")
    result = ' '.join(messages)
    logger.debug(f"Fallback результат: {result}")
    return result

@app.route('/chat/suggests/combine', methods=['POST'])
def combine_suggestions():
    """
    Комбинирует несколько шаблонных сообщений в одно
    """
    try:
        logger.info("Получен запрос на комбинирование сообщений")
        data = request.get_json()
        
        if not data or 'messages' not in data:
            logger.warning("Некорректный запрос: отсутствует поле messages")
            return jsonify({'error': 'Отсутствует поле messages'}), 400
        
        messages = data['messages']
        
        if not isinstance(messages, list) or len(messages) == 0:
            logger.warning("Некорректный запрос: messages должен быть непустым массивом")
            return jsonify({'error': 'messages должен быть непустым массивом'}), 400
        
        logger.info(f"Обработка {len(messages)} сообщений: {messages}")
        
        # Попытка использовать LLM
        combined_message = combine_messages_with_llm(messages)
        used_llm = True
        
        # Fallback к простому объединению, если LLM не сработал
        if combined_message is None:
            logger.warning("LLM недоступен, переключение на fallback метод")
            combined_message = fallback_combine_messages(messages)
            used_llm = False
        
        logger.info(f"Сообщения успешно объединены. Использован LLM: {used_llm}")
        
        # Имитируем небольшую задержку для реалистичности
        time.sleep(0.2)
        
        return jsonify({
            'combined_message': combined_message,
            'original_count': len(messages),
            'used_llm': used_llm
        })
        
    except Exception as e:
        logger.error(f"Ошибка сервера при обработке запроса: {str(e)}")
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Проверка работоспособности сервера"""
    logger.info("Проверка работоспособности сервера")
    llm_available = get_openai_client() is not None
    logger.info(f"Статус LLM: {'доступен' if llm_available else 'недоступен'}")
    return jsonify({
        'status': 'OK', 
        'message': 'Backend работает',
        'llm_available': llm_available,
        'environment_info': {
            'openai_api_key_set': bool(os.getenv('OPENAI_API_KEY')),
            'openai_api_base_url': os.getenv('OPENAI_API_BASE_URL', 'НЕ УСТАНОВЛЕНО'),
            'openai_model_name': os.getenv('OPENAI_MODEL_NAME', 'НЕ УСТАНОВЛЕНО')
        }
    })

# Проверяем доступность LLM при загрузке модуля
logger.info("Проверка доступности LLM при запуске...")
try:
    client = get_openai_client()
    if client:
        logger.info("✅ LLM готов к работе")
    else:
        logger.warning("⚠️ LLM недоступен, будет использоваться fallback режим")
except Exception as e:
    logger.error(f"❌ Ошибка при проверке LLM: {e}")

if __name__ == '__main__':
    logger.info("Запуск Flask приложения через __main__")
    app.run(host='0.0.0.0', port=5000, debug=True)
else:
    logger.info("Flask приложение загружено как модуль") 