from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для фронтенда

@app.route('/chat/suggests/combine', methods=['POST'])
def combine_suggestions():
    """
    Комбинирует несколько шаблонных сообщений в одно
    """
    try:
        data = request.get_json()
        
        if not data or 'messages' not in data:
            return jsonify({'error': 'Отсутствует поле messages'}), 400
        
        messages = data['messages']
        
        if not isinstance(messages, list) or len(messages) == 0:
            return jsonify({'error': 'messages должен быть непустым массивом'}), 400
        
        # Комбинируем сообщения через пробел
        combined_message = ' '.join(messages)
        
        # Имитируем небольшую задержку для реалистичности
        time.sleep(0.2)
        
        return jsonify({
            'combined_message': combined_message,
            'original_count': len(messages)
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Проверка работоспособности сервера"""
    return jsonify({'status': 'OK', 'message': 'Backend работает'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 