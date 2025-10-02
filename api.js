// API модуль для работы с серверным хранилищем данных
class GameAPI {
    constructor() {
        // Используем порт 8080 для API сервера
        this.baseURL = `${window.location.protocol}//${window.location.hostname}:8080`;
        this.apiURL = `${this.baseURL}/api`;
        this.isOnline = true;
        
        // Проверяем доступность сервера
        this.checkServerStatus();
    }
    
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.apiURL}/status`);
            this.isOnline = response.ok;
            if (this.isOnline) {
                console.log('✅ Сервер доступен - используем серверное хранилище');
            }
        } catch (error) {
            this.isOnline = false;
            console.log('⚠️ Сервер недоступен - используем localStorage');
        }
    }
    
    // Загрузить данные определенного типа
    async loadData(dataType) {
        if (!this.isOnline) {
            return this.loadFromLocalStorage(dataType);
        }
        
        try {
            const response = await fetch(`${this.apiURL}/data/${dataType}`);
            if (response.ok) {
                const result = await response.json();
                return result.data;
            } else {
                console.warn(`Ошибка загрузки ${dataType}, используем localStorage`);
                return this.loadFromLocalStorage(dataType);
            }
        } catch (error) {
            console.warn(`Ошибка сети для ${dataType}, используем localStorage:`, error);
            return this.loadFromLocalStorage(dataType);
        }
    }
    
    // Сохранить данные определенного типа
    async saveData(dataType, data) {
        // Всегда сохраняем в localStorage как резерв
        this.saveToLocalStorage(dataType, data);
        
        if (!this.isOnline) {
            return true;
        }
        
        try {
            const response = await fetch(`${this.apiURL}/data/${dataType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log(`✅ ${dataType} сохранены на сервере`);
                return true;
            } else {
                console.warn(`⚠️ Ошибка сохранения ${dataType} на сервере`);
                return false;
            }
        } catch (error) {
            console.warn(`⚠️ Ошибка сети при сохранении ${dataType}:`, error);
            return false;
        }
    }
    
    // Загрузить все данные сразу
    async loadAllData() {
        if (!this.isOnline) {
            return this.loadAllFromLocalStorage();
        }
        
        try {
            const response = await fetch(`${this.apiURL}/data/all`);
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Все данные загружены с сервера');
                return result.data;
            } else {
                console.warn('Ошибка загрузки всех данных, используем localStorage');
                return this.loadAllFromLocalStorage();
            }
        } catch (error) {
            console.warn('Ошибка сети при загрузке всех данных:', error);
            return this.loadAllFromLocalStorage();
        }
    }
    
    // Сохранить все данные сразу
    async saveAllData(allData) {
        // Всегда сохраняем в localStorage как резерв
        this.saveAllToLocalStorage(allData);
        
        if (!this.isOnline) {
            return true;
        }
        
        try {
            const response = await fetch(`${this.apiURL}/data/all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(allData)
            });
            
            if (response.ok) {
                console.log('✅ Все данные сохранены на сервере');
                return true;
            } else {
                console.warn('⚠️ Ошибка сохранения всех данных на сервере');
                return false;
            }
        } catch (error) {
            console.warn('⚠️ Ошибка сети при сохранении всех данных:', error);
            return false;
        }
    }
    
    // Вспомогательные методы для localStorage
    loadFromLocalStorage(dataType) {
        const key = this.getLocalStorageKey(dataType);
        const data = localStorage.getItem(key);
        
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error(`Ошибка парсинга ${dataType} из localStorage:`, error);
                return this.getDefaultData(dataType);
            }
        }
        
        return this.getDefaultData(dataType);
    }
    
    saveToLocalStorage(dataType, data) {
        const key = this.getLocalStorageKey(dataType);
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Ошибка сохранения ${dataType} в localStorage:`, error);
        }
    }
    
    loadAllFromLocalStorage() {
        const dataTypes = ['users', 'applications', 'purchase_requests', 'task_submissions', 'reward_history', 'leaderboard', 'cell_tasks', 'game_states'];
        const allData = {};
        
        for (const dataType of dataTypes) {
            allData[dataType] = this.loadFromLocalStorage(dataType);
        }
        
        return allData;
    }
    
    saveAllToLocalStorage(allData) {
        for (const [dataType, data] of Object.entries(allData)) {
            this.saveToLocalStorage(dataType, data);
        }
    }
    
    getLocalStorageKey(dataType) {
        const keyMap = {
            'users': 'monopoly_users',
            'applications': 'monopoly_applications',
            'purchase_requests': 'monopoly_purchase_requests',
            'task_submissions': 'monopoly_task_submissions',
            'reward_history': 'monopoly_reward_history',
            'leaderboard': 'monopoly_leaderboard',
            'cell_tasks': 'monopoly_cell_tasks',
            'game_states': 'monopoly_game_states'
        };
        
        return keyMap[dataType] || `monopoly_${dataType}`;
    }
    
    getDefaultData(dataType) {
        if (['users', 'applications', 'purchase_requests', 'task_submissions', 'reward_history', 'leaderboard'].includes(dataType)) {
            return [];
        } else if (['cell_tasks', 'game_states'].includes(dataType)) {
            return {};
        } else {
            return [];
        }
    }
}

// Создаем глобальный экземпляр API
window.gameAPI = new GameAPI();
