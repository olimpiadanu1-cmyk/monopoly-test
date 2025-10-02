#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех доменов

# Папка для хранения данных
DATA_DIR = 'data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Файлы для хранения данных
DATA_FILES = {
    'users': 'users.json',
    'applications': 'applications.json',
    'purchase_requests': 'purchase_requests.json',
    'task_submissions': 'task_submissions.json',
    'reward_history': 'reward_history.json',
    'leaderboard': 'leaderboard.json',
    'cell_tasks': 'cell_tasks.json',
    'game_states': 'game_states.json',
    'shop_items': 'shop_items.json',
    'shopping_carts': 'shopping_carts.json'
}

def get_file_path(data_type):
    """Получить полный путь к файлу данных"""
    return os.path.join(DATA_DIR, DATA_FILES.get(data_type, f'{data_type}.json'))

def load_data(data_type):
    """Загрузить данные из JSON файла"""
    file_path = get_file_path(data_type)
    try:
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        else:
            # Возвращаем пустые данные по умолчанию
            if data_type in ['users', 'applications', 'purchase_requests', 'task_submissions', 'reward_history', 'leaderboard', 'shop_items']:
                return []
            elif data_type in ['cell_tasks', 'game_states', 'shopping_carts']:
                return {}
            else:
                return []
    except Exception as e:
        print(f"Ошибка загрузки {data_type}: {e}")
        return [] if data_type not in ['cell_tasks', 'game_states', 'shopping_carts'] else {}

def save_data(data_type, data):
    """Сохранить данные в JSON файл"""
    file_path = get_file_path(data_type)
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Ошибка сохранения {data_type}: {e}")
        return False

# Статические файлы (HTML, CSS, JS)
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

# API для загрузки данных
@app.route('/api/data/<data_type>', methods=['GET'])
def get_data(data_type):
    """Получить данные определенного типа"""
    if data_type not in DATA_FILES:
        return jsonify({'error': 'Неизвестный тип данных'}), 400
    
    data = load_data(data_type)
    return jsonify({
        'success': True,
        'data': data,
        'timestamp': datetime.now().isoformat()
    })

# API для сохранения данных
@app.route('/api/data/<data_type>', methods=['POST'])
def save_data_endpoint(data_type):
    """Сохранить данные определенного типа"""
    if data_type not in DATA_FILES:
        return jsonify({'error': 'Неизвестный тип данных'}), 400
    
    try:
        data = request.get_json()
        if data is None:
            return jsonify({'error': 'Нет данных для сохранения'}), 400
        
        success = save_data(data_type, data)
        if success:
            return jsonify({
                'success': True,
                'message': f'Данные {data_type} сохранены',
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Ошибка сохранения данных'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Ошибка обработки данных: {str(e)}'}), 500

# API для загрузки всех данных сразу
@app.route('/api/data/all', methods=['GET'])
def get_all_data():
    """Получить все данные сразу"""
    all_data = {}
    for data_type in DATA_FILES.keys():
        all_data[data_type] = load_data(data_type)
    
    return jsonify({
        'success': True,
        'data': all_data,
        'timestamp': datetime.now().isoformat()
    })

# API для сохранения всех данных сразу
@app.route('/api/data/all', methods=['POST'])
def save_all_data():
    """Сохранить все данные сразу"""
    try:
        all_data = request.get_json()
        if not all_data:
            return jsonify({'error': 'Нет данных для сохранения'}), 400
        
        success_count = 0
        errors = []
        
        for data_type, data in all_data.items():
            if data_type in DATA_FILES:
                if save_data(data_type, data):
                    success_count += 1
                else:
                    errors.append(f'Ошибка сохранения {data_type}')
        
        return jsonify({
            'success': len(errors) == 0,
            'message': f'Сохранено {success_count} типов данных',
            'errors': errors,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка обработки данных: {str(e)}'}), 500

# API для получения статуса сервера
@app.route('/api/status', methods=['GET'])
def get_status():
    """Получить статус сервера"""
    return jsonify({
        'success': True,
        'message': 'Сервер работает',
        'timestamp': datetime.now().isoformat(),
        'data_files': list(DATA_FILES.keys())
    })

if __name__ == '__main__':
    print("Запуск сервера Monopoly Game...")
    print("Папка для данных:", DATA_DIR)
    print("Типы данных:", list(DATA_FILES.keys()))
    print("Сервер доступен по адресу: http://localhost:8080")
    print("Для локальной сети: http://192.168.1.6:8080")
    
    app.run(host='0.0.0.0', port=8080, debug=True)
