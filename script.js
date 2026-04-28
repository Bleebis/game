// Получаем элементы DOM
const ball = document.getElementById('ball');
const obstacle = document.getElementById('obstacle');
const gameArea = document.getElementById('gameArea');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startBtn');

// Переменные игры
let isJumping = false;
let isGameRunning = false;
let score = 0;
let obstacleInterval;
let checkCollisionInterval;

// Функция прыжка
function jump() {
    if (isJumping || !isGameRunning) return;
    
    isJumping = true;
    ball.classList.add('jumping');
    
    // Удаляем класс после завершения анимации
    setTimeout(() => {
        ball.classList.remove('jumping');
        isJumping = false;
    }, 600);
}

// Запуск препятствия
function startObstacle() {
    obstacle.classList.add('moving');
}

// Остановка препятствия
function stopObstacle() {
    obstacle.classList.remove('moving');
}

// Проверка столкновений
function checkCollision() {
    if (!isGameRunning) return;
    
    const ballRect = ball.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();
    
    // Проверяем пересечение прямоугольников
    if (
        ballRect.right > obstacleRect.left + 10 &&
        ballRect.left < obstacleRect.right - 10 &&
        ballRect.bottom > obstacleRect.top + 10
    ) {
        gameOver();
    }
}

// Увеличение счёта
function increaseScore() {
    if (!isGameRunning) return;
    
    score++;
    scoreDisplay.textContent = score;
}

// Конец игры
function gameOver() {
    isGameRunning = false;
    stopObstacle();
    clearInterval(obstacleInterval);
    clearInterval(checkCollisionInterval);
    
    alert(`Игра окончена! Ваш счёт: ${score}`);
    startBtn.textContent = 'Начать заново';
}

// Старт игры
function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    score = 0;
    scoreDisplay.textContent = score;
    startBtn.textContent = 'Игра идёт...';
    
    startObstacle();
    
    // Запускаем проверку столкновений
    checkCollisionInterval = setInterval(checkCollision, 10);
    
    // Увеличиваем счёт каждые 2 секунды (когда препятствие проходит круг)
    obstacleInterval = setInterval(increaseScore, 2000);
}

// Обработчики событий
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Предотвращаем прокрутку страницы
        if (!isGameRunning && startBtn.textContent !== 'Игра идёт...') {
            startGame();
        } else {
            jump();
        }
    }
});

gameArea.addEventListener('click', () => {
    if (!isGameRunning && startBtn.textContent !== 'Игра идёт...') {
        startGame();
    } else {
        jump();
    }
});

startBtn.addEventListener('click', () => {
    if (!isGameRunning) {
        startGame();
    }
});

// Начальное состояние
startBtn.textContent = 'Начать игру';
