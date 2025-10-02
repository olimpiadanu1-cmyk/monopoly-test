// Функции экрана загрузки
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    const mainContent = document.getElementById('main-content');
    
    if (loadingScreen && mainContent) {
        // Убираем класс hidden с основного контента
        mainContent.classList.remove('hidden');
        
        // Через 1.5 секунды полностью удаляем экран загрузки
        setTimeout(() => {
            if (loadingScreen.parentNode) {
                loadingScreen.parentNode.removeChild(loadingScreen);
            }
        }, 1500);
    }
}

// Игровые переменные
let currentPosition = 1;
let movesLeft = 30;
const totalCells = 28;
let playerPoints = 0;
let gameCompleted = false;

// Отслеживание завершенных игр (по клеткам)
let completedGames = {};

// Игровые переменные инициализированы

// Функция testMove удалена - кнопка работает корректно

// Функция для принудительного сброса игры (для отладки)
window.resetGameForDebug = function() {
    console.log('Принудительный сброс игры для отладки');
    currentPosition = 1;
    movesLeft = 30;
    gameCompleted = false;
    playerPoints = 1000;
    
    if (currentUser) {
        saveGameState();
    }
    
    updateGameInfo();
    updatePlayerPosition();
    updateMoveButton();
    updatePointsDisplay();
    
    console.log('Игра сброшена:');
    console.log('currentPosition:', currentPosition);
    console.log('movesLeft:', movesLeft);
    console.log('gameCompleted:', gameCompleted);
    
    console.log('Игра сброшена! Попробуйте нажать "Ход"');
};

// Функции сохранения игрового состояния
function saveGameState() {
    if (!currentUser) return;
    
    const gameState = {
        position: currentPosition,
        moves: movesLeft,
        points: playerPoints,
        completed: gameCompleted,
        completedGames: completedGames,
        userId: currentUser.id
    };
    
    localStorage.setItem(`monopoly_game_state_${currentUser.id}`, JSON.stringify(gameState));
}

function saveLeaderboard(players) {
    localStorage.setItem('monopoly_leaderboard', JSON.stringify(players));
}

// Функция для автоматического обновления лидерборда
function startLeaderboardAutoUpdate() {
    // Обновляем лидерборд каждые 5 секунд, если пользователь авторизован
    setInterval(() => {
        if (currentUser && document.getElementById('monopoly-page') && !document.getElementById('monopoly-page').classList.contains('hidden')) {
            // Перезагружаем данные пользователей
            users = JSON.parse(localStorage.getItem('monopoly_users') || '[]');
            
            // Обновляем лидерборд
            createLeaderboard();
        }
    }, 5000); // Каждые 5 секунд
}

function loadGameState() {
    if (!currentUser) return;
    
    const savedState = localStorage.getItem(`monopoly_game_state_${currentUser.id}`);
    
    if (savedState) {
        const gameState = JSON.parse(savedState);
        
        currentPosition = gameState.position || 1;
        movesLeft = gameState.moves || 30;
        playerPoints = gameState.points || 0;
        gameCompleted = gameState.completed || false;
        completedGames = gameState.completedGames || {};
        
        // Обновляем интерфейс
        updateGameInfo();
        updatePlayerPosition();
        updatePointsDisplay();
        
        // Проверяем завершение игры
        if (gameCompleted) {
            showGameOverOverlay();
        }
        updateTaskNumber();
    }
}

// Система пользователей
let currentUser = null;
let users = JSON.parse(localStorage.getItem('monopoly_users') || '[]');
let applications = JSON.parse(localStorage.getItem('monopoly_applications') || '[]');

// Статусы заявок
const APPLICATION_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved', 
    REJECTED: 'rejected'
};

// Функции навигации
function showAuthPage() {
    document.getElementById('auth-page').classList.remove('hidden');
    document.getElementById('monopoly-page').classList.add('hidden');
    document.getElementById('admin-page').classList.add('hidden');
    document.getElementById('admin-shop-page').classList.add('hidden');
}

function showMonopolyGame() {
    if (!currentUser) {
        showAuthPage();
        return;
    }
    
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('monopoly-page').classList.remove('hidden');
    document.getElementById('admin-page').classList.add('hidden');
    document.getElementById('admin-shop-page').classList.add('hidden');
    
    // Обновляем активную кнопку
    document.querySelector('.monopoly-btn').classList.add('active');
    document.querySelector('.shop-btn').classList.remove('active');
    document.querySelector('.admin-btn').classList.remove('active');
}

function showAdminShop() {
    if (!currentUser) {
        showNotification('Войдите в систему для доступа к магазину!', 'error');
        return;
    }
    
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('monopoly-page').classList.add('hidden');
    document.getElementById('admin-page').classList.add('hidden');
    document.getElementById('admin-shop-page').classList.remove('hidden');
    
    // Обновляем активную кнопку
    document.querySelector('.monopoly-btn').classList.remove('active');
    document.querySelector('.shop-btn').classList.add('active');
    document.querySelector('.admin-btn').classList.remove('active');
    
    // Перезагружаем данные перед показом магазина
    purchaseRequests = JSON.parse(localStorage.getItem('monopoly_purchase_requests') || '[]');
    
    loadShopData();
}

function showAdminPanel() {
    if (!currentUser || !currentUser.isAdmin) {
        showNotification('У вас нет прав доступа к админ панели!', 'error');
        return;
    }
    
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('monopoly-page').classList.add('hidden');
    document.getElementById('admin-page').classList.remove('hidden');
    document.getElementById('admin-shop-page').classList.add('hidden');
    
    // Обновляем активную кнопку
    document.querySelector('.monopoly-btn').classList.remove('active');
    document.querySelector('.shop-btn').classList.remove('active');
    document.querySelector('.admin-btn').classList.add('active');
    
    loadAdminData();
}

// Функции аутентификации
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
}

function registerUser() {
    const nick = document.getElementById('reg-nick').value.trim();
    const vk = document.getElementById('reg-vk').value.trim();
    const password = document.getElementById('reg-password').value;
    const passwordConfirm = document.getElementById('reg-password-confirm').value;
    
    // Валидация
    if (!nick || !vk || !password || !passwordConfirm) {
        showNotification('Заполните все поля!', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showNotification('Пароли не совпадают!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Пароль должен быть не менее 6 символов!', 'error');
        return;
    }
    
    // Проверяем, нет ли уже такого ника
    if (users.find(u => u.nick === nick) || applications.find(a => a.nick === nick)) {
        showNotification('Игрок с таким ником уже существует!', 'error');
        return;
    }
    
    // Создаем заявку
    const application = {
        id: Date.now(),
        nick: nick,
        vk: vk,
        password: password,
        status: APPLICATION_STATUS.PENDING,
        createdAt: new Date().toISOString()
    };
    
    applications.push(application);
    localStorage.setItem('monopoly_applications', JSON.stringify(applications));
    
    showNotification('Заявка подана! Ожидайте одобрения администрации.', 'success');
    
    // Очищаем форму
    document.getElementById('reg-nick').value = '';
    document.getElementById('reg-vk').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-password-confirm').value = '';
    
    showLogin();
}

function loginUser() {
    const nick = document.getElementById('login-nick').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!nick || !password) {
        showNotification('Заполните все поля!', 'error');
        return;
    }
    
    // Ищем пользователя
    const user = users.find(u => u.nick === nick && u.password === password);
    
    if (!user) {
        showNotification('Неверный ник или пароль!', 'error');
        return;
    }
    
    // Авторизуем пользователя
    currentUser = user;
    localStorage.setItem('monopoly_current_user', JSON.stringify(currentUser));
    
    // Сбрасываем состояния модальных окон
    resetModalStates();
    
    // Загружаем сохраненное игровое состояние
    loadGameState();
    
    // Если нет сохраненного состояния, создаем начальное состояние только для новых пользователей
    const savedState = localStorage.getItem(`monopoly_game_state_${currentUser.id}`);
    if (!savedState) {
        // Устанавливаем начальные значения только для новых пользователей
        currentPosition = 1;
        movesLeft = 30;
        gameCompleted = false;
        
        if (user.points !== undefined) {
            playerPoints = user.points;
        } else {
            playerPoints = 0;
        }
        
        // Выдаем 1000 очков при первом входе (временно для тестирования)
        playerPoints += 1000;
        saveUserPoints();
        saveGameState();
        
        // Обновляем интерфейс
        updateGameInfo();
        updatePlayerPosition();
        
        showNotification('Добро пожаловать в игру! Вы получили 1000 стартовых очков.', 'success');
    } else {
        // Для существующих пользователей просто загружаем сохраненное состояние
        showNotification(`С возвращением, ${user.nick}!`, 'success');
    }
    
    updatePointsDisplay();
    
    // Обновляем лидерборд при входе пользователя
    setTimeout(() => {
        createLeaderboard();
        updatePlayerStatus();
    }, 100);
    
    showMonopolyGame();
    initializeGame();
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('monopoly_current_user');
    showNotification('Вы вышли из системы', 'info');
    showAuthPage();
}

// Инициализация игры
function initializeGame() {
    createGameBoard();
    updateGameInfo();
    updatePlayerPosition();
    updateMoveButton();
    updateTaskNumber();
    createLeaderboard(); // Создаем лидерборд и обновляем статус игрока
    
    // Убеждаемся, что все модальные окна закрыты при инициализации
    resetModalStates();
    
    // Настраиваем кнопку задания
    setTimeout(() => {
        setupTaskButton();
    }, 100);
}

// Создание игрового поля
function createGameBoard() {
    const gameBoard = document.querySelector('.game-board');
    
    // Сохраняем наложенный текст перед очисткой
    const overlayText = gameBoard.querySelector('.board-overlay-text');
    
    gameBoard.innerHTML = '';
    
    // Создаем контейнер для игрового поля
    const boardContainer = document.createElement('div');
    boardContainer.className = 'board-container';
    
    // Создаем квадратное поле 8x8 с клетками по периметру (28 клеток)
    const boardSize = 8;
    const cells = [];
    
    // Создаем все позиции для квадратного поля
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cellDiv = document.createElement('div');
            
            // Определяем, является ли клетка частью игрового поля (по периметру)
            const isGameCell = (row === 0 || row === boardSize - 1 || col === 0 || col === boardSize - 1);
            
            if (isGameCell) {
                // Определяем номер клетки по периметру
                let cellNumber = getCellNumber(row, col, boardSize);
                
                if (cellNumber > 0 && cellNumber <= totalCells) {
                    cellDiv.className = 'game-cell';
                    cellDiv.id = `cell-${cellNumber}`;
                    cellDiv.innerHTML = `<span class="cell-number">${cellNumber}</span>`;
                    
                    // Добавляем специальные клетки
                    if (cellNumber === 1) {
                        cellDiv.classList.add('start-cell');
                        cellDiv.innerHTML += '<div class="cell-label">СТАРТ</div>';
                    } else if (cellNumber === 28) {
                        cellDiv.classList.add('super-prize-cell');
                        cellDiv.innerHTML += '<div class="cell-label">СУПЕР ПРИЗ</div>';
                    } else if ([4, 7, 10, 13, 16, 19, 22, 25].includes(cellNumber)) {
                        cellDiv.classList.add('prize-cell');
                        cellDiv.innerHTML += '<div class="cell-label">ПРИЗ</div>';
                    }
                } else {
                    cellDiv.className = 'empty-cell';
                }
            } else {
                // Центральная область - полностью пустая
                cellDiv.className = 'center-area';
            }
            
            boardContainer.appendChild(cellDiv);
        }
    }
    
    gameBoard.appendChild(boardContainer);
    
    // Восстанавливаем наложенный текст после создания поля
    if (overlayText) {
        gameBoard.appendChild(overlayText);
    } else {
        // Создаем наложенный текст если его нет
        const overlayDiv = document.createElement('div');
        overlayDiv.className = 'board-overlay-text';
        overlayDiv.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-title">Выполняйте задания</div>
                <div class="overlay-subtitle">своего сектора</div>
                <div class="overlay-divider"></div>
                <div class="overlay-subtitle">Получайте призы на</div>
                <div class="overlay-subtitle">клетках 4, 7, 10, 13...</div>
            </div>
        `;
        gameBoard.appendChild(overlayDiv);
    }
}

// Функция для определения номера клетки по позиции в квадрате
function getCellNumber(row, col, size) {
    // Проверяем, находится ли клетка на периметре
    const isPerimeter = (row === 0 || row === size - 1 || col === 0 || col === size - 1);
    
    if (!isPerimeter) {
        return 0; // Не периметр
    }
    
    let cellNumber = 0;
    
    // Начинаем с правого нижнего угла (клетка 1) и идем против часовой стрелки
    
    // Нижняя сторона (справа налево): клетки 1-8
    if (row === size - 1) {
        cellNumber = size - col;
    }
    // Левая сторона (снизу вверх): клетки 9-15
    else if (col === 0) {
        cellNumber = size + (size - 1 - row);
    }
    // Верхняя сторона (слева направо): клетки 16-22
    else if (row === 0) {
        cellNumber = 2 * size - 1 + col;
    }
    // Правая сторона (сверху вниз): клетки 23-30
    else if (col === size - 1) {
        cellNumber = 3 * size - 2 + row;
    }
    
    // Ограничиваем до 30 клеток
    return cellNumber <= totalCells ? cellNumber : 0;
}

// Обновление информации об игре
function updateGameInfo() {
    document.getElementById('moves-count').textContent = movesLeft;
    document.getElementById('current-cell').textContent = `${currentPosition} из ${totalCells}`;
}

// Обновление позиции игрока
function updatePlayerPosition() {
    // Убираем игрока со всех клеток
    document.querySelectorAll('.game-cell').forEach(cell => {
        cell.classList.remove('player-position');
    });
    
    // Добавляем игрока на текущую позицию
    const currentCell = document.getElementById(`cell-${currentPosition}`);
    if (currentCell) {
        currentCell.classList.add('player-position');
    }
}

// Совершить ход
window.makeMove = function makeMove() {
    if (!currentUser) {
        showNotification('Войдите в систему для игры!', 'error');
        return;
    }
    
    if (gameCompleted) {
        showNotification('Игра завершена! Вы уже прошли все испытания.', 'info');
        return;
    }
    
    if (movesLeft <= 0) {
        showNotification('У вас нет доступных ходов!', 'error');
        return;
    }
    
    // Перемещаем игрока на 1 шаг
    currentPosition += 1;
    
    // Если превысили количество клеток, остаемся на 28-й клетке
    if (currentPosition > totalCells) {
        currentPosition = totalCells;
    }
    
    // Уменьшаем количество ходов
    movesLeft--;
    
    // Сохраняем игровое состояние
    saveGameState();
    
    // Обновляем интерфейс
    updateGameInfo();
    updatePlayerPosition();
    updateTaskNumber();
    
    // Показываем результат хода
    showMoveResult();
    
    // Начисляем очки за ход
    addPoints();
    
    // Проверяем, попали ли на призовую клетку
    checkPrizeCell();
    
    // Обновляем статус игрока в топе
    const players = [
        { name: 'Игрок1', position: 26, rank: 1 },
        { name: 'Игрок2', position: 23, rank: 2 },
        { name: 'Игрок3', position: 20, rank: 3 },
        { name: 'Игрок4', position: 17, rank: 4 },
        { name: 'Игрок5', position: 14, rank: 5 }
    ];
    updatePlayerStatus();
    
    // Обновляем номер задания на кнопке
    updateTaskNumber();
}

// Показать результат хода
function showMoveResult() {
    const moveResult = document.createElement('div');
    moveResult.className = 'move-result';
    moveResult.innerHTML = `➡️ Переход на клетку ${currentPosition}`;
    
    document.querySelector('.game-controls').appendChild(moveResult);
    
    setTimeout(() => {
        moveResult.remove();
    }, 2000);
}

// Начислить очки за ход
function addPoints(points = null) {
    const prizeNumbers = [4, 7, 10, 13, 16, 19, 22, 25];
    
    if (points !== null) {
        // Начисляем указанное количество очков (для супер приза и других особых случаев)
        playerPoints += points;
        updatePointsDisplay();
        saveUserPoints();
        saveGameState();
    } else if (!prizeNumbers.includes(currentPosition) && currentPosition !== 28) {
        // За обычную клетку +10 очков (призовые клетки обрабатываются в мини-игре)
        playerPoints += 10;
        updatePointsDisplay();
        saveUserPoints();
        saveGameState();
        
        showNotification(`Вы получили 10 очков! Всего очков: ${playerPoints}`, 'success');
    }
}

// Обновить отображение очков
function updatePointsDisplay() {
    document.getElementById('player-points').textContent = playerPoints;
}

// Сохранить очки пользователя
function saveUserPoints() {
    if (currentUser) {
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].points = playerPoints;
            currentUser.points = playerPoints;
            localStorage.setItem('monopoly_users', JSON.stringify(users));
            localStorage.setItem('monopoly_current_user', JSON.stringify(currentUser));
        }
    }
}

// Проверить призовую клетку
function checkPrizeCell() {
    const prizeNumbers = [4, 7, 10, 13, 16, 19, 22, 25];
    
    if (currentPosition === 28 && !gameCompleted) {
        setTimeout(() => {
            // Супер приз - викторина + змейка
            showSuperPrize();
        }, 500);
    } else if (currentPosition === 28 && gameCompleted) {
        setTimeout(() => {
            showNotification('Вы уже прошли супер приз! Игра завершена.', 'info');
        }, 500);
    } else if (prizeNumbers.includes(currentPosition)) {
        setTimeout(() => {
            // Выбираем мини-игру в зависимости от клетки
            switch(currentPosition) {
                case 4:
                    showCupsGame();
                    break;
                case 7:
                    showWheelGame();
                    break;
                case 10:
                    showTetrisGame();
                    break;
                case 13:
                    showTicTacToeGame();
                    break;
                case 16:
                    showMinesweeperGame();
                    break;
                case 19:
                    showClickerGame();
                    break;
                case 22:
                    showBallGame();
                    break;
                case 25:
                    showRacingGame();
                    break;
                default:
                    showCupsGame(); // fallback
            }
        }, 500);
    }
}

// Переменные для мини-игры стаканчики
let cupsGameActive = false;
let cupPrizes = [];
let gamePhase = 'start'; // start, showing, shuffled, finished

// Переменные для колеса удачи
let wheelActive = false;
let wheelCanvas = null;
let wheelCtx = null;
let wheelRotation = 0;
let isSpinning = false;
let wheelSections = [];

// Переменные для супер приза
let superPrizeActive = false;
let currentQuizQuestion = null;
let snakeGame = null;
let wrongAnswersCount = 0;
const maxWrongAnswers = 3;

// Вопросы для викторины
const quizQuestions = [
    {
        question: "Какая столица Канады?",
        answers: ["Торонто", "Оттава", "Ванкувер", "Монреаль"],
        correct: 1
    },
    {
        question: "Какая самая длинная река в мире?",
        answers: ["Амазонка", "Нил", "Янцзы", "Миссисипи"],
        correct: 1
    },
    {
        question: "В каком году была основана компания Google?",
        answers: ["1996", "1998", "2000", "2002"],
        correct: 1
    },
    {
        question: "Какой элемент имеет химический символ 'Au'?",
        answers: ["Серебро", "Золото", "Алюминий", "Медь"],
        correct: 1
    },
    {
        question: "Сколько континентов на Земле?",
        answers: ["5", "6", "7", "8"],
        correct: 2
    }
];

// Показать мини-игру стаканчики
function showCupsGame() {
    cupsGameActive = true;
    gamePhase = 'start';
    
    // Генерируем случайные призы
    const possiblePrizes = [50, 100, 150];
    cupPrizes = [...possiblePrizes].sort(() => Math.random() - 0.5);
    
    // Показываем модальное окно
    document.getElementById('cups-game-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Сбрасываем состояние игры
    resetCupsGame();
}

// Сбросить состояние мини-игры
function resetCupsGame() {
    document.getElementById('game-status').textContent = 'Нажмите "Показать призы" чтобы начать!';
    document.getElementById('show-prizes-btn').classList.remove('hidden');
    document.getElementById('shuffle-btn').classList.add('hidden');
    
    // Скрываем все призы и сбрасываем стили стаканчиков
    for (let i = 0; i < 3; i++) {
        document.getElementById(`prize-${i}`).classList.add('hidden');
        document.querySelector(`[data-cup="${i}"]`).classList.remove('selected', 'disabled');
    }
}

// Показать призы под стаканчиками
function showPrizes() {
    gamePhase = 'showing';
    document.getElementById('game-status').textContent = 'Запомните, где какой приз!';
    document.getElementById('show-prizes-btn').classList.add('hidden');
    
    // Показываем призы
    for (let i = 0; i < 3; i++) {
        const prizeElement = document.getElementById(`prize-${i}`);
        prizeElement.textContent = `${cupPrizes[i]} очков`;
        prizeElement.classList.remove('hidden');
    }
    
    // Через 3 секунды скрываем призы и показываем кнопку перемешивания
    setTimeout(() => {
        for (let i = 0; i < 3; i++) {
            document.getElementById(`prize-${i}`).classList.add('hidden');
        }
        document.getElementById('shuffle-btn').classList.remove('hidden');
        document.getElementById('game-status').textContent = 'Нажмите "Перемешать" чтобы начать игру!';
    }, 3000);
}

// Перемешать стаканчики
function shuffleCups() {
    gamePhase = 'shuffled';
    document.getElementById('shuffle-btn').classList.add('hidden');
    document.getElementById('game-status').textContent = 'Стаканчики перемешиваются...';
    
    // Анимация перемешивания
    const cupsContainer = document.getElementById('cups-container');
    cupsContainer.classList.add('shuffling');
    
    // Перемешиваем призы несколько раз во время анимации
    let shuffleCount = 0;
    const shuffleInterval = setInterval(() => {
        cupPrizes = cupPrizes.sort(() => Math.random() - 0.5);
        shuffleCount++;
        
        if (shuffleCount >= 8) { // Перемешиваем 8 раз за 2 секунды
            clearInterval(shuffleInterval);
        }
    }, 250);
    
    setTimeout(() => {
        cupsContainer.classList.remove('shuffling');
        document.getElementById('game-status').textContent = 'Выберите стаканчик!';
        gamePhase = 'ready';
    }, 2000);
}

// Выбрать стаканчик
function selectCup(cupIndex) {
    if (gamePhase !== 'ready') return;
    
    gamePhase = 'finished';
    const selectedPrize = cupPrizes[cupIndex];
    
    // Показываем результат
    document.querySelector(`[data-cup="${cupIndex}"]`).classList.add('selected');
    document.getElementById(`prize-${cupIndex}`).textContent = `${selectedPrize} очков`;
    document.getElementById(`prize-${cupIndex}`).classList.remove('hidden');
    
    // Показываем все призы
    for (let i = 0; i < 3; i++) {
        if (i !== cupIndex) {
            document.getElementById(`prize-${i}`).textContent = `${cupPrizes[i]} очков`;
            document.getElementById(`prize-${i}`).classList.remove('hidden');
            document.querySelector(`[data-cup="${i}"]`).classList.add('disabled');
        }
    }
    
    // Красивое сообщение о результате
    let message = '';
    let motivationalText = '';
    
    if (selectedPrize >= 100) {
        message = '🏆 Победа';
        motivationalText = 'Вы получили наивысшую награду в данной игре.';
    } else if (selectedPrize >= 50) {
        message = '🥈 Хороший результат';
        motivationalText = 'Вы заработали значительное количество очков.';
    } else {
        message = '🥉 Приз получен';
        motivationalText = 'Игра завершена успешно. Очки начислены.';
    }
    
    document.getElementById('game-status').textContent = `Вы получили ${selectedPrize} очков!`;
    
    // Добавляем очки игроку
    playerPoints += selectedPrize;
    updatePointsDisplay();
    saveUserPoints();
    saveGameState();
    
    // Закрываем мини-игру через 3 секунды и продолжаем игру
    setTimeout(() => {
        hideCupsGame();
        continueAfterPrize();
    }, 3000);
}

// Скрыть мини-игру стаканчики
function hideCupsGame() {
    document.getElementById('cups-game-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    cupsGameActive = false;
}

// Продолжить игру после получения приза
function continueAfterPrize() {
    // Автоматически переходим на следующую клетку после получения приза
    currentPosition += 1;
    if (currentPosition > totalCells) {
        currentPosition = 1;
    }
    
    // Сохраняем игровое состояние
    saveGameState();
    
    // Обновляем интерфейс
    updateGameInfo();
    updatePlayerPosition();
    updateTaskNumber();
    
    // Обновляем статус игрока в топе
}

// Функция для перехода на +1 шаг без получения приза (при закрытии игры крестиком)
function continueWithoutPrize() {
    // Переходим на следующую клетку без получения приза
    currentPosition += 1;
    if (currentPosition > totalCells) {
        currentPosition = 1;
    }
    
    // Сохраняем игровое состояние
    saveGameState();
    
    // Обновляем интерфейс
    updateGameInfo();
    updatePlayerPosition();
    updateTaskNumber();
    
    // Показываем уведомление
    showNotification('Игра пропущена. Переход на следующую клетку.', 'info');
    const players = [
        { name: 'Игрок1', position: 26, rank: 1 },
        { name: 'Игрок2', position: 23, rank: 2 },
        { name: 'Игрок3', position: 20, rank: 3 },
        { name: 'Игрок4', position: 17, rank: 4 },
        { name: 'Игрок5', position: 14, rank: 5 }
    ];
    updatePlayerStatus();
    
    showNotification(`Вы автоматически перешли на клетку ${currentPosition}!`, 'success');
}

// Перезапустить игру
function restartGame() {
    if (confirm('Вы уверены, что хотите начать игру заново?')) {
        currentPosition = 1;
        movesLeft = 1;
        updateGameInfo();
        updatePlayerPosition();
    }
}

// Показать объяснение игры
function showExplanation() {
    document.getElementById('explanation-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
}

// Скрыть объяснение игры
function hideExplanation() {
    document.getElementById('explanation-modal').classList.add('hidden');
    document.body.style.overflow = 'auto'; // Возвращаем прокрутку
}

// Показать задание
function showTask() {
    console.log('🎯 Функция showTask() вызвана');
    console.log('currentUser:', currentUser);
    console.log('currentPosition:', currentPosition);
    
    // Проверяем кнопку задания
    const taskButton = document.querySelector('.task-btn');
    console.log('Кнопка задания найдена:', !!taskButton);
    console.log('Кнопка задания disabled:', taskButton?.disabled);
    console.log('Кнопка задания onclick:', taskButton?.onclick);
    
    if (!currentUser) {
        showNotification('Войдите в систему для просмотра заданий!', 'error');
        return;
    }
    
    const taskModal = document.getElementById('task-modal');
    console.log('taskModal найдено:', !!taskModal);
    console.log('taskModal classes:', taskModal?.className);
    console.log('taskModal display:', taskModal?.style.display);
    
    if (!taskModal) {
        console.error('Модальное окно задания не найдено!');
        showNotification('Ошибка: модальное окно не найдено!', 'error');
        return;
    }
    
    // Сбрасываем скриншоты при каждом открытии
    currentTaskScreenshots = [];
    if (typeof updateScreenshotsPreview === 'function') {
        updateScreenshotsPreview();
    }
    if (typeof updateSubmitButton === 'function') {
        updateSubmitButton();
    }
    
    updateTaskModal();
    taskModal.classList.remove('hidden');
    taskModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Модальное окно задания открыто');
    console.log('Classes после открытия:', taskModal.className);
    console.log('Display после открытия:', taskModal.style.display);
}

// Скрыть задание
function hideTask() {
    console.log('❌ Функция hideTask() вызвана');
    const taskModal = document.getElementById('task-modal');
    console.log('taskModal найдено для закрытия:', !!taskModal);
    
    if (taskModal) {
        console.log('Classes до закрытия:', taskModal.className);
        console.log('Display до закрытия:', taskModal.style.display);
        
        taskModal.classList.add('hidden');
        taskModal.style.display = 'none';
        
        console.log('Classes после закрытия:', taskModal.className);
        console.log('Display после закрытия:', taskModal.style.display);
    }
    document.body.style.overflow = 'auto';
    console.log('✅ Модальное окно задания закрыто');
}

// Обновить номер задания на кнопке
function updateTaskNumber() {
    const taskNumberElement = document.getElementById('task-number');
    if (taskNumberElement) {
        taskNumberElement.textContent = currentPosition;
    }
}

// Глобальная функция для тестирования кнопки задания
window.testTaskButton = function() {
    console.log('🧪 ТЕСТ: Проверка кнопки задания');
    console.log('currentUser:', currentUser);
    console.log('currentPosition:', currentPosition);
    
    const taskButton = document.querySelector('.task-btn');
    console.log('Кнопка найдена:', !!taskButton);
    
    const taskModal = document.getElementById('task-modal');
    console.log('Модальное окно найдено:', !!taskModal);
    
    if (taskModal) {
        console.log('Классы модального окна:', taskModal.className);
        console.log('Стиль display:', taskModal.style.display);
    }
    
    // Принудительно вызываем функцию
    showTask();
};

// Принудительное открытие модального окна (для отладки)
window.forceOpenTaskModal = function() {
    console.log('🚀 ПРИНУДИТЕЛЬНОЕ ОТКРЫТИЕ модального окна задания');
    
    const taskModal = document.getElementById('task-modal');
    if (taskModal) {
        // Убираем класс hidden
        taskModal.classList.remove('hidden');
        // Принудительно показываем
        taskModal.style.display = 'flex';
        taskModal.style.visibility = 'visible';
        taskModal.style.opacity = '1';
        // Блокируем прокрутку
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Модальное окно принудительно открыто');
        console.log('Классы:', taskModal.className);
        console.log('Стили:', {
            display: taskModal.style.display,
            visibility: taskModal.style.visibility,
            opacity: taskModal.style.opacity
        });
    } else {
        console.error('❌ Модальное окно не найдено!');
    }
};

// Обновить модальное окно задания
function updateTaskModal() {
    console.log('📝 Обновление модального окна задания');
    
    // Инициализируем задания если их нет
    initializeTasks();
    
    // Обновляем номера клеток в заголовках
    const cellNumber1 = document.getElementById('task-cell-number');
    const cellNumber2 = document.getElementById('task-cell-number-text');
    
    if (cellNumber1) {
        cellNumber1.textContent = currentPosition;
        console.log('✅ Обновлен номер клетки в заголовке:', currentPosition);
    } else {
        console.error('❌ Элемент task-cell-number не найден');
    }
    
    if (cellNumber2) {
        cellNumber2.textContent = currentPosition;
    } else {
        console.error('❌ Элемент task-cell-number-text не найден');
    }
    
    const taskText = cellTasks[currentPosition] || `Задание для клетки ${currentPosition}`;
    const taskModalBody = document.querySelector('#task-modal .task-text p');
    
    if (taskModalBody) {
        taskModalBody.textContent = taskText;
        console.log('✅ Обновлен текст задания:', taskText);
    } else {
        console.error('❌ Элемент .task-text p не найден');
    }
}

// НОВАЯ СИСТЕМА ЗАДАНИЙ - Показать задание
function showTaskNew() {
    console.log('🎯 НОВАЯ СИСТЕМА: Показать задание');
    
    if (!currentUser) {
        showNotification('Войдите в систему для просмотра заданий!', 'error');
        return;
    }
    
    const taskModal = document.getElementById('task-modal');
    if (!taskModal) {
        console.error('Модальное окно задания не найдено!');
        showNotification('Ошибка отображения задания!', 'error');
        return;
    }
    
    // Обновляем содержимое модального окна
    updateTaskModalNew();
    
    // Показываем модальное окно
    taskModal.classList.remove('hidden');
    taskModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    console.log('✅ Модальное окно задания открыто');
}

// Глобальная функция для принудительного открытия задания (для отладки)
window.forceShowTask = function() {
    console.log('Принудительное открытие задания');
    showTask();
};

// Глобальная функция для проверки состояния кнопки
window.checkTaskButton = function() {
    const taskButton = document.getElementById('task-button');
    console.log('Кнопка задания:', {
        exists: !!taskButton,
        id: taskButton?.id,
        disabled: taskButton?.disabled,
        pointerEvents: taskButton?.style.pointerEvents,
        opacity: taskButton?.style.opacity,
        onclick: !!taskButton?.onclick,
        hasEventListener: taskButton?._hasEventListener || 'unknown'
    });
};

// Глобальная функция для принудительной настройки кнопки
window.forceSetupTaskButton = function() {
    console.log('Принудительная настройка кнопки задания');
    setupTaskButton();
};

// Настройка кнопки задания
function setupTaskButton() {
    const taskButton = document.querySelector('.task-btn');
    if (!taskButton) {
        console.error('Кнопка задания не найдена!');
        return;
    }
    
    // Обновляем номер задания
    const taskNumberElement = taskButton.querySelector('#task-number');
    if (taskNumberElement) {
        taskNumberElement.textContent = currentPosition;
    }
    
    console.log('Кнопка задания обновлена, позиция:', currentPosition);
}

// НОВАЯ СИСТЕМА ЗАДАНИЙ - Скрыть задание
function hideTaskNew() {
    console.log('🔒 НОВАЯ СИСТЕМА: Скрыть задание');
    
    const taskModal = document.getElementById('task-modal');
    if (taskModal) {
        taskModal.classList.add('hidden');
        taskModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('✅ Модальное окно задания закрыто');
    }
}

// Сброс состояний всех модальных окон
function resetModalStates() {
    // Закрываем модальное окно задания
    const taskModal = document.getElementById('task-modal');
    if (taskModal) {
        taskModal.classList.add('hidden');
        taskModal.style.display = 'none';
    }
    
    // Восстанавливаем прокрутку
    document.body.style.overflow = 'auto';
    
}

// Обновить номер задания на кнопке

// Обновить модальное окно задания
// Старая функция updateTaskModal удалена - используется новая версия ниже

// Создать топ игроков (пример данных)
function createLeaderboard() {
    const leaderboardList = document.querySelector('.leaderboard-list');
    
    // Получаем всех зарегистрированных пользователей с их игровыми данными
    const registeredUsers = users.filter(user => !user.isAdmin); // Исключаем админов
    
    // Создаем массив игроков с их позициями
    let players = registeredUsers.map(user => {
        // Загружаем игровое состояние каждого пользователя
        const gameState = localStorage.getItem(`monopoly_game_state_${user.id}`);
        let position = 1; // По умолчанию стартовая позиция
        
        if (gameState) {
            const state = JSON.parse(gameState);
            position = state.position || 1;
        }
        
        return {
            name: user.nick,
            position: position,
            userId: user.id,
            rank: 0
        };
    });
    
    // Сортируем по позиции (от большей к меньшей)
    players.sort((a, b) => b.position - a.position);
    
    // Присваиваем ранги
    players.forEach((player, index) => {
        player.rank = index + 1;
    });
    
    // Сохраняем обновленный лидерборд
    saveLeaderboard(players);
    
    if (players.length === 0) {
        leaderboardList.innerHTML = '<div class="leaderboard-empty">Пока нет игроков</div>';
        // Все равно обновляем статус игрока, даже если нет других игроков
        updatePlayerStatus();
        return;
    }
    
    leaderboardList.innerHTML = '';
    
    // Показываем только топ-5
    players.slice(0, 5).forEach(player => {
        const item = document.createElement('div');
        item.className = `leaderboard-item ${player.rank <= 3 ? `top-${player.rank}` : ''}`;
        
        item.innerHTML = `
            <div class="player-info">
                <div class="player-rank">${player.rank}</div>
                <div class="player-name">${player.name}</div>
            </div>
            <div class="player-position">Клетка ${player.position}</div>
        `;
        
        leaderboardList.appendChild(item);
    });
    
    updatePlayerStatus();
}

// Обновить статус текущего игрока
function updatePlayerStatus() {
    if (!currentUser) return;
    
    const playerStatusDiv = document.querySelector('.player-status');
    if (!playerStatusDiv) {
        console.log('Элемент .player-status не найден');
        return;
    }
    
    // Загружаем актуальный лидерборд
    const players = JSON.parse(localStorage.getItem('monopoly_leaderboard') || '[]');
    
    // Текущая позиция игрока
    const currentPlayerPosition = currentPosition;
    
    // Находим ранг текущего игрока среди зарегистрированных игроков
    const currentPlayerRank = players.findIndex(p => p.name === currentUser.nick) + 1;
    
    // Находим ближайшего игрока впереди
    const playersAhead = players.filter(p => p.position > currentPlayerPosition);
    let movesToNext = 0;
    let nextPlayerPosition = 30;
    
    if (playersAhead.length > 0) {
        // Находим ближайшего игрока впереди
        const closestPlayer = playersAhead.reduce((closest, player) => 
            player.position < closest.position ? player : closest
        );
        nextPlayerPosition = closestPlayer.position;
        movesToNext = nextPlayerPosition - currentPlayerPosition;
    } else {
        // Если впереди никого нет, считаем до лидера (через круг)
        const leader = players[0];
        if (leader && leader.position < currentPlayerPosition) {
            movesToNext = (totalCells - currentPlayerPosition) + leader.position;
            nextPlayerPosition = leader.position;
        }
    }
    
    // Определяем текст для отображения
    let statusText = '';
    let rankEmoji = '';
    
    if (players.length === 0) {
        // Если нет других игроков
        statusText = `<strong>Единственный игрок</strong>`;
    } else if (currentPlayerRank > 0) {
        if (currentPlayerRank === 1) {
            statusText = `<strong>1-е место</strong> из ${players.length} игроков`;
        } else if (currentPlayerRank === 2) {
            statusText = `<strong>2-е место</strong> из ${players.length} игроков`;
        } else if (currentPlayerRank === 3) {
            statusText = `<strong>3-е место</strong> из ${players.length} игроков`;
        } else {
            statusText = `<strong>${currentPlayerRank}-е место</strong> из ${players.length} игроков`;
        }
    } else {
        statusText = 'Не в рейтинге';
    }
    
    playerStatusDiv.innerHTML = `
        <div class="player-status-simple">
            <div>Ваше положение</div>
            <div>Клетка <strong>${currentPlayerPosition}</strong> из ${totalCells}</div>
            <div>${statusText}</div>
        </div>
    `;
    
    // Убеждаемся, что элемент видим
    playerStatusDiv.style.display = 'block';
    playerStatusDiv.style.visibility = 'visible';
}

// Переменные для системы заданий
let currentTaskScreenshots = [];
let maxScreenshots = 5;

// Функция прикрепления скриншотов
function attachScreenshots() {
    const input = document.getElementById('screenshot-input');
    input.click();
}

// Обработчик выбора файлов
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('screenshot-input');
    if (input) {
        input.addEventListener('change', handleScreenshotSelection);
    }
});

function handleScreenshotSelection(event) {
    const files = Array.from(event.target.files);
    
    // Проверяем лимит файлов
    if (currentTaskScreenshots.length + files.length > maxScreenshots) {
        showNotification(`Можно прикрепить максимум ${maxScreenshots} скриншотов`, 'error');
        return;
    }
    
    files.forEach(file => {
        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
            showNotification('Можно загружать только изображения', 'error');
            return;
        }
        
        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Размер файла не должен превышать 5MB', 'error');
            return;
        }
        
        // Создаем объект скриншота
        const screenshot = {
            id: Date.now() + Math.random(),
            file: file,
            url: URL.createObjectURL(file)
        };
        
        currentTaskScreenshots.push(screenshot);
    });
    
    updateScreenshotsPreview();
    updateSubmitButton();
    
    // Очищаем input для возможности повторного выбора тех же файлов
    event.target.value = '';
}

function updateScreenshotsPreview() {
    const preview = document.getElementById('screenshots-preview');
    preview.innerHTML = '';
    
    currentTaskScreenshots.forEach(screenshot => {
        const item = document.createElement('div');
        item.className = 'screenshot-item';
        
        item.innerHTML = `
            <img src="${screenshot.url}" alt="Screenshot">
            <button class="screenshot-remove" onclick="removeScreenshot('${screenshot.id}')">×</button>
        `;
        
        preview.appendChild(item);
    });
}

function removeScreenshot(screenshotId) {
    currentTaskScreenshots = currentTaskScreenshots.filter(s => s.id != screenshotId);
    updateScreenshotsPreview();
    updateSubmitButton();
}

function updateSubmitButton() {
    const submitBtn = document.querySelector('.submit-btn');
    if (currentTaskScreenshots.length > 0) {
        submitBtn.disabled = false;
    } else {
        submitBtn.disabled = true;
    }
}

// Функция отправки задания на проверку
function submitTaskForReview() {
    if (!currentUser) {
        showNotification('Необходимо войти в систему', 'error');
        return;
    }
    
    if (currentTaskScreenshots.length === 0) {
        showNotification('Необходимо прикрепить хотя бы один скриншот', 'error');
        return;
    }
    
    // Создаем объект задания для проверки
    const taskSubmission = {
        id: Date.now(),
        userId: currentUser.id,
        userNick: currentUser.nick,
        userVK: currentUser.vk || 'Не указан',
        taskNumber: currentPosition,
        taskDescription: document.getElementById('task-description').textContent,
        screenshots: currentTaskScreenshots.map(s => ({
            id: s.id,
            url: s.url,
            fileName: s.file.name
        })),
        status: 'pending', // pending, approved, rejected
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        reviewComment: null
    };
    
    // Сохраняем в localStorage
    const submissions = JSON.parse(localStorage.getItem('monopoly_task_submissions') || '[]');
    submissions.push(taskSubmission);
    localStorage.setItem('monopoly_task_submissions', JSON.stringify(submissions));
    
    // Обновляем статус задания для пользователя
    const userTaskStatus = JSON.parse(localStorage.getItem(`monopoly_user_tasks_${currentUser.id}`) || '{}');
    userTaskStatus[currentPosition] = {
        status: 'pending',
        submissionId: taskSubmission.id,
        submittedAt: taskSubmission.submittedAt
    };
    localStorage.setItem(`monopoly_user_tasks_${currentUser.id}`, JSON.stringify(userTaskStatus));
    
    // Показываем статус
    showTaskStatus('pending', 'Задание отправлено на проверку');
    
    // Очищаем скриншоты
    currentTaskScreenshots = [];
    updateScreenshotsPreview();
    updateSubmitButton();
    
    showNotification('Задание отправлено на проверку!', 'success');
}

function showTaskStatus(status, message) {
    const statusDiv = document.getElementById('task-status');
    const statusText = document.getElementById('status-text');
    
    statusDiv.className = `task-status ${status}`;
    statusText.textContent = message;
    statusDiv.style.display = 'block';
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем контейнер для уведомлений если его нет
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Определяем иконку по типу
    let icon = '📢';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    if (type === 'prize') icon = '🎉';
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${icon}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close" onclick="closeNotification(this)">×</button>
        </div>
    `;
    
    // Добавляем уведомление
    notificationContainer.appendChild(notification);
    
    // Показываем с анимацией
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Автоматически скрываем через 4 секунды
    setTimeout(() => {
        closeNotification(notification.querySelector('.notification-close'));
    }, 4000);
}

// Закрыть уведомление
function closeNotification(closeBtn) {
    const notification = closeBtn.closest('.notification');
    notification.classList.remove('show');
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Админские функции
function loadAdminData() {
    loadApplications();
    loadUsers();
}

function loadApplications() {
    // Перезагружаем заявки из localStorage для актуальных данных
    applications = JSON.parse(localStorage.getItem('monopoly_applications') || '[]');
    
    const applicationsList = document.getElementById('applications-list');
    const pendingApplications = applications.filter(app => app.status === APPLICATION_STATUS.PENDING);
    
    // Обновляем счетчик
    const countElement = document.getElementById('applications-count');
    if (countElement) {
        countElement.textContent = `(${pendingApplications.length})`;
    }
    
    if (!applicationsList) return;
    
    if (pendingApplications.length === 0) {
        applicationsList.innerHTML = '<div class="no-data">Нет новых заявок</div>';
        return;
    }
    
    applicationsList.innerHTML = '';
    
    pendingApplications.forEach(app => {
        const appElement = document.createElement('div');
        appElement.className = 'application-item';
        appElement.innerHTML = `
            <div class="app-info">
                <div class="app-nick">${app.nick}</div>
                <div class="app-vk"><a href="${app.vk}" target="_blank">Профиль ВК</a></div>
                <div class="app-date">Подана: ${new Date(app.createdAt).toLocaleString()}</div>
            </div>
            <div class="app-actions">
                <button class="approve-btn" onclick="approveApplication(${app.id})">✅ Одобрить</button>
                <button class="reject-btn" onclick="rejectApplication(${app.id})">❌ Отклонить</button>
            </div>
        `;
        applicationsList.appendChild(appElement);
    });
}

function loadUsers() {
    // Перезагружаем пользователей из localStorage для актуальных данных
    users = JSON.parse(localStorage.getItem('monopoly_users') || '[]');
    
    const usersList = document.getElementById('users-list');
    const regularUsers = users.filter(user => !user.isAdmin);
    
    // Обновляем счетчик
    const countElement = document.getElementById('users-count');
    if (countElement) {
        countElement.textContent = `(${regularUsers.length})`;
    }
    
    if (!usersList) return;
    
    if (regularUsers.length === 0) {
        usersList.innerHTML = '<div class="no-data">Нет зарегистрированных игроков</div>';
        return;
    }
    
    usersList.innerHTML = '';
    
    regularUsers.forEach(user => {
        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = `
            <div class="user-info">
                <div class="user-nick">${user.nick} ${user.isAdmin ? '👑' : ''}</div>
                <div class="user-vk"><a href="${user.vk}" target="_blank">Профиль ВК</a></div>
                <div class="user-date">Регистрация: ${new Date(user.registeredAt).toLocaleString()}</div>
            </div>
            <div class="user-actions">
                ${!user.isAdmin ? `<button class="ban-btn" onclick="banUser(${user.id})">🚫 Заблокировать</button>` : ''}
            </div>
        `;
        usersList.appendChild(userElement);
    });
}

function approveApplication(appId) {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    // Создаем пользователя
    const newUser = {
        id: Date.now(),
        nick: app.nick,
        vk: app.vk,
        password: app.password,
        isAdmin: false,
        registeredAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('monopoly_users', JSON.stringify(users));
    
    // Обновляем статус заявки
    app.status = APPLICATION_STATUS.APPROVED;
    localStorage.setItem('monopoly_applications', JSON.stringify(applications));
    
    showNotification(`Заявка игрока ${app.nick} одобрена!`, 'success');
    
    // Обновляем лидерборд после добавления нового игрока
    createLeaderboard();
    
    loadAdminData();
}

function rejectApplication(appId) {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    
    app.status = APPLICATION_STATUS.REJECTED;
    localStorage.setItem('monopoly_applications', JSON.stringify(applications));
    
    showNotification(`Заявка игрока ${app.nick} отклонена!`, 'warning');
    loadAdminData();
}

function banUser(userId) {
    if (confirm('Вы уверены, что хотите заблокировать этого пользователя?')) {
        users = users.filter(u => u.id !== userId);
        localStorage.setItem('monopoly_users', JSON.stringify(users));
        
        showNotification('Пользователь заблокирован!', 'warning');
        loadUsers();
    }
}

// Функции магазина
let shopItems = JSON.parse(localStorage.getItem('monopoly_shop_items') || '[]');
let purchaseRequests = JSON.parse(localStorage.getItem('monopoly_purchase_requests') || '[]');

// Система заданий
let cellTasks = JSON.parse(localStorage.getItem('monopoly_cell_tasks') || '{}');

const PURCHASE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

function loadShopData() {
    loadShopItems();
    updateCartCount();
    
    // Обновляем заголовок и секцию управления в зависимости от прав пользователя
    const shopTitle = document.getElementById('shop-title');
    const managementSection = document.querySelector('#admin-shop-page .admin-section:last-child');
    
    if (currentUser && currentUser.isAdmin) {
        shopTitle.textContent = '🛒 Админ магазин';
        if (managementSection) {
            managementSection.style.display = 'block';
        }
    } else {
        shopTitle.textContent = '🛒 Магазин';
        if (managementSection) {
            managementSection.style.display = 'none';
        }
    }
}

function loadShopItems() {
    const shopItemsList = document.getElementById('shop-items');
    
    if (shopItems.length === 0) {
        shopItemsList.innerHTML = '<div class="no-data">Товары отсутствуют</div>';
        return;
    }
    
    const isAdmin = currentUser && currentUser.isAdmin;
    
    shopItemsList.innerHTML = shopItems.map(item => `
        <div class="shop-item">
            <div class="item-info">
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-price">💎 ${item.price} очков</div>
            </div>
            ${isAdmin ? `
            <div class="item-actions">
                <button class="action-btn edit-btn" onclick="editShopItem(${item.id})">
                    <span>✏️</span>
                    Редактировать
                </button>
                <button class="action-btn delete-btn" onclick="deleteShopItem(${item.id})">
                    <span>🗑️</span>
                    Удалить
                </button>
            </div>
            ` : `
            <div class="item-actions">
                <button class="action-btn buy-btn" onclick="buyItem(${item.id})">Купить</button>
            </div>
            `}
        </div>
    `).join('');
}

function addShopItem() {
    const name = document.getElementById('item-name').value.trim();
    const price = parseInt(document.getElementById('item-price').value);
    const description = document.getElementById('item-description').value.trim();
    
    if (!name || !price || !description) {
        showNotification('Заполните все поля!', 'error');
        return;
    }
    
    if (price < 1) {
        showNotification('Цена должна быть больше 0!', 'error');
        return;
    }
    
    const newItem = {
        id: Date.now(),
        name: name,
        price: price,
        description: description,
        createdAt: new Date().toISOString()
    };
    
    shopItems.push(newItem);
    localStorage.setItem('monopoly_shop_items', JSON.stringify(shopItems));
    
    // Очищаем форму
    document.getElementById('item-name').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-description').value = '';
    
    showNotification('Товар добавлен в магазин!', 'success');
    loadShopItems();
}

function editShopItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    showEditItemModal(item);
}

function showEditItemModal(item) {
    // Создаем модальное окно для редактирования
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="hideEditItemModal()"></div>
        <div class="modal-content edit-item-modal-content">
            <div class="modal-header edit-item-header">
                <h2>✏️ Редактировать товар</h2>
                <button class="modal-close" onclick="hideEditItemModal()">×</button>
            </div>
            <div class="modal-body edit-item-body">
                <div class="form-group">
                    <label for="edit-item-name">Название товара:</label>
                    <input type="text" id="edit-item-name" value="${item.name}" placeholder="Введите название товара">
                </div>
                <div class="form-group">
                    <label for="edit-item-price">Цена (в очках):</label>
                    <input type="number" id="edit-item-price" value="${item.price}" placeholder="Введите цену" min="1">
                </div>
                <div class="form-group">
                    <label for="edit-item-description">Описание:</label>
                    <textarea id="edit-item-description" placeholder="Введите описание товара" rows="3">${item.description}</textarea>
                </div>
                <div class="edit-item-actions">
                    <button class="save-item-btn" onclick="saveEditedItem(${item.id})">
                        <span>💾</span>
                        Сохранить
                    </button>
                    <button class="cancel-edit-btn" onclick="hideEditItemModal()">
                        <span>❌</span>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.id = 'edit-item-modal';
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function hideEditItemModal() {
    const modal = document.getElementById('edit-item-modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

function saveEditedItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    const newName = document.getElementById('edit-item-name').value.trim();
    const newPrice = parseInt(document.getElementById('edit-item-price').value);
    const newDescription = document.getElementById('edit-item-description').value.trim();
    
    if (!newName || !newPrice || !newDescription) {
        showNotification('Все поля должны быть заполнены!', 'error');
        return;
    }
    
    if (newPrice < 1) {
        showNotification('Цена должна быть больше 0!', 'error');
        return;
    }
    
    item.name = newName;
    item.price = newPrice;
    item.description = newDescription;
    
    localStorage.setItem('monopoly_shop_items', JSON.stringify(shopItems));
    showNotification('✅ Товар успешно обновлен!', 'success');
    loadShopItems();
    hideEditItemModal();
}

function deleteShopItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    shopItems = shopItems.filter(i => i.id !== itemId);
    localStorage.setItem('monopoly_shop_items', JSON.stringify(shopItems));
    
    showNotification(`🗑️ Товар "${item.name}" удален из магазина!`, 'warning');
    loadShopItems();
}

let currentPurchaseItem = null;

function buyItem(itemId) {
    const item = shopItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (playerPoints < item.price) {
        showNotification(`Недостаточно очков! Нужно: ${item.price}, у вас: ${playerPoints}`, 'error');
        return;
    }
    
    // Сохраняем информацию о товаре для покупки
    currentPurchaseItem = item;
    
    // Заполняем модальное окно информацией о товаре
    document.getElementById('purchase-item-name').textContent = item.name;
    document.getElementById('purchase-item-description').textContent = item.description;
    document.getElementById('purchase-item-price').textContent = `${item.price} очков`;
    document.getElementById('purchase-user-balance').textContent = `${playerPoints} очков`;
    
    // Показываем модальное окно
    showPurchaseConfirm();
}

function showPurchaseConfirm() {
    document.getElementById('purchase-confirm-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hidePurchaseConfirm() {
    document.getElementById('purchase-confirm-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    currentPurchaseItem = null;
}

function confirmPurchase() {
    if (!currentPurchaseItem) return;
    
    // Создаем заявку на покупку
    const purchaseRequest = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.nick,
        itemId: currentPurchaseItem.id,
        itemName: currentPurchaseItem.name,
        itemDescription: currentPurchaseItem.description,
        itemPrice: currentPurchaseItem.price,
        status: PURCHASE_STATUS.PENDING,
        createdAt: new Date().toISOString()
    };
    
    // Списываем очки сразу (они вернутся при отклонении)
    playerPoints -= currentPurchaseItem.price;
    updatePointsDisplay();
    saveUserPoints();
    
    // Сохраняем заявку
    purchaseRequests.push(purchaseRequest);
    localStorage.setItem('monopoly_purchase_requests', JSON.stringify(purchaseRequests));
    
    // Обновляем счетчик корзины
    updateCartCount();
    
    // Показываем уведомление
    showNotification(`📝 Заявка на "${currentPurchaseItem.name}" отправлена! Ожидайте одобрения администрации.`, 'info');
    
    // Закрываем модальное окно
    hidePurchaseConfirm();
}

// Функции корзины
function updateCartCount() {
    if (!currentUser) return;
    
    // Перезагружаем данные из localStorage
    purchaseRequests = JSON.parse(localStorage.getItem('monopoly_purchase_requests') || '[]');
    
    const userRequests = purchaseRequests.filter(req => req.userId === currentUser.id && req.status === PURCHASE_STATUS.PENDING);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = userRequests.length;
    }
}

function showCart() {
    // Перезагружаем данные из localStorage перед показом корзины
    purchaseRequests = JSON.parse(localStorage.getItem('monopoly_purchase_requests') || '[]');
    
    document.getElementById('cart-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadCartItems();
}

function hideCart() {
    document.getElementById('cart-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showCartTab(tabName) {
    // Переключаем табы
    document.querySelectorAll('.cart-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.cart-tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[onclick="showCartTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`cart-${tabName}`).classList.add('active');
    
    loadCartItems();
}

function loadCartItems() {
    if (!currentUser) return;
    
    const userRequests = purchaseRequests.filter(req => req.userId === currentUser.id);
    
    // Загружаем ожидающие
    const pendingItems = userRequests.filter(req => req.status === PURCHASE_STATUS.PENDING);
    loadCartItemsByStatus('pending', pendingItems);
    
    // Загружаем одобренные
    const approvedItems = userRequests.filter(req => req.status === PURCHASE_STATUS.APPROVED);
    loadCartItemsByStatus('approved', approvedItems);
    
    // Загружаем отклоненные
    const rejectedItems = userRequests.filter(req => req.status === PURCHASE_STATUS.REJECTED);
    loadCartItemsByStatus('rejected', rejectedItems);
}

function loadCartItemsByStatus(status, items) {
    const container = document.getElementById(`cart-${status}-items`);
    
    if (items.length === 0) {
        container.innerHTML = '<div class="no-data">Нет товаров</div>';
        return;
    }
    
    container.innerHTML = items.map(item => {
        let statusText = '';
        let dateText = '';
        
        if (status === 'pending') {
            statusText = 'Ожидает';
            dateText = `Заявка от: ${new Date(item.createdAt).toLocaleDateString('ru-RU')}`;
        } else if (status === 'approved') {
            statusText = 'Выдано';
            dateText = item.approvedAt ? `Выдано: ${new Date(item.approvedAt).toLocaleDateString('ru-RU')}` : 'Выдано';
        } else {
            statusText = 'Отклонено';
            dateText = item.rejectedAt ? `Отклонено: ${new Date(item.rejectedAt).toLocaleDateString('ru-RU')}` : 'Отклонено';
        }
        
        return `
            <div class="cart-item ${status}">
                <div class="cart-item-info">
                    <h4>${item.itemName}</h4>
                    <p>${item.itemDescription}</p>
                    <div class="cart-item-price">${item.itemPrice} очков</div>
                    <div class="cart-item-date">${dateText}</div>
                </div>
                <div class="cart-item-status status-${status}">
                    ${statusText}
                </div>
            </div>
        `;
    }).join('');
}

// Функции супер приза
function showSuperPrize() {
    superPrizeActive = true;
    
    // Сбрасываем счетчик неправильных ответов при новом входе в супер приз
    wrongAnswersCount = 0;
    updateWrongAnswersDisplay();
    
    // Выбираем случайный вопрос
    currentQuizQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    
    // Показываем модальное окно
    const modal = document.getElementById('super-prize-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Показываем этап викторины
    showQuizStage();
}

function showQuizStage() {
    // Скрываем другие этапы
    document.getElementById('snake-stage').classList.add('hidden');
    document.getElementById('result-stage').classList.add('hidden');
    
    // Показываем этап викторины
    document.getElementById('quiz-stage').classList.remove('hidden');
    
    // Заполняем вопрос
    document.getElementById('quiz-question').textContent = currentQuizQuestion.question;
    
    // Заполняем варианты ответов
    const answersContainer = document.getElementById('quiz-answers');
    answersContainer.innerHTML = '';
    
    currentQuizQuestion.answers.forEach((answer, index) => {
        const answerDiv = document.createElement('div');
        answerDiv.className = 'quiz-answer';
        answerDiv.textContent = answer;
        answerDiv.onclick = () => selectQuizAnswer(index);
        answersContainer.appendChild(answerDiv);
    });
}

function selectQuizAnswer(selectedIndex) {
    const answers = document.querySelectorAll('.quiz-answer');
    
    // Отключаем все кнопки
    answers.forEach(answer => {
        answer.style.pointerEvents = 'none';
    });
    
    // Показываем правильный и неправильный ответы
    answers[currentQuizQuestion.correct].classList.add('correct');
    
    if (selectedIndex !== currentQuizQuestion.correct) {
        answers[selectedIndex].classList.add('incorrect');
        
        // Увеличиваем счетчик неправильных ответов
        wrongAnswersCount++;
        updateWrongAnswersDisplay();
        
        // Проверяем, достигнут ли лимит неправильных ответов
        if (wrongAnswersCount >= maxWrongAnswers) {
            setTimeout(() => {
                showResultStage(false, `💀 Вы исчерпали все попытки! Дано ${maxWrongAnswers} неправильных ответа. Игра окончена.`);
            }, 2000);
        } else {
            // Показываем новый вопрос через 2 секунды
            setTimeout(() => {
                // Выбираем новый случайный вопрос
                currentQuizQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
                showQuizStage();
            }, 2000);
        }
    } else {
        // Правильный ответ - переходим к игре змейка
        setTimeout(() => {
            showSnakeStage();
        }, 2000);
    }
}

function showSnakeStage() {
    // Скрываем другие этапы
    document.getElementById('quiz-stage').classList.add('hidden');
    document.getElementById('result-stage').classList.add('hidden');
    
    // Показываем этап змейки
    document.getElementById('snake-stage').classList.remove('hidden');
    
    // Показываем подсказку о начале игры
    const hint = document.querySelector('.snake-start-hint');
    if (hint) {
        hint.style.display = 'inline-block';
    }
    
    // Инициализируем игру змейка
    initSnakeGame();
}

function showResultStage(success, message) {
    // Скрываем другие этапы
    document.getElementById('quiz-stage').classList.add('hidden');
    document.getElementById('snake-stage').classList.add('hidden');
    
    // Показываем результат
    const resultStage = document.getElementById('result-stage');
    const resultContent = document.getElementById('result-content');
    
    resultStage.classList.remove('hidden');
    // Используем textContent для безопасного отображения текста
    resultContent.textContent = message;
    resultContent.className = `result-content ${success ? 'success' : 'failure'}`;
}

function updateWrongAnswersDisplay() {
    const wrongAnswersElement = document.getElementById('wrong-answers-count');
    if (wrongAnswersElement) {
        wrongAnswersElement.textContent = wrongAnswersCount;
        
        // Меняем цвет в зависимости от количества ошибок
        const counter = wrongAnswersElement.parentElement;
        if (wrongAnswersCount >= maxWrongAnswers) {
            counter.style.background = 'rgba(220, 53, 69, 0.2)';
            counter.style.color = '#721c24';
            counter.style.borderColor = 'rgba(220, 53, 69, 0.4)';
        } else if (wrongAnswersCount >= 2) {
            counter.style.background = 'rgba(255, 193, 7, 0.2)';
            counter.style.color = '#856404';
            counter.style.borderColor = 'rgba(255, 193, 7, 0.4)';
        }
    }
}

function showGameOverOverlay() {
    const overlay = document.getElementById('game-over-overlay');
    const finalScoreElement = document.getElementById('final-score');
    
    if (overlay && finalScoreElement) {
        finalScoreElement.textContent = playerPoints;
        overlay.classList.remove('hidden');
        
        // Обновляем кнопку хода на "КОНЕЦ"
        updateMoveButton();
    }
}

function updateMoveButton() {
    const moveBtn = document.querySelector('.move-btn');
    
    if (moveBtn) {
        if (gameCompleted) {
            moveBtn.innerHTML = `
                <span class="icon">🏁</span>
                КОНЕЦ
            `;
            moveBtn.disabled = true;
            moveBtn.style.opacity = '0.6';
            moveBtn.style.cursor = 'not-allowed';
        } else {
            // Восстанавливаем кнопку, если игра не завершена
            moveBtn.innerHTML = `
                <span class="icon">🎯</span>
                Ход
            `;
            moveBtn.disabled = false;
            moveBtn.style.opacity = '1';
            moveBtn.style.cursor = 'pointer';
        }
    }
}

function closeSuperPrize() {
    const modal = document.getElementById('super-prize-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    superPrizeActive = false;
    currentQuizQuestion = null;
    wrongAnswersCount = 0;
    
    if (snakeGame) {
        snakeGame.stop();
        snakeGame = null;
    }
}

// Игра "Змейка"
function initSnakeGame() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    
    // Настройки игры
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    
    let snake = [
        {x: 10, y: 10}
    ];
    let food = {};
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameRunning = true;
    let gameStarted = false; // Флаг для отслеживания начала игры
    
    // Генерируем еду
    function generateFood() {
        food = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Проверяем, что еда не появилась на змейке
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                generateFood();
                return;
            }
        }
    }
    
    // Рисуем игру
    function drawGame() {
        // Очищаем canvas
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем змейку
        ctx.fillStyle = '#28a745';
        for (let segment of snake) {
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        }
        
        // Рисуем еду (число 3)
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
        
        // Рисуем число 3 на еде
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('3', food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2 + 4);
    }
    
    // Обновляем игру
    function updateGame() {
        if (!gameRunning || !gameStarted) return;
        
        // Двигаем голову змейки
        const head = {x: snake[0].x + dx, y: snake[0].y + dy};
        
        // Проверяем столкновение со стенами
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
            gameOver();
            return;
        }
        
        // Проверяем столкновение с собой
        for (let segment of snake) {
            if (head.x === segment.x && head.y === segment.y) {
                gameOver();
                return;
            }
        }
        
        snake.unshift(head);
        
        // Проверяем, съела ли змейка еду
        if (head.x === food.x && head.y === food.y) {
            score++;
            document.getElementById('snake-length').textContent = snake.length;
            
            // Проверяем победу (достигли длины 3)
            if (snake.length >= 3) {
                gameWin();
                return;
            }
            
            generateFood();
        } else {
            snake.pop();
        }
        
        drawGame();
    }
    
    // Победа в игре
    function gameWin() {
        gameRunning = false;
        addPoints(1000); // Супер приз дает 1000 очков
        
        // Устанавливаем флаг завершения игры
        gameCompleted = true;
        saveGameState();
        
        showNotification('🎉 Поздравляем! Вы выиграли супер приз и получили 1000 очков!', 'success');
        
        const beautifulMessage = '🎉 ПОЗДРАВЛЯЕМ! Вы прошли финальное испытание и получили 1000 очков!';
        
        showResultStage(true, beautifulMessage);
        
        // Показываем табличку завершения игры через 3 секунды
        setTimeout(() => {
            showGameOverOverlay();
        }, 3000);
    }
    
    // Поражение в игре
    function gameOver() {
        gameRunning = false;
        
        const gameOverMessage = '💀 Игра окончена! Змейка врезалась. Попробуйте еще раз.';
        
        showResultStage(false, gameOverMessage);
    }
    
    // Обработка нажатий клавиш
    function handleKeyPress(e) {
        if (!gameRunning) return;
        
        const LEFT_KEY = 37;
        const RIGHT_KEY = 39;
        const UP_KEY = 38;
        const DOWN_KEY = 40;
        
        const keyPressed = e.keyCode;
        const goingUp = dy === -1;
        const goingDown = dy === 1;
        const goingRight = dx === 1;
        const goingLeft = dx === -1;
        
        // Проверяем, является ли нажатая клавиша стрелкой
        if ([LEFT_KEY, RIGHT_KEY, UP_KEY, DOWN_KEY].includes(keyPressed)) {
            // Запускаем игру при первом нажатии стрелки
            if (!gameStarted) {
                gameStarted = true;
                // Скрываем подсказку о начале игры
                const hint = document.querySelector('.snake-start-hint');
                if (hint) {
                    hint.style.display = 'none';
                }
            }
            
            if (keyPressed === LEFT_KEY && !goingRight) {
                dx = -1;
                dy = 0;
            }
            
            if (keyPressed === UP_KEY && !goingDown) {
                dx = 0;
                dy = -1;
            }
            
            if (keyPressed === RIGHT_KEY && !goingLeft) {
                dx = 1;
                dy = 0;
            }
            
            if (keyPressed === DOWN_KEY && !goingUp) {
                dx = 0;
                dy = 1;
            }
        }
    }
    
    // Запускаем игру
    generateFood();
    drawGame();
    
    // Добавляем обработчик клавиш
    document.addEventListener('keydown', handleKeyPress);
    
    // Игровой цикл
    const gameInterval = setInterval(updateGame, 150);
    
    // Сохраняем объект игры для возможности остановки
    snakeGame = {
        stop: function() {
            gameRunning = false;
            clearInterval(gameInterval);
            document.removeEventListener('keydown', handleKeyPress);
        }
    };
}

function restartSnakeGame() {
    if (snakeGame) {
        snakeGame.stop();
    }
    
    // Сбрасываем счетчик длины
    document.getElementById('snake-length').textContent = '1';
    
    // Перезапускаем игру
    initSnakeGame();
}

// Функции колеса удачи
function showWheelGame() {
    wheelActive = true;
    
    // Создаем секции колеса (15 секций)
    wheelSections = [];
    
    // 14 обычных секций с очками от 10 до 100
    for (let i = 0; i < 14; i++) {
        wheelSections.push({
            points: Math.floor(Math.random() * 91) + 10, // 10-100 очков
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            isSuper: false
        });
    }
    
    // 1 супер приз 200 очков
    wheelSections.push({
        points: 200,
        color: '#e74c3c',
        isSuper: true
    });
    
    // Перемешиваем секции
    for (let i = wheelSections.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wheelSections[i], wheelSections[j]] = [wheelSections[j], wheelSections[i]];
    }
    
    // Показываем модальное окно
    const modal = document.getElementById('wheel-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Инициализируем колесо
    initWheel();
}

function initWheel() {
    wheelCanvas = document.getElementById('wheel-canvas');
    wheelCtx = wheelCanvas.getContext('2d');
    wheelRotation = 0;
    isSpinning = false;
    
    drawWheel();
}

function drawWheel() {
    const centerX = wheelCanvas.width / 2;
    const centerY = wheelCanvas.height / 2;
    const radius = 140;
    const sectionAngle = (2 * Math.PI) / wheelSections.length;
    
    wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);
    
    // Рисуем секции
    for (let i = 0; i < wheelSections.length; i++) {
        const startAngle = i * sectionAngle + wheelRotation;
        const endAngle = (i + 1) * sectionAngle + wheelRotation;
        
        // Рисуем секцию
        wheelCtx.beginPath();
        wheelCtx.moveTo(centerX, centerY);
        wheelCtx.arc(centerX, centerY, radius, startAngle, endAngle);
        wheelCtx.closePath();
        wheelCtx.fillStyle = wheelSections[i].color;
        wheelCtx.fill();
        wheelCtx.strokeStyle = '#fff';
        wheelCtx.lineWidth = 2;
        wheelCtx.stroke();
        
        // Рисуем текст
        const textAngle = startAngle + sectionAngle / 2;
        const textX = centerX + Math.cos(textAngle) * (radius * 0.7);
        const textY = centerY + Math.sin(textAngle) * (radius * 0.7);
        
        wheelCtx.save();
        wheelCtx.translate(textX, textY);
        wheelCtx.rotate(textAngle + Math.PI / 2);
        wheelCtx.fillStyle = '#fff';
        wheelCtx.font = wheelSections[i].isSuper ? 'bold 14px Arial' : '12px Arial';
        wheelCtx.textAlign = 'center';
        wheelCtx.fillText(wheelSections[i].isSuper ? `СУПЕР ${wheelSections[i].points}` : wheelSections[i].points.toString(), 0, 0);
        wheelCtx.restore();
    }
    
    // Рисуем центральный круг
    wheelCtx.beginPath();
    wheelCtx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    wheelCtx.fillStyle = '#495057';
    wheelCtx.fill();
    wheelCtx.strokeStyle = '#fff';
    wheelCtx.lineWidth = 3;
    wheelCtx.stroke();
}

function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;
    spinBtn.textContent = 'КРУТИТСЯ...';
    
    // Случайное количество оборотов (3-6 полных оборотов + случайный угол)
    const spins = Math.random() * 3 + 3;
    const finalRotation = spins * 2 * Math.PI;
    const duration = 3000; // 3 секунды
    const startTime = Date.now();
    const startRotation = wheelRotation;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing функция для плавного замедления
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        wheelRotation = startRotation + finalRotation * easeOut;
        drawWheel();
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Определяем выигрышную секцию
            // Указатель находится сверху (угол 0), поэтому нужно учесть поворот колеса
            const normalizedRotation = wheelRotation % (2 * Math.PI);
            const sectionAngle = (2 * Math.PI) / wheelSections.length;
            
            // Корректируем расчет для указателя сверху
            let pointerAngle = (3 * Math.PI / 2 - normalizedRotation) % (2 * Math.PI);
            if (pointerAngle < 0) pointerAngle += 2 * Math.PI;
            
            const winningIndex = Math.floor(pointerAngle / sectionAngle) % wheelSections.length;
            
            console.log('Wheel Debug:', {
                normalizedRotation,
                pointerAngle,
                sectionAngle,
                winningIndex,
                winningSection: wheelSections[winningIndex]
            });
            
            showWheelResult(wheelSections[winningIndex]);
        }
    }
    
    animate();
}

function showWheelResult(section) {
    isSpinning = false;
    
    const resultDiv = document.getElementById('wheel-result');
    const resultText = document.getElementById('wheel-result-text');
    
    if (section.isSuper) {
        resultText.innerHTML = `🎉 СУПЕР ПРИЗ! Вы выиграли ${section.points} очков!`;
        resultDiv.style.background = 'rgba(231, 76, 60, 0.1)';
        resultDiv.style.borderColor = '#e74c3c';
        resultText.style.color = '#721c24';
    } else {
        resultText.innerHTML = `🎯 Поздравляем! Вы выиграли ${section.points} очков!`;
    }
    
    resultDiv.classList.remove('hidden');
    
    // Начисляем очки
    addPoints(section.points);
    showNotification(`Колесо удачи: +${section.points} очков! Всего очков: ${playerPoints}`, 'success');
}

function continueAfterWheel() {
    hideWheelGame();
}

function hideWheelGame() {
    const modal = document.getElementById('wheel-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    wheelActive = false;
    wheelCanvas = null;
    wheelCtx = null;
    wheelRotation = 0;
    isSpinning = false;
    wheelSections = [];
    
    // Сбрасываем кнопку
    const spinBtn = document.getElementById('spin-btn');
    const resultDiv = document.getElementById('wheel-result');
    
    // Переход на +1 шаг при закрытии крестиком
    continueWithoutPrize();
    
    spinBtn.disabled = false;
    spinBtn.textContent = '🎡 КРУТИТЬ КОЛЕСО';
    resultDiv.classList.add('hidden');
}

// Функция для сброса всех игроков на 1-ю позицию (для админа)
function resetAllPlayersToStart() {
    if (!currentUser || !currentUser.isAdmin) {
        showNotification('Только администратор может сбросить позиции игроков!', 'error');
        return;
    }
    
    // Получаем всех пользователей
    const allUsers = JSON.parse(localStorage.getItem('monopoly_users') || '[]');
    
    // Сбрасываем игровое состояние для каждого пользователя
    allUsers.forEach(user => {
        const resetState = {
            position: 1,
            moves: 30,
            points: 0,
            completed: false,
            completedGames: {},
            userId: user.id
        };
        
        localStorage.setItem(`monopoly_game_state_${user.id}`, JSON.stringify(resetState));
    });
    
    // Если текущий пользователь не админ, тоже сбрасываем его состояние
    if (!currentUser.isAdmin) {
        currentPosition = 1;
        movesLeft = 30;
        playerPoints = 0;
        gameCompleted = false;
        completedGames = {};
        saveGameState();
        
        // Обновляем интерфейс
        updateGameInfo();
        updatePlayerPosition();
        updatePointsDisplay();
        
        // Скрываем табличку завершения игры если она была
        const gameOverOverlay = document.getElementById('game-over-overlay');
        if (gameOverOverlay) {
            gameOverOverlay.classList.add('hidden');
        }
        
        // Восстанавливаем кнопку хода
        const moveBtn = document.querySelector('.move-btn');
        if (moveBtn) {
            moveBtn.innerHTML = `
                <span class="icon">🎯</span>
                Ход
            `;
            moveBtn.disabled = false;
            moveBtn.style.opacity = '1';
            moveBtn.style.cursor = 'pointer';
        }
    }
    
    // Обновляем лидерборд
    createLeaderboard();
    updatePlayerStatus();
    
    showNotification('🔄 Все игроки сброшены на стартовую позицию!', 'success');
}

// Функция для полного сброса всех игроков (только для админа)
function autoResetAllPlayers() {
    if (!currentUser || !currentUser.isAdmin) {
        showNotification('Только администратор может выполнить полный сброс!', 'error');
        return;
    }
    
    if (!confirm('⚠️ ВНИМАНИЕ! Это полностью сбросит всех игроков на стартовые позиции. Продолжить?')) {
        return;
    }
    
    // Получаем всех пользователей
    const allUsers = JSON.parse(localStorage.getItem('monopoly_users') || '[]');
    
    // Сбрасываем игровое состояние для каждого пользователя
    allUsers.forEach(user => {
        const resetState = {
            position: 1,
            moves: 30,
            points: 1000, // Даем 1000 очков
            completed: false,
            completedGames: {},
            userId: user.id
        };
        
        localStorage.setItem(`monopoly_game_state_${user.id}`, JSON.stringify(resetState));
    });
    
    // Если есть текущий пользователь, обновляем его состояние
    if (currentUser) {
        currentPosition = 1;
        movesLeft = 30;
        playerPoints = 1000;
        gameCompleted = false;
        completedGames = {};
        
        // Обновляем интерфейс
        updateGameInfo();
        updatePlayerPosition();
        updatePointsDisplay();
        
        // Скрываем табличку завершения игры если она была
        const gameOverOverlay = document.getElementById('game-over-overlay');
        if (gameOverOverlay) {
            gameOverOverlay.classList.add('hidden');
        }
        
        // Восстанавливаем кнопку хода
        const moveBtn = document.querySelector('.move-btn');
        if (moveBtn) {
            moveBtn.innerHTML = `
                <span class="icon">🎯</span>
                Ход
            `;
            moveBtn.disabled = false;
            moveBtn.style.opacity = '1';
            moveBtn.style.cursor = 'pointer';
        }
        
        saveGameState();
    }
    
    console.log('🔄 Автоматический сброс всех игроков выполнен');
}

// Заглушки для остальных мини-игр (будут реализованы позже)
// Тетрис (Клетка 10)
let tetrisActive = false;
let tetrisGame = null;

function showTetrisGame() {
    tetrisActive = true;
    const modal = document.getElementById('tetris-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideTetrisGame() {
    if (tetrisGame) {
        tetrisGame.stop();
    }
    tetrisActive = false;
    const modal = document.getElementById('tetris-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Сброс интерфейса
    document.getElementById('tetris-result').classList.add('hidden');
    document.querySelector('.start-tetris-btn').style.display = 'block';
    document.querySelector('.pause-tetris-btn').style.display = 'none';
    
    // Переход на +1 шаг при закрытии крестиком
    continueWithoutPrize();
}

function startTetris() {
    const canvas = document.getElementById('tetris-canvas');
    const nextCanvas = document.getElementById('tetris-next-canvas');
    
    if (!canvas || !nextCanvas) return;
    
    tetrisGame = new TetrisGame(canvas, nextCanvas);
    tetrisGame.start();
    
    document.querySelector('.start-tetris-btn').style.display = 'none';
    document.querySelector('.pause-tetris-btn').style.display = 'block';
}

function pauseTetris() {
    if (tetrisGame) {
        tetrisGame.pause();
    }
}

function continueAfterTetris() {
    hideTetrisGame();
}

// Крестики-нолики (Клетка 13)
let ticTacToeActive = false;
let ticTacToeBoard = Array(9).fill('');
let currentPlayer = 'X';
let gameEnded = false;

function showTicTacToeGame() {
    // Проверяем, была ли игра уже пройдена
    if (completedGames[13]) {
        showNotification('Эта игра уже пройдена! Можете только продолжить движение.', 'info');
        return;
    }
    
    ticTacToeActive = true;
    const modal = document.getElementById('tictactoe-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    initTicTacToe();
}

function hideTicTacToeGame() {
    ticTacToeActive = false;
    const modal = document.getElementById('tictactoe-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Сброс интерфейса
    document.getElementById('tictactoe-result').classList.add('hidden');
    
    // Переход на +1 шаг при закрытии крестиком
    continueWithoutPrize();
}

function initTicTacToe() {
    ticTacToeBoard = Array(9).fill('');
    currentPlayer = 'X';
    gameEnded = false;
    
    const board = document.getElementById('tictactoe-board');
    board.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('button');
        cell.className = 'tictactoe-cell';
        cell.onclick = () => makeTicTacToeMove(i);
        board.appendChild(cell);
    }
    
    updateGameStatus('Ваш ход (X)');
}

function makeTicTacToeMove(index) {
    if (ticTacToeBoard[index] !== '' || gameEnded || currentPlayer !== 'X') return;
    
    ticTacToeBoard[index] = 'X';
    updateBoard();
    
    if (checkWinner()) {
        endGame('Вы победили!');
        return;
    }
    
    if (ticTacToeBoard.every(cell => cell !== '')) {
        endGame('Ничья!');
        return;
    }
    
    currentPlayer = 'O';
    updateGameStatus('Ход компьютера (O)');
    
    setTimeout(() => {
        makeComputerMove();
    }, 500);
}

function makeComputerMove() {
    if (gameEnded) return;
    
    // Простая AI - случайный ход
    const emptyCells = ticTacToeBoard.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    
    if (emptyCells.length === 0) return;
    
    const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    ticTacToeBoard[randomIndex] = 'O';
    updateBoard();
    
    if (checkWinner()) {
        endGame('Компьютер победил!');
        return;
    }
    
    if (ticTacToeBoard.every(cell => cell !== '')) {
        endGame('Ничья!');
        return;
    }
    
    currentPlayer = 'X';
    updateGameStatus('Ваш ход (X)');
}

function updateBoard() {
    const cells = document.querySelectorAll('.tictactoe-cell');
    cells.forEach((cell, index) => {
        cell.textContent = ticTacToeBoard[index];
        cell.disabled = ticTacToeBoard[index] !== '';
    });
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // горизонтали
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // вертикали
        [0, 4, 8], [2, 4, 6] // диагонали
    ];
    
    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return ticTacToeBoard[a] && ticTacToeBoard[a] === ticTacToeBoard[b] && ticTacToeBoard[a] === ticTacToeBoard[c];
    });
}

function updateGameStatus(status) {
    document.getElementById('tictactoe-status').textContent = status;
}

function endGame(result) {
    gameEnded = true;
    const cells = document.querySelectorAll('.tictactoe-cell');
    cells.forEach(cell => cell.disabled = true);
    
    updateGameStatus(result);
    
    let earnedPoints = 0;
    if (result === 'Вы победили!') {
        earnedPoints = 50;
        addPoints(earnedPoints);
        showNotification(`Крестики-нолики пройдены! +${earnedPoints} очков`, 'success');
        
        // Отмечаем игру как завершенную
        completedGames[13] = true;
        saveGameState();
    } else {
        showNotification('Попробуйте еще раз!', 'info');
    }
    
    let message = '';
    let motivationalText = '';
    
    if (result === 'Вы победили!') {
        message = '✅ Победа';
        motivationalText = 'Игра завершена в вашу пользу. Очки начислены.';
    } else if (result === 'Ничья!') {
        message = '⚖️ Ничья';
        motivationalText = 'Игра завершена вничью. Равный результат.';
    } else {
        message = '❌ Поражение';
        motivationalText = 'Игра завершена не в вашу пользу. Попробуйте еще раз.';
    }
    
    // Показываем результат только при победе
    if (result === 'Вы победили!') {
        document.getElementById('tictactoe-result-text').innerHTML = `
            <div class="result-message">${message}</div>
            <div class="result-motivation">${motivationalText}</div>
        `;
        document.getElementById('tictactoe-result').classList.remove('hidden');
    } else {
        // При поражении или ничьей автоматически перезапускаем игру через 1.5 секунды
        setTimeout(() => {
            initTicTacToe();
        }, 1500);
    }
}

function restartTicTacToe() {
    document.getElementById('tictactoe-result').classList.add('hidden');
    initTicTacToe();
}

function continueAfterTicTacToe() {
    hideTicTacToeGame();
}

// Сапер (Клетка 16)
let minesweeperActive = false;
let minesweeperBoard = [];
let minesweeperGame = null;

function showMinesweeperGame() {
    minesweeperActive = true;
    const modal = document.getElementById('minesweeper-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Автоматически запускаем игру
    setTimeout(() => {
        startMinesweeper();
    }, 100);
}

function hideMinesweeperGame() {
    if (minesweeperGame) {
        minesweeperGame.stop();
    }
    minesweeperActive = false;
    const modal = document.getElementById('minesweeper-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Сброс интерфейса
    document.getElementById('minesweeper-result').classList.add('hidden');
    
    // Переход на +1 шаг при закрытии крестиком
    continueWithoutPrize();
}

function startMinesweeper() {
    minesweeperGame = new MinesweeperGame();
    minesweeperGame.init();
}

function continueAfterMinesweeper() {
    hideMinesweeperGame();
}

// Класс для игры Сапер
class MinesweeperGame {
    constructor() {
        this.BOARD_SIZE = 10;
        this.MINE_COUNT = 10;
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameEnded = false;
        this.startTime = null;
        this.timer = null;
    }
    
    init() {
        this.board = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(0));
        this.revealed = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(false));
        this.flagged = Array(this.BOARD_SIZE).fill().map(() => Array(this.BOARD_SIZE).fill(false));
        this.gameEnded = false;
        this.startTime = Date.now();
        
        this.placeMines();
        this.calculateNumbers();
        this.createBoard();
        this.startTimer();
        this.updateStats();
    }
    
    placeMines() {
        let minesPlaced = 0;
        while (minesPlaced < this.MINE_COUNT) {
            const row = Math.floor(Math.random() * this.BOARD_SIZE);
            const col = Math.floor(Math.random() * this.BOARD_SIZE);
            
            if (this.board[row][col] !== -1) {
                this.board[row][col] = -1; // -1 означает мину
                minesPlaced++;
            }
        }
    }
    
    calculateNumbers() {
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.board[row][col] !== -1) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (newRow >= 0 && newRow < this.BOARD_SIZE && 
                                newCol >= 0 && newCol < this.BOARD_SIZE &&
                                this.board[newRow][newCol] === -1) {
                                count++;
                            }
                        }
                    }
                    this.board[row][col] = count;
                }
            }
        }
    }
    
    createBoard() {
        const boardElement = document.getElementById('minesweeper-board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                const cell = document.createElement('div');
                cell.className = 'mine-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                cell.addEventListener('click', (e) => this.handleCellClick(e, row, col));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, row, col));
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    handleCellClick(e, row, col) {
        e.preventDefault();
        if (this.gameEnded || this.flagged[row][col] || this.revealed[row][col]) return;
        
        this.revealCell(row, col);
        this.updateDisplay();
        this.checkWin();
    }
    
    handleRightClick(e, row, col) {
        e.preventDefault();
        if (this.gameEnded || this.revealed[row][col]) return;
        
        this.flagged[row][col] = !this.flagged[row][col];
        this.updateDisplay();
        this.updateStats();
    }
    
    revealCell(row, col) {
        if (this.revealed[row][col] || this.flagged[row][col]) return;
        
        this.revealed[row][col] = true;
        
        if (this.board[row][col] === -1) {
            this.gameOver();
            return;
        }
        
        // Если клетка пустая, открываем соседние
        if (this.board[row][col] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < this.BOARD_SIZE && 
                        newCol >= 0 && newCol < this.BOARD_SIZE) {
                        this.revealCell(newRow, newCol);
                    }
                }
            }
        }
    }
    
    updateDisplay() {
        const cells = document.querySelectorAll('.mine-cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / this.BOARD_SIZE);
            const col = index % this.BOARD_SIZE;
            
            cell.className = 'mine-cell';
            
            if (this.flagged[row][col]) {
                cell.classList.add('flagged');
                cell.textContent = '🚩';
            } else if (this.revealed[row][col]) {
                cell.classList.add('revealed');
                if (this.board[row][col] === -1) {
                    cell.classList.add('mine');
                    cell.textContent = '💣';
                } else if (this.board[row][col] > 0) {
                    cell.textContent = this.board[row][col];
                    cell.style.color = this.getNumberColor(this.board[row][col]);
                } else {
                    cell.textContent = '';
                }
            } else {
                cell.textContent = '';
            }
        });
    }
    
    getNumberColor(num) {
        const colors = ['', '#0000ff', '#008000', '#ff0000', '#800080', '#800000', '#008080', '#000000', '#808080'];
        return colors[num] || '#000000';
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (!this.gameEnded) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                document.getElementById('timer').textContent = elapsed.toString().padStart(3, '0');
            }
        }, 1000);
    }
    
    updateStats() {
        const flagCount = this.flagged.flat().filter(f => f).length;
        document.getElementById('flags-count').textContent = flagCount;
        document.getElementById('mines-count').textContent = this.MINE_COUNT;
    }
    
    checkWin() {
        let revealedCount = 0;
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.revealed[row][col] && this.board[row][col] !== -1) {
                    revealedCount++;
                }
            }
        }
        
        if (revealedCount === this.BOARD_SIZE * this.BOARD_SIZE - this.MINE_COUNT) {
            this.gameWin();
        }
    }
    
    gameWin() {
        this.gameEnded = true;
        clearInterval(this.timer);
        
        const earnedPoints = 150;
        addPoints(earnedPoints);
        showNotification(`Сапер пройден! +${earnedPoints} очков`, 'success');
        
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        document.getElementById('minesweeper-result-text').innerHTML = `
            <h3>🎉 Поздравляем!</h3>
            <p>Вы успешно разминировали поле!</p>
            <p>Время: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
            <p class="points-earned">+${earnedPoints} очков</p>
        `;
        
        document.getElementById('minesweeper-result').classList.remove('hidden');
    }
    
    gameOver() {
        this.gameEnded = true;
        clearInterval(this.timer);
        
        // Показываем все мины
        for (let row = 0; row < this.BOARD_SIZE; row++) {
            for (let col = 0; col < this.BOARD_SIZE; col++) {
                if (this.board[row][col] === -1) {
                    this.revealed[row][col] = true;
                }
            }
        }
        
        this.updateDisplay();
        
        showNotification('Вы подорвались на мине! Попробуйте еще раз', 'error');
        
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        document.getElementById('minesweeper-result-text').innerHTML = `
            <h3>💥 Взрыв!</h3>
            <p>Вы подорвались на мине</p>
            <p>Время: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
            <p>Очки не начислены</p>
        `;
        
        document.getElementById('minesweeper-result').classList.remove('hidden');
    }
    
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}

// Кликер (Клетка 19)
let clickerActive = false;
let clickerGame = null;

function showClickerGame() {
    clickerActive = true;
    const modal = document.getElementById('clicker-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideClickerGame() {
    if (clickerGame) {
        clickerGame.stop();
    }
    clickerActive = false;
    const modal = document.getElementById('clicker-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Сброс интерфейса
    document.getElementById('clicker-result').classList.add('hidden');
    document.getElementById('click-target').disabled = true;
    document.querySelector('.start-clicker-btn').style.display = 'block';
    
    // Переход на +1 шаг при закрытии крестиком
    continueWithoutPrize();
}

function startClicker() {
    clickerGame = new ClickerGame();
    clickerGame.start();
    
    document.querySelector('.start-clicker-btn').style.display = 'none';
}

function makeClick() {
    if (clickerGame) {
        clickerGame.click();
    }
}

function continueAfterClicker() {
    hideClickerGame();
}

// Класс для игры Кликер
class ClickerGame {
    constructor() {
        this.clicks = 0;
        this.timeLeft = 10;
        this.gameRunning = false;
        this.timer = null;
    }
    
    start() {
        this.clicks = 0;
        this.timeLeft = 10;
        this.gameRunning = true;
        
        document.getElementById('clicker-clicks').textContent = this.clicks;
        document.getElementById('clicker-time').textContent = this.timeLeft;
        document.getElementById('click-target').disabled = false;
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('clicker-time').textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    click() {
        if (!this.gameRunning) return;
        
        this.clicks++;
        document.getElementById('clicker-clicks').textContent = this.clicks;
        
        // Анимация клика
        const target = document.getElementById('click-target');
        target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            target.style.transform = 'scale(1)';
        }, 100);
        
        // Проверка на максимум
        if (this.clicks >= 100) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameRunning = false;
        clearInterval(this.timer);
        
        document.getElementById('click-target').disabled = true;
        
        const earnedPoints = Math.min(this.clicks, 100);
        addPoints(earnedPoints);
        
        let message = '';
        if (this.clicks >= 100) {
            message = 'Невероятно! Вы достигли максимума!';
        } else if (this.clicks >= 50) {
            message = 'Отличный результат!';
        } else if (this.clicks >= 25) {
            message = 'Неплохо!';
        } else {
            message = 'Можно лучше!';
        }
        
        showNotification(`Кликер завершен! +${earnedPoints} очков`, 'success');
        
        let resultTitle = '';
        let motivationalText = '';
        
        if (this.clicks >= 80) {
            resultTitle = '🏆 Отличный результат';
            motivationalText = 'Невероятная скорость! Вы показали выдающиеся результаты.';
        } else if (this.clicks >= 50) {
            resultTitle = '🥈 Хороший результат';
            motivationalText = 'Хорошая работа! Ваша скорость клика впечатляет.';
        } else if (this.clicks >= 30) {
            resultTitle = '🥉 Неплохо';
            motivationalText = 'Неплохой результат! Есть куда стремиться.';
        } else {
            resultTitle = '⏰ Время вышло';
            motivationalText = 'Попробуйте еще раз! Тренировка поможет улучшить результат.';
        }
        
        document.getElementById('clicker-result-text').innerHTML = `
            <h3>⏰ Время вышло!</h3>
            <p>Кликов: ${this.clicks}</p>
            <p class="points-earned">+${earnedPoints} очков</p>
        `;
        
        document.getElementById('clicker-result').classList.remove('hidden');
        
        // Автоматический переход через 3 секунды
        setTimeout(() => {
            continueAfterClicker();
        }, 3000);
    }
    
    stop() {
        this.gameRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}

// Отскакивающий шар (Клетка 22)
let ballActive = false;
let ballGame = null;

function showBallGame() {
    ballActive = true;
    const modal = document.getElementById('ball-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideBallGame() {
    if (ballGame) {
        ballGame.stop();
    }
    ballActive = false;
    const modal = document.getElementById('ball-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Сброс интерфейса
    document.getElementById('ball-result').classList.add('hidden');
    document.querySelector('.start-ball-btn').style.display = 'block';
    
    // Переход на +1 шаг при закрытии крестиком
    continueWithoutPrize();
}

function startBallGame() {
    ballGame = new BallGameNew();
    ballGame.init();
    
    document.querySelector('.start-ball-btn').style.display = 'none';
}

function continueAfterBall() {
    hideBallGame();
}

// Класс для игры Отскакивающий шар
class BallGame {
    constructor() {
        this.BOARD_SIZE = 30;
        this.TARGET_COUNT = 5;
        this.items = ['🍎', '🍌', '🍇', '🍊', '🍓', '🥝', '🍑', '🍒', '🥭', '🍍'];
        this.board = [];
        this.targetItem = '';
        this.foundCount = 0;
        this.gameRunning = false;
        this.startTime = null;
        this.timer = null;
    }
    
    init() {
        this.foundCount = 0;
        this.gameRunning = true;
        this.startTime = Date.now();
        
        // Выбираем случайный предмет для поиска
        this.targetItem = this.items[Math.floor(Math.random() * this.items.length)];
        
        // Создаем доску
        this.createBoard();
        this.startTimer();
        this.updateStats();
        
        showNotification(`Найдите 5 предметов: ${this.targetItem}`, 'info');
    }
    
    createBoard() {
        const boardElement = document.getElementById('memory-board');
        boardElement.innerHTML = '';
        
        // Создаем массив предметов
        this.board = [];
        
        // Добавляем целевые предметы
        for (let i = 0; i < this.TARGET_COUNT; i++) {
            this.board.push(this.targetItem);
        }
        
        // Заполняем остальные случайными предметами
        while (this.board.length < this.BOARD_SIZE) {
            const randomItem = this.items[Math.floor(Math.random() * this.items.length)];
            this.board.push(randomItem);
        }
        
        // Перемешиваем
        for (let i = this.board.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.board[i], this.board[j]] = [this.board[j], this.board[i]];
        }
        
        // Создаем элементы
        this.board.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'memory-item';
            itemElement.textContent = item;
            itemElement.dataset.index = index;
            itemElement.onclick = () => this.handleItemClick(index, item);
            
            boardElement.appendChild(itemElement);
        });
    }
    
    handleItemClick(index, item) {
        if (!this.gameRunning) return;
        
        const itemElement = document.querySelector(`[data-index="${index}"]`);
        
        if (item === this.targetItem) {
            // Правильный предмет
            itemElement.classList.add('found');
            this.foundCount++;
            this.updateStats();
            
            if (this.foundCount >= this.TARGET_COUNT) {
                this.gameWin();
            }
        } else {
            // Неправильный предмет
            itemElement.classList.add('wrong');
            setTimeout(() => {
                itemElement.classList.remove('wrong');
            }, 500);
        }
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (this.gameRunning) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                document.getElementById('memory-timer').textContent = elapsed;
            }
        }, 1000);
    }
    
    updateStats() {
        document.getElementById('memory-found').textContent = this.foundCount;
    }
    
    gameWin() {
        this.gameRunning = false;
        clearInterval(this.timer);
        
        const earnedPoints = 100;
        addPoints(earnedPoints);
        showNotification(`Поиск предметов завершен! +${earnedPoints} очков`, 'success');
        
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        
        document.getElementById('memory-result-text').innerHTML = `
            <h3>🎉 Отлично!</h3>
            <p>Вы нашли все предметы ${this.targetItem}!</p>
            <p>Время: ${timeElapsed} секунд</p>
            <p class="points-earned">+${earnedPoints} очков</p>
        `;
        
        document.getElementById('memory-result').classList.remove('hidden');
    }
    
    stop() {
        this.gameRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}

// Новый класс для игры Отскакивающий шар
class BallGameNew {
    constructor() {
        this.TARGET_BOUNCES = 10;
        this.TIME_LIMIT = 60;
        
        this.bounces = 0;
        this.timeLeft = this.TIME_LIMIT;
        this.gameRunning = false;
        this.timer = null;
        
        this.canvas = null;
        this.ctx = null;
        
        // Игровые объекты
        this.ball = {
            x: 200,
            y: 150,
            radius: 10,
            dx: 3,
            dy: 3,
            color: '#ff6b6b'
        };
        
        this.paddle = {
            x: 175,
            y: 280,
            width: 50,
            height: 10,
            color: '#4ecdc4'
        };
        
        this.keys = {};
    }
    
    init() {
        this.canvas = document.getElementById('ball-canvas');
        if (!this.canvas) {
            console.error('Canvas не найден!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.bindEvents();
        this.start();
    }
    
    bindEvents() {
        // Управление мышью
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameRunning) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            this.paddle.x = mouseX - this.paddle.width / 2;
            
            // Ограничиваем платформу границами canvas
            if (this.paddle.x < 0) this.paddle.x = 0;
            if (this.paddle.x > this.canvas.width - this.paddle.width) {
                this.paddle.x = this.canvas.width - this.paddle.width;
            }
        });
        
        // Управление клавиатурой
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    
    start() {
        this.gameRunning = true;
        this.bounces = 0;
        this.timeLeft = this.TIME_LIMIT;
        
        this.updateStats();
        this.gameLoop();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateStats();
            
            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Управление платформой клавиатурой
        if (this.keys['ArrowLeft'] && this.paddle.x > 0) {
            this.paddle.x -= 5;
        }
        if (this.keys['ArrowRight'] && this.paddle.x < this.canvas.width - this.paddle.width) {
            this.paddle.x += 5;
        }
        
        // Движение шара
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
        
        // Отскок от стен
        if (this.ball.x <= this.ball.radius || this.ball.x >= this.canvas.width - this.ball.radius) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y <= this.ball.radius) {
            this.ball.dy = -this.ball.dy;
        }
        
        // Проверка столкновения с платформой
        if (this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.width &&
            this.ball.dy > 0) {
            
            this.ball.dy = -this.ball.dy;
            this.bounces++;
            this.updateStats();
            
            // Изменяем угол отскока в зависимости от места удара
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.dx = (hitPos - 0.5) * 6;
            
            if (this.bounces >= this.TARGET_BOUNCES) {
                this.gameWin();
            }
        }
        
        // Проверка падения шара
        if (this.ball.y > this.canvas.height) {
            this.gameOver();
        }
    }
    
    draw() {
        // Очистка canvas
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем шар
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.ball.color;
        this.ctx.fill();
        this.ctx.closePath();
        
        // Рисуем платформу
        this.ctx.fillStyle = this.paddle.color;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Рисуем счетчик отскоков
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`Отскоки: ${this.bounces}/${this.TARGET_BOUNCES}`, 10, 25);
        this.ctx.fillText(`Время: ${this.timeLeft}с`, 10, 45);
        
        // Подсказка управления
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Управление: мышь или стрелки ← →', 10, this.canvas.height - 10);
    }
    
    updateStats() {
        document.getElementById('ball-bounces').textContent = this.bounces;
        document.getElementById('ball-timer').textContent = this.timeLeft;
    }
    
    gameWin() {
        this.gameRunning = false;
        clearInterval(this.timer);
        
        addPoints(100);
        showNotification('Поздравляем! Вы сделали 10 отскоков и получили 100 очков!', 'success');
        
        document.getElementById('ball-result-text').textContent = 'Победа! +100 очков';
        
        // При победе оставляем кнопку "Продолжить"
        const continueBtn = document.querySelector('#ball-result .continue-btn');
        if (continueBtn) {
            continueBtn.textContent = 'Продолжить';
            continueBtn.onclick = function() {
                continueAfterBall();
            };
        }
        
        document.getElementById('ball-result').classList.remove('hidden');
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.timer);
        
        showNotification('Игра окончена! Попробуйте еще раз.', 'error');
        
        document.getElementById('ball-result-text').textContent = 'Игра окончена! Попробуйте снова.';
        
        // Меняем кнопку на "Начать заново" при проигрыше
        const continueBtn = document.querySelector('#ball-result .continue-btn');
        if (continueBtn) {
            continueBtn.textContent = 'Начать заново';
            continueBtn.onclick = function() {
                document.getElementById('ball-result').classList.add('hidden');
                startBallGame(); // Перезапускаем игру
            };
        }
        
        document.getElementById('ball-result').classList.remove('hidden');
    }
    
    stop() {
        this.gameRunning = false;
        if (this.timer) {
            clearInterval(this.timer);
        }
    }
}

// Мини-гонки (Клетка 25)
let racingActive = false;
let racingGame = null;

function showRacingGame() {
    racingActive = true;
    const modal = document.getElementById('racing-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideRacingGame() {
    if (racingGame) {
        racingGame.stop();
    }
    racingActive = false;
    const modal = document.getElementById('racing-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Сброс интерфейса
    document.getElementById('racing-result').classList.add('hidden');
    document.querySelector('.start-racing-btn').style.display = 'block';
    
    // Переход на +1 шаг при закрытии крестиком
    continueWithoutPrize();
}

function startRacing() {
    const canvas = document.getElementById('racing-canvas');
    if (!canvas) return;
    
    racingGame = new RacingGame(canvas);
    racingGame.start();
    
    document.querySelector('.start-racing-btn').style.display = 'none';
}

function continueAfterRacing() {
    hideRacingGame();
}

// Класс для мини-гонок
class RacingGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.gameRunning = false;
        this.startTime = null;
        this.finishTime = null;
        
        // Игрок
        this.player = {
            x: 50,
            y: this.height / 2,
            width: 30,
            height: 20,
            speed: 0,
            maxSpeed: 3,
            color: '#ff0000'
        };
        
        // Соперники
        this.opponents = [
            { x: 50, y: this.height / 2 - 60, width: 30, height: 20, speed: 1.5, color: '#0000ff' },
            { x: 50, y: this.height / 2 + 60, width: 30, height: 20, speed: 1.8, color: '#00ff00' }
        ];
        
        // Финишная линия
        this.finishLine = this.width - 50;
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.keys = {};
        
        this.keyDownHandler = (e) => {
            this.keys[e.code] = true;
        };
        
        this.keyUpHandler = (e) => {
            this.keys[e.code] = false;
        };
        
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }
    
    start() {
        this.gameRunning = true;
        this.startTime = Date.now();
        this.finishTime = null;
        
        // Сброс позиций
        this.player.x = 50;
        this.player.y = this.height / 2;
        this.player.speed = 0;
        
        this.opponents.forEach((opponent, index) => {
            opponent.x = 50;
            opponent.y = this.height / 2 + (index - 0.5) * 60;
        });
        
        this.update();
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.handleInput();
        this.updatePlayer();
        this.updateOpponents();
        this.checkFinish();
        this.draw();
        this.updateStats();
        
        requestAnimationFrame(() => this.update());
    }
    
    handleInput() {
        // Управление скоростью
        if (this.keys['ArrowUp']) {
            this.player.speed = Math.min(this.player.speed + 0.1, this.player.maxSpeed);
        } else if (this.keys['ArrowDown']) {
            this.player.speed = Math.max(this.player.speed - 0.1, 0);
        }
        
        // Управление поворотом
        if (this.keys['ArrowLeft']) {
            this.player.y = Math.max(this.player.y - 2, 10);
        }
        if (this.keys['ArrowRight']) {
            this.player.y = Math.min(this.player.y + 2, this.height - this.player.height - 10);
        }
    }
    
    updatePlayer() {
        this.player.x += this.player.speed;
    }
    
    updateOpponents() {
        this.opponents.forEach(opponent => {
            opponent.x += opponent.speed;
            
            // Простая AI - случайные движения
            if (Math.random() < 0.02) {
                opponent.y += (Math.random() - 0.5) * 4;
                opponent.y = Math.max(10, Math.min(this.height - opponent.height - 10, opponent.y));
            }
        });
    }
    
    checkFinish() {
        const playerFinished = this.player.x >= this.finishLine;
        const opponentsFinished = this.opponents.filter(o => o.x >= this.finishLine);
        
        if (playerFinished || opponentsFinished.length > 0) {
            this.gameRunning = false;
            this.finishTime = Date.now();
            
            let position = 1;
            opponentsFinished.forEach(opponent => {
                if (opponent.x > this.player.x) {
                    position++;
                }
            });
            
            this.endGame(position);
        }
    }
    
    draw() {
        // Очистка canvas
        this.ctx.fillStyle = '#2e7d32';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Трасса
        this.ctx.fillStyle = '#424242';
        this.ctx.fillRect(0, 50, this.width, this.height - 100);
        
        // Разметка трассы
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.height / 2);
        this.ctx.lineTo(this.width, this.height / 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Финишная линия
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(this.finishLine, 50, 3, this.height - 100);
        
        // Игрок
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Соперники
        this.opponents.forEach(opponent => {
            this.ctx.fillStyle = opponent.color;
            this.ctx.fillRect(opponent.x, opponent.y, opponent.width, opponent.height);
        });
    }
    
    updateStats() {
        if (this.startTime) {
            const elapsed = ((this.finishTime || Date.now()) - this.startTime) / 1000;
            document.getElementById('racing-time').textContent = elapsed.toFixed(1);
        }
        
        // Определяем текущую позицию
        let position = 1;
        this.opponents.forEach(opponent => {
            if (opponent.x > this.player.x) {
                position++;
            }
        });
        
        document.getElementById('racing-position').textContent = position;
    }
    
    endGame(finalPosition) {
        let earnedPoints = 0;
        let message = '';
        
        if (finalPosition === 1) {
            earnedPoints = 100;
            message = '🏆 Первое место';
            showNotification(`Гонка завершена. +${earnedPoints} очков`, 'success');
        } else if (finalPosition === 2) {
            earnedPoints = 50;
            message = '🥈 Второе место';
            showNotification(`Гонка завершена. +${earnedPoints} очков`, 'info');
        } else {
            message = '🥉 Третье место';
            showNotification('Гонка завершена.', 'info');
        }
        
        if (earnedPoints > 0) {
            addPoints(earnedPoints);
        }
        
        const raceTime = ((this.finishTime - this.startTime) / 1000).toFixed(1);
        
        let motivationalText = '';
        if (finalPosition === 1) {
            motivationalText = 'Гонка успешно завершена с лучшим результатом.';
        } else if (finalPosition === 2) {
            motivationalText = 'Гонка завершена с хорошим результатом.';
        } else {
            motivationalText = 'Гонка завершена. Результат зафиксирован.';
        }

        document.getElementById('racing-result-text').innerHTML = `
            <h3>${message}</h3>
            <p>Время: ${raceTime} сек</p>
            ${earnedPoints > 0 ? `<p class="points-earned">+${earnedPoints} очков</p>` : ''}
        `;
        
        document.getElementById('racing-result').classList.remove('hidden');
        
        // Автоматический переход через 3 секунды
        setTimeout(() => {
            continueAfterRacing();
        }, 3000);
    }
    
    stop() {
        this.gameRunning = false;
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
    }
}

// Функции сворачиваемых секций в админ панели
function toggleSection(sectionName) {
    const content = document.getElementById(`${sectionName}-content`);
    const toggle = document.getElementById(`${sectionName}-toggle`);
    
    if (content.classList.contains('collapsed')) {
        // Открываем секцию
        content.classList.remove('collapsed');
        toggle.classList.remove('rotated');
        toggle.textContent = '▼';
    } else {
        // Закрываем секцию
        content.classList.add('collapsed');
        toggle.classList.add('rotated');
        toggle.textContent = '▲';
    }
}

// Инициализация сворачиваемых секций (все закрыты по умолчанию)
function initializeCollapsibleSections() {
    const sections = ['applications', 'users', 'purchases'];
    sections.forEach(sectionName => {
        const content = document.getElementById(`${sectionName}-content`);
        const toggle = document.getElementById(`${sectionName}-toggle`);
        if (content && toggle) {
            content.classList.add('collapsed');
            toggle.classList.add('rotated');
            toggle.textContent = '▲';
        }
    });
}

// Функции админ панели для заявок на товары
function loadAdminData() {
    loadApplications();
    loadUsers();
    loadPurchaseRequests();
    loadTaskReviews();
    loadPlayersList();
    loadRewardHistory();
    
    // Инициализируем сворачиваемые секции при загрузке данных
    setTimeout(() => {
        initializeCollapsibleSections();
    }, 100);
}

// Функции для проверки заданий
function loadTaskReviews() {
    const taskReviewsList = document.getElementById('task-reviews-list');
    const submissions = JSON.parse(localStorage.getItem('monopoly_task_submissions') || '[]');
    const pendingSubmissions = submissions.filter(sub => sub.status === 'pending');
    
    // Обновляем счетчик
    const countElement = document.getElementById('task-reviews-count');
    if (countElement) {
        countElement.textContent = `(${pendingSubmissions.length})`;
    }
    
    if (!taskReviewsList) return;
    
    if (pendingSubmissions.length === 0) {
        taskReviewsList.innerHTML = '<div class="empty-state">Нет заданий на проверку</div>';
        return;
    }
    
    taskReviewsList.innerHTML = '';
    
    pendingSubmissions.forEach(submission => {
        const submissionElement = document.createElement('div');
        submissionElement.className = 'task-review-item';
        
        const submittedDate = new Date(submission.submittedAt).toLocaleString('ru-RU');
        
        submissionElement.innerHTML = `
            <div class="task-review-header">
                <div class="task-review-info">
                    <div class="user-info">
                        <strong>👤 ${submission.userNick}</strong>
                        <span class="user-vk">VK: ${submission.userVK}</span>
                    </div>
                    <div class="task-info">
                        <span class="task-number">📍 Задание ${submission.taskNumber}</span>
                        <span class="submit-date">📅 ${submittedDate}</span>
                    </div>
                </div>
            </div>
            
            <div class="task-description">
                <strong>Описание задания:</strong>
                <p>${submission.taskDescription}</p>
            </div>
            
            <div class="screenshots-section">
                <strong>Прикрепленные скриншоты (${submission.screenshots.length}):</strong>
                <div class="admin-screenshots-grid">
                    ${submission.screenshots.map(screenshot => `
                        <div class="admin-screenshot-item">
                            <img src="${screenshot.url}" alt="${screenshot.fileName}" onclick="openScreenshotModal('${screenshot.url}')">
                            <div class="screenshot-name">${screenshot.fileName}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="task-review-actions">
                <button class="approve-btn" onclick="approveTask('${submission.id}')">
                    ✅ Одобрить
                </button>
                <button class="reject-btn" onclick="rejectTask('${submission.id}')">
                    ❌ Отклонить
                </button>
            </div>
        `;
        
        taskReviewsList.appendChild(submissionElement);
    });
}

function approveTask(submissionId) {
    const submissions = JSON.parse(localStorage.getItem('monopoly_task_submissions') || '[]');
    const submission = submissions.find(s => s.id == submissionId);
    
    if (!submission) {
        showNotification('Задание не найдено', 'error');
        return;
    }
    
    // Обновляем статус задания
    submission.status = 'approved';
    submission.reviewedAt = new Date().toISOString();
    submission.reviewedBy = currentUser.nick;
    
    localStorage.setItem('monopoly_task_submissions', JSON.stringify(submissions));
    
    // Обновляем статус задания для пользователя
    const userTaskStatus = JSON.parse(localStorage.getItem(`monopoly_user_tasks_${submission.userId}`) || '{}');
    userTaskStatus[submission.taskNumber] = {
        status: 'approved',
        submissionId: submission.id,
        approvedAt: submission.reviewedAt
    };
    localStorage.setItem(`monopoly_user_tasks_${submission.userId}`, JSON.stringify(userTaskStatus));
    
    // Начисляем пользователю 1 ход
    const userGameState = JSON.parse(localStorage.getItem(`monopoly_game_state_${submission.userId}`) || '{}');
    userGameState.movesLeft = (userGameState.movesLeft || 0) + 1;
    localStorage.setItem(`monopoly_game_state_${submission.userId}`, JSON.stringify(userGameState));
    
    showNotification(`Задание одобрено! Игроку ${submission.userNick} начислен 1 ход.`, 'success');
    loadTaskReviews();
}

function rejectTask(submissionId) {
    const reason = prompt('Укажите причину отклонения задания:');
    if (!reason) return;
    
    const submissions = JSON.parse(localStorage.getItem('monopoly_task_submissions') || '[]');
    const submission = submissions.find(s => s.id == submissionId);
    
    if (!submission) {
        showNotification('Задание не найдено', 'error');
        return;
    }
    
    // Обновляем статус задания
    submission.status = 'rejected';
    submission.reviewedAt = new Date().toISOString();
    submission.reviewedBy = currentUser.nick;
    submission.reviewComment = reason;
    
    localStorage.setItem('monopoly_task_submissions', JSON.stringify(submissions));
    
    // Обновляем статус задания для пользователя
    const userTaskStatus = JSON.parse(localStorage.getItem(`monopoly_user_tasks_${submission.userId}`) || '{}');
    userTaskStatus[submission.taskNumber] = {
        status: 'rejected',
        submissionId: submission.id,
        rejectedAt: submission.reviewedAt,
        reason: reason
    };
    localStorage.setItem(`monopoly_user_tasks_${submission.userId}`, JSON.stringify(userTaskStatus));
    
    showNotification(`Задание отклонено. Причина: ${reason}`, 'info');
    loadTaskReviews();
}

function openScreenshotModal(imageUrl) {
    // Создаем модальное окно для просмотра скриншота
    const modal = document.createElement('div');
    modal.className = 'screenshot-modal';
    modal.innerHTML = `
        <div class="screenshot-modal-overlay" onclick="this.parentElement.remove()">
            <div class="screenshot-modal-content">
                <img src="${imageUrl}" alt="Screenshot">
                <button class="screenshot-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Функции для выдачи наград
function loadPlayersList() {
    // Перезагружаем пользователей из localStorage
    users = JSON.parse(localStorage.getItem('monopoly_users') || '[]');
    console.log('Загружено пользователей:', users.length);
    
    const playersList = document.getElementById('players-list');
    if (!playersList) {
        console.error('Элемент players-list не найден!');
        return;
    }
    
    playersList.innerHTML = '';
    
    users.forEach(user => {
        console.log('Добавляем игрока:', user.nick);
        const option = document.createElement('option');
        option.value = user.nick;
        playersList.appendChild(option);
    });
    
    console.log('Список игроков обновлен, всего опций:', playersList.children.length);
}

function giveMoves() {
    console.log('🎫 Функция giveMoves() вызвана');
    const nickname = document.getElementById('moves-nick').value.trim();
    const amount = parseInt(document.getElementById('moves-amount').value) || 1;
    
    console.log('Ник:', nickname, 'Количество:', amount);
    
    if (!nickname) {
        showNotification('Введите ник игрока', 'error');
        return;
    }
    
    if (amount < 1 || amount > 10) {
        showNotification('Количество билетов должно быть от 1 до 10', 'error');
        return;
    }
    
    // Перезагружаем пользователей из localStorage
    users = JSON.parse(localStorage.getItem('monopoly_users') || '[]');
    
    const user = users.find(u => u.nick.toLowerCase() === nickname.toLowerCase());
    if (!user) {
        showNotification('Игрок не найден', 'error');
        return;
    }
    
    // Загружаем состояние игры пользователя
    const gameStateKey = `monopoly_game_state_${user.id}`;
    let gameState = JSON.parse(localStorage.getItem(gameStateKey) || '{}');
    
    // Добавляем ходы
    gameState.moves = (gameState.moves || 30) + amount;
    
    // Сохраняем обновленное состояние
    localStorage.setItem(gameStateKey, JSON.stringify(gameState));
    
    // Записываем в историю
    addRewardHistory('moves', nickname, amount);
    
    // Очищаем форму
    document.getElementById('moves-nick').value = '';
    document.getElementById('moves-amount').value = '1';
    
    showNotification(`Выдано ${amount} билетов игроку ${nickname}`, 'success');
    loadRewardHistory();
}

function givePoints() {
    console.log('💰 Функция givePoints() вызвана');
    const nickname = document.getElementById('points-nick').value.trim();
    const amount = parseInt(document.getElementById('points-amount').value) || 100;
    
    console.log('Ник:', nickname, 'Количество:', amount);
    
    if (!nickname) {
        showNotification('Введите ник игрока', 'error');
        return;
    }
    
    if (amount < 1 || amount > 1000) {
        showNotification('Количество очков должно быть от 1 до 1000', 'error');
        return;
    }
    
    // Перезагружаем пользователей из localStorage
    users = JSON.parse(localStorage.getItem('monopoly_users') || '[]');
    
    const user = users.find(u => u.nick.toLowerCase() === nickname.toLowerCase());
    if (!user) {
        showNotification('Игрок не найден', 'error');
        return;
    }
    
    // Загружаем состояние игры пользователя
    const gameStateKey = `monopoly_game_state_${user.id}`;
    let gameState = JSON.parse(localStorage.getItem(gameStateKey) || '{}');
    
    // Добавляем очки
    gameState.points = (gameState.points || 0) + amount;
    
    // Сохраняем обновленное состояние
    localStorage.setItem(gameStateKey, JSON.stringify(gameState));
    
    // Записываем в историю
    addRewardHistory('points', nickname, amount);
    
    // Очищаем форму
    document.getElementById('points-nick').value = '';
    document.getElementById('points-amount').value = '100';
    
    showNotification(`Выдано ${amount} очков игроку ${nickname}`, 'success');
    loadRewardHistory();
}

function addRewardHistory(type, nickname, amount) {
    const history = JSON.parse(localStorage.getItem('monopoly_reward_history') || '[]');
    
    const record = {
        id: Date.now(),
        type: type, // 'moves' или 'points'
        nickname: nickname,
        amount: amount,
        timestamp: new Date().toISOString(),
        admin: currentUser ? currentUser.nick : 'Админ'
    };
    
    history.unshift(record); // Добавляем в начало массива
    
    // Ограничиваем историю 50 записями
    if (history.length > 50) {
        history.splice(50);
    }
    
    localStorage.setItem('monopoly_reward_history', JSON.stringify(history));
}

function loadRewardHistory() {
    const history = JSON.parse(localStorage.getItem('monopoly_reward_history') || '[]');
    const historyList = document.getElementById('history-list');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">История выдач пуста</div>';
        return;
    }
    
    historyList.innerHTML = history.map(record => {
        const date = new Date(record.timestamp);
        const formattedDate = date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
        
        const typeText = record.type === 'moves' ? 'Билеты' : 'Очки';
        const typeIcon = record.type === 'moves' ? '🎫' : '💰';
        
        return `
            <div class="history-item">
                <div class="history-action">${typeIcon} ${typeText}</div>
                <div>Игрок: <span class="history-target">${record.nickname}</span></div>
                <div>Количество: <span class="history-amount">+${record.amount}</span></div>
                <div>Админ: ${record.admin}</div>
                <div class="history-time">${formattedDate}</div>
            </div>
        `;
    }).join('');
}

function loadPurchaseRequests() {
    // Перезагружаем заявки на товары из localStorage для актуальных данных
    purchaseRequests = JSON.parse(localStorage.getItem('monopoly_purchase_requests') || '[]');
    
    const purchaseRequestsList = document.getElementById('purchase-requests-list');
    const pendingRequests = purchaseRequests.filter(req => req.status === PURCHASE_STATUS.PENDING);
    
    // Обновляем счетчик
    const countElement = document.getElementById('purchases-count');
    if (countElement) {
        countElement.textContent = `(${pendingRequests.length})`;
    }
    
    if (!purchaseRequestsList) return;
    
    if (pendingRequests.length === 0) {
        purchaseRequestsList.innerHTML = '<div class="no-data">Нет заявок на товары</div>';
        return;
    }
    
    purchaseRequestsList.innerHTML = pendingRequests.map(request => `
        <div class="purchase-request-item">
            <div class="purchase-request-header">
                <div class="purchase-request-info">
                    <h4>${request.itemName}</h4>
                    <p>${request.itemDescription}</p>
                </div>
                <div class="purchase-request-user">${request.userName}</div>
            </div>
            <div class="purchase-request-details">
                <div class="purchase-request-price">Цена: ${request.itemPrice} очков</div>
                <div class="purchase-request-date">Заявка от: ${new Date(request.createdAt).toLocaleString('ru-RU')}</div>
            </div>
            <div class="purchase-request-actions">
                <button class="approve-purchase-btn" onclick="approvePurchaseRequest(${request.id})">Выдать</button>
                <button class="reject-purchase-btn" onclick="rejectPurchaseRequest(${request.id})">Отклонить</button>
            </div>
        </div>
    `).join('');
}

function approvePurchaseRequest(requestId) {
    const request = purchaseRequests.find(req => req.id === requestId);
    if (!request) return;
    
    request.status = PURCHASE_STATUS.APPROVED;
    request.approvedAt = new Date().toISOString();
    localStorage.setItem('monopoly_purchase_requests', JSON.stringify(purchaseRequests));
    
    showNotification(`Заявка на "${request.itemName}" для игрока ${request.userName} одобрена!`, 'success');
    loadPurchaseRequests();
}

function rejectPurchaseRequest(requestId) {
    const request = purchaseRequests.find(req => req.id === requestId);
    if (!request) return;
    
    request.status = PURCHASE_STATUS.REJECTED;
    request.rejectedAt = new Date().toISOString();
    
    // Возвращаем очки игроку
    const user = users.find(u => u.id === request.userId);
    if (user) {
        user.points = (user.points || 0) + request.itemPrice;
        localStorage.setItem('monopoly_users', JSON.stringify(users));
        
        // Если это текущий пользователь, обновляем его очки
        if (currentUser && currentUser.id === user.id) {
            playerPoints = user.points;
            currentUser.points = user.points;
            updatePointsDisplay();
            localStorage.setItem('monopoly_current_user', JSON.stringify(currentUser));
        }
    }
    
    localStorage.setItem('monopoly_purchase_requests', JSON.stringify(purchaseRequests));
    
    showNotification(`Заявка на "${request.itemName}" для игрока ${request.userName} отклонена. Очки возвращены.`, 'warning');
    loadPurchaseRequests();
}

// Функции редактора заданий
function getDefaultTasks() {
    const defaultTasks = {};
    const prizeNumbers = [4, 7, 10, 13, 16, 19, 22, 25];
    
    for (let i = 1; i <= totalCells; i++) {
        if (prizeNumbers.includes(i)) {
            defaultTasks[i] = `Призовая клетка ${i}! Здесь вас ждет мини-игра со стаканчиками. Выберите один из трех стаканчиков и получите приз!`;
        } else {
            defaultTasks[i] = `Задание для клетки ${i}. Здесь будет ваше задание...`;
        }
    }
    
    return defaultTasks;
}

function initializeTasks() {
    if (Object.keys(cellTasks).length === 0) {
        cellTasks = getDefaultTasks();
        localStorage.setItem('monopoly_cell_tasks', JSON.stringify(cellTasks));
    }
}

function showTaskEditor() {
    // Инициализируем задания если их нет
    initializeTasks();
    
    document.getElementById('task-editor-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadTasksInEditor();
}

function hideTaskEditor() {
    document.getElementById('task-editor-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function loadTasksInEditor() {
    const tasksGrid = document.getElementById('tasks-grid');
    const prizeNumbers = [4, 7, 10, 13, 16, 19, 22, 25];
    
    tasksGrid.innerHTML = '';
    
    for (let i = 1; i <= totalCells; i++) {
        const isPrize = prizeNumbers.includes(i);
        const isSuper = i === 28;
        const taskText = cellTasks[i] || `Задание для клетки ${i}`;
        
        const taskItem = document.createElement('div');
        taskItem.className = `task-item ${isSuper ? 'super-prize-cell' : isPrize ? 'prize-cell' : ''}`;
        
        let cellType = 'Обычная клетка';
        if (isSuper) {
            cellType = 'Супер приз';
        } else if (isPrize) {
            cellType = 'Призовая клетка';
        }
        
        taskItem.innerHTML = `
            <div class="task-header">
                <div class="task-cell-number ${isSuper ? 'super-prize' : isPrize ? 'prize' : ''}">
                    Клетка ${i}
                </div>
                <div class="task-type">
                    ${cellType}
                </div>
            </div>
            <textarea 
                class="task-textarea" 
                id="task-${i}" 
                placeholder="Введите задание для клетки ${i}..."
                ${isPrize || isSuper ? 'readonly' : ''}
            >${isSuper ? 'Супер приз: Викторина + Игра Змейка (автоматическое задание)' : taskText}</textarea>
        `;
        
        tasksGrid.appendChild(taskItem);
    }
}

function saveAllTasks() {
    const updatedTasks = {};
    const prizeNumbers = [4, 7, 10, 13, 16, 19, 22, 25];
    
    for (let i = 1; i <= totalCells; i++) {
        const textarea = document.getElementById(`task-${i}`);
        if (textarea) {
            // Для призовых клеток сохраняем дефолтный текст
            if (prizeNumbers.includes(i)) {
                updatedTasks[i] = `Призовая клетка ${i}! Здесь вас ждет мини-игра со стаканчиками. Выберите один из трех стаканчиков и получите приз!`;
            } else {
                updatedTasks[i] = textarea.value.trim() || `Задание для клетки ${i}`;
            }
        }
    }
    
    cellTasks = updatedTasks;
    localStorage.setItem('monopoly_cell_tasks', JSON.stringify(cellTasks));
    
    showNotification('Все задания успешно сохранены!', 'success');
    
    // Обновляем текущее задание если оно отображается
    updateTaskModal();
}

function resetAllTasks() {
    if (confirm('Вы уверены, что хотите сбросить все задания к значениям по умолчанию? Это действие нельзя отменить.')) {
        cellTasks = getDefaultTasks();
        localStorage.setItem('monopoly_cell_tasks', JSON.stringify(cellTasks));
        
        loadTasksInEditor();
        showNotification('Все задания сброшены к значениям по умолчанию', 'info');
        
        // Обновляем текущее задание если оно отображается
        updateTaskModal();
    }
}

// Обновляем функцию показа задания для использования сохраненных заданий
function updateTaskModal() {
    // Инициализируем задания если их нет
    initializeTasks();
    
    // Обновляем номера клеток в заголовках
    document.getElementById('task-cell-number').textContent = currentPosition;
    document.getElementById('task-cell-number-text').textContent = currentPosition;
    
    const taskText = cellTasks[currentPosition] || `Задание для клетки ${currentPosition}`;
    const taskModalBody = document.querySelector('#task-modal .task-text p');
    if (taskModalBody) {
        taskModalBody.textContent = taskText;
    }
}

// Создание админа по умолчанию
function createDefaultAdmin() {
    if (!users.find(u => u.isAdmin)) {
        const admin = {
            id: 1,
            nick: 'admin',
            vk: 'https://vk.com/admin',
            password: 'admin123',
            isAdmin: true,
            registeredAt: new Date().toISOString()
        };
        users.push(admin);
        localStorage.setItem('monopoly_users', JSON.stringify(users));
    }
}

// Настройка обработчиков Enter для форм авторизации
function setupAuthKeyHandlers() {
    // Форма входа
    const loginInputs = ['login-nick', 'login-password'];
    loginInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    loginUser();
                }
            });
        }
    });
    
    // Форма регистрации
    const registerInputs = ['reg-nick', 'reg-vk', 'reg-password', 'reg-password-confirm'];
    registerInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    registerUser();
                }
            });
        }
    });
    
    console.log('✅ Обработчики Enter для авторизации настроены');
}

// Функции экспорта/импорта данных
function exportAllData() {
    try {
        // Собираем все данные из localStorage
        const allData = {
            users: JSON.parse(localStorage.getItem('monopoly_users') || '[]'),
            applications: JSON.parse(localStorage.getItem('monopoly_applications') || '[]'),
            purchaseRequests: JSON.parse(localStorage.getItem('monopoly_purchase_requests') || '[]'),
            taskSubmissions: JSON.parse(localStorage.getItem('monopoly_task_submissions') || '[]'),
            rewardHistory: JSON.parse(localStorage.getItem('monopoly_reward_history') || '[]'),
            leaderboard: JSON.parse(localStorage.getItem('monopoly_leaderboard') || '[]'),
            cellTasks: JSON.parse(localStorage.getItem('monopoly_cell_tasks') || '{}'),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        // Добавляем состояния игр всех пользователей
        const gameStates = {};
        allData.users.forEach(user => {
            const gameStateKey = `monopoly_game_state_${user.id}`;
            const gameState = localStorage.getItem(gameStateKey);
            if (gameState) {
                gameStates[user.id] = JSON.parse(gameState);
            }
            
            // Также добавляем статусы заданий
            const taskStatusKey = `monopoly_user_tasks_${user.id}`;
            const taskStatus = localStorage.getItem(taskStatusKey);
            if (taskStatus) {
                gameStates[`tasks_${user.id}`] = JSON.parse(taskStatus);
            }
        });
        
        allData.gameStates = gameStates;
        
        // Создаем и скачиваем файл
        const dataStr = JSON.stringify(allData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `monopoly_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Данные успешно экспортированы!', 'success');
        console.log('✅ Данные экспортированы:', allData);
        
    } catch (error) {
        console.error('Ошибка экспорта:', error);
        showNotification('Ошибка при экспорте данных!', 'error');
    }
}

function importAllData() {
    const fileInput = document.getElementById('import-file-input');
    if (fileInput) {
        fileInput.click();
    }
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json') {
        showNotification('Пожалуйста, выберите JSON файл!', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Проверяем структуру данных
            if (!importedData.version || !importedData.users) {
                showNotification('Неверный формат файла данных!', 'error');
                return;
            }
            
            // Подтверждение импорта
            if (!confirm('Внимание! Импорт данных заменит все текущие данные. Продолжить?')) {
                return;
            }
            
            // Импортируем основные данные
            if (importedData.users) {
                localStorage.setItem('monopoly_users', JSON.stringify(importedData.users));
                users = importedData.users;
            }
            
            if (importedData.applications) {
                localStorage.setItem('monopoly_applications', JSON.stringify(importedData.applications));
                applications = importedData.applications;
            }
            
            if (importedData.purchaseRequests) {
                localStorage.setItem('monopoly_purchase_requests', JSON.stringify(importedData.purchaseRequests));
                purchaseRequests = importedData.purchaseRequests;
            }
            
            if (importedData.taskSubmissions) {
                localStorage.setItem('monopoly_task_submissions', JSON.stringify(importedData.taskSubmissions));
            }
            
            if (importedData.rewardHistory) {
                localStorage.setItem('monopoly_reward_history', JSON.stringify(importedData.rewardHistory));
            }
            
            if (importedData.leaderboard) {
                localStorage.setItem('monopoly_leaderboard', JSON.stringify(importedData.leaderboard));
            }
            
            if (importedData.cellTasks) {
                localStorage.setItem('monopoly_cell_tasks', JSON.stringify(importedData.cellTasks));
                cellTasks = importedData.cellTasks;
            }
            
            // Импортируем состояния игр
            if (importedData.gameStates) {
                Object.keys(importedData.gameStates).forEach(key => {
                    if (key.startsWith('tasks_')) {
                        // Статусы заданий
                        const userId = key.replace('tasks_', '');
                        localStorage.setItem(`monopoly_user_tasks_${userId}`, JSON.stringify(importedData.gameStates[key]));
                    } else {
                        // Состояния игр
                        localStorage.setItem(`monopoly_game_state_${key}`, JSON.stringify(importedData.gameStates[key]));
                    }
                });
            }
            
            // Обновляем интерфейс
            if (typeof loadAdminData === 'function') {
                loadAdminData();
            }
            
            showNotification(`Данные успешно импортированы! (от ${new Date(importedData.exportDate).toLocaleDateString()})`, 'success');
            console.log('✅ Данные импортированы:', importedData);
            
        } catch (error) {
            console.error('Ошибка импорта:', error);
            showNotification('Ошибка при чтении файла данных!', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Очищаем input для повторного использования
    event.target.value = '';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Скрываем экран загрузки через 1 секунду
    setTimeout(() => {
        hideLoadingScreen();
    }, 1000);
    
    // Создаем админа по умолчанию
    createDefaultAdmin();
    
    // Инициализируем задания
    initializeTasks();
    
    // Добавляем обработчики Enter для форм авторизации
    setupAuthKeyHandlers();
    
    // Запускаем автоматическое обновление лидерборда
    startLeaderboardAutoUpdate();
    
    // Кнопка "Ход" готова к работе
    
    // Настраиваем кнопку задания
    setTimeout(() => {
        setupTaskButton();
    }, 1100); // После загрузки экрана
    
    // Проверяем, авторизован ли пользователь
    const savedUser = localStorage.getItem('monopoly_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        
        // Загружаем сохраненное игровое состояние
        loadGameState();
        
        showMonopolyGame();
        initializeGame();
        createLeaderboard();
        updatePointsDisplay();
        updateTaskNumber();
        updatePlayerStatus();
    } else {
        showAuthPage();
    }
});

// Класс для игры Тетрис
class TetrisGame {
    constructor(canvas, nextCanvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextCanvas = nextCanvas;
        this.nextCtx = nextCanvas.getContext('2d');
        
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.CELL_SIZE = 30;
        
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropTime = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.gameRunning = false;
        this.paused = false;
        
        this.currentPiece = null;
        this.nextPiece = null;
        
        this.pieces = [
            { shape: [[1,1,1,1]], color: '#00f0f0' }, // I
            { shape: [[1,1],[1,1]], color: '#f0f000' }, // O
            { shape: [[0,1,0],[1,1,1]], color: '#a000f0' }, // T
            { shape: [[0,1,1],[1,1,0]], color: '#00f000' }, // S
            { shape: [[1,1,0],[0,1,1]], color: '#f00000' }, // Z
            { shape: [[1,0,0],[1,1,1]], color: '#f0a000' }, // L
            { shape: [[0,0,1],[1,1,1]], color: '#0000f0' }  // J
        ];
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.keyHandler = (e) => {
            if (!this.gameRunning || this.paused) return;
            
            switch(e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.rotatePiece();
                    break;
                case 'Space':
                    e.preventDefault();
                    this.hardDrop();
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keyHandler);
    }
    
    start() {
        this.gameRunning = true;
        this.paused = false;
        this.generatePiece();
        this.generatePiece();
        this.update();
    }
    
    pause() {
        this.paused = !this.paused;
        const btn = document.querySelector('.pause-tetris-btn');
        btn.textContent = this.paused ? '▶️ Продолжить' : '⏸️ Пауза';
        if (!this.paused) {
            this.update();
        }
    }
    
    stop() {
        this.gameRunning = false;
        document.removeEventListener('keydown', this.keyHandler);
    }
    
    generatePiece() {
        if (!this.nextPiece) {
            this.nextPiece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        }
        
        this.currentPiece = {
            ...this.nextPiece,
            x: Math.floor(this.BOARD_WIDTH / 2) - 1,
            y: 0
        };
        
        this.nextPiece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        this.drawNextPiece();
        
        // Проверка на game over
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.gameOver();
        }
    }
    
    update(time = 0) {
        if (!this.gameRunning || this.paused) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropTime += deltaTime;
        
        if (this.dropTime > this.dropInterval) {
            this.movePiece(0, 1);
            this.dropTime = 0;
        }
        
        this.draw();
        this.updateStats();
        
        requestAnimationFrame((time) => this.update(time));
    }
    
    movePiece(dx, dy) {
        if (this.checkCollision(this.currentPiece, dx, dy)) {
            if (dy > 0) {
                this.placePiece();
                this.clearLines();
                this.generatePiece();
            }
            return false;
        }
        
        this.currentPiece.x += dx;
        this.currentPiece.y += dy;
        return true;
    }
    
    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    hardDrop() {
        while (this.movePiece(0, 1)) {}
    }
    
    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        // Создаем новую матрицу с поменянными размерами
        const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
        
        // Поворачиваем матрицу на 90 градусов по часовой стрелке
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                rotated[j][rows - 1 - i] = matrix[i][j];
            }
        }
        
        return rotated;
    }
    
    checkCollision(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const boardX = newX + x;
                    const boardY = newY + y;
                    
                    if (boardX < 0 || boardX >= this.BOARD_WIDTH || 
                        boardY >= this.BOARD_HEIGHT || 
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.currentPiece.x + x;
                    const boardY = this.currentPiece.y + y;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Проверяем ту же строку снова
            }
        }
        
        if (linesCleared > 0) {
            this.lines += linesCleared;
            // Каждая линия дает 25 очков
            this.score += linesCleared * 25;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            
            // Проверка на максимум очков (100 очков = 4 линии)
            if (this.score >= 100) {
                this.gameWin();
            }
        }
    }
    
    draw() {
        // Очистка canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Рисуем доску
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.ctx.fillStyle = this.board[y][x];
                    this.ctx.fillRect(x * this.CELL_SIZE, y * this.CELL_SIZE, 
                                    this.CELL_SIZE - 1, this.CELL_SIZE - 1);
                }
            }
        }
        
        // Рисуем текущую фигуру
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        const drawX = (this.currentPiece.x + x) * this.CELL_SIZE;
                        const drawY = (this.currentPiece.y + y) * this.CELL_SIZE;
                        this.ctx.fillRect(drawX, drawY, this.CELL_SIZE - 1, this.CELL_SIZE - 1);
                    }
                }
            }
        }
    }
    
    drawNextPiece() {
        this.nextCtx.fillStyle = '#000';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.nextPiece) {
            this.nextCtx.fillStyle = this.nextPiece.color;
            const offsetX = (this.nextCanvas.width - this.nextPiece.shape[0].length * 20) / 2;
            const offsetY = (this.nextCanvas.height - this.nextPiece.shape.length * 20) / 2;
            
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.nextCtx.fillRect(offsetX + x * 20, offsetY + y * 20, 19, 19);
                    }
                }
            }
        }
    }
    
    updateStats() {
        document.getElementById('tetris-score').textContent = this.score;
        document.getElementById('tetris-lines').textContent = this.lines;
        document.getElementById('tetris-level').textContent = this.level;
    }
    
    gameWin() {
        this.gameRunning = false;
        const earnedPoints = Math.min(this.score, 100);
        
        document.getElementById('tetris-result-text').innerHTML = `
            <h3>🎉 Поздравляем!</h3>
            <p>Вы набрали ${this.score} очков!</p>
            <p class="points-earned">+${earnedPoints} очков</p>
        `;
        
        document.getElementById('tetris-result').classList.remove('hidden');
        
        addPoints(earnedPoints);
        showNotification(`Тетрис пройден! +${earnedPoints} очков`, 'success');
    }
    
    gameOver() {
        this.gameRunning = false;
        const earnedPoints = Math.min(this.score, 100);
        
        document.getElementById('tetris-result-text').innerHTML = `
            <h3>💔 Игра окончена</h3>
            <p>Вы набрали ${this.score} очков</p>
            <p class="points-earned">+${earnedPoints} очков</p>
        `;
        
        document.getElementById('tetris-result').classList.remove('hidden');
        
        addPoints(earnedPoints);
        showNotification(`Игра окончена! +${earnedPoints} очков`, 'info');
    }
}
