// Конфигурация игры
const COLS = 20;
const ROWS = 16;
const TILE_TYPES = {
    FLOOR: '.',
    WALL: '#',
    PLAYER: '@',
    ENEMY: 'E',
    STAIRS: '>',
    ITEM: '?'
};

const ENEMIES = [
    { name: 'Крыса', symbol: 'r', hp: 15, attack: 3, defense: 0, xp: 10 },
    { name: 'Гоблин', symbol: 'g', hp: 25, attack: 5, defense: 1, xp: 20 },
    { name: 'Скелет', symbol: 's', hp: 35, attack: 7, defense: 2, xp: 30 },
    { name: 'Орк', symbol: 'o', hp: 50, attack: 10, defense: 3, xp: 50 },
    { name: 'Тролль', symbol: 'T', hp: 80, attack: 15, defense: 5, xp: 100 }
];

const ITEMS = [
    { name: 'Зелье лечения', symbol: '!', effect: 'heal', value: 20 },
    { name: 'Меч +1', symbol: '/', effect: 'attack', value: 2 },
    { name: 'Щит +1', symbol: '[', effect: 'defense', value: 1 },
    { name: 'Свиток опыта', symbol: '?', effect: 'xp', value: 25 }
];

// Переменные игры
let map = [];
let player = null;
let enemies = [];
let items = [];
let stairs = null;
let isGameRunning = false;
let floor = 1;
let messageLog = [];

// DOM элементы
const gameArea = document.getElementById('gameArea');
const startBtn = document.getElementById('startBtn');
const hpEl = document.getElementById('hp');
const maxHpEl = document.getElementById('maxHp');
const attackEl = document.getElementById('attack');
const defenseEl = document.getElementById('defense');
const levelEl = document.getElementById('level');
const xpEl = document.getElementById('xp');
const nextLevelEl = document.getElementById('nextLevel');
const floorEl = document.getElementById('floor');
const messageLogEl = document.getElementById('messageLog');

// Класс игрока
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 100;
        this.maxHp = 100;
        this.attack = 10;
        this.defense = 5;
        this.level = 1;
        this.xp = 0;
        this.nextLevelXp = 50;
    }

    gainXp(amount) {
        this.xp += amount;
        while (this.xp >= this.nextLevelXp) {
            this.xp -= this.nextLevelXp;
            this.levelUp();
        }
        updateStats();
    }

    levelUp() {
        this.level++;
        this.maxHp += 10;
        this.hp = this.maxHp;
        this.attack += 2;
        this.defense += 1;
        this.nextLevelXp = Math.floor(this.nextLevelXp * 1.5);
        addMessage(`🎉 Уровень повышен! Теперь вы ${this.level} уровня!`, '#00ff00');
    }

    takeDamage(amount) {
        const actualDamage = Math.max(1, amount - this.defense);
        this.hp -= actualDamage;
        addMessage(`💥 Вы получили ${actualDamage} урона!`, '#ff4444');
        if (this.hp <= 0) {
            gameOver();
        }
        updateStats();
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        updateStats();
    }
}

// Генерация карты с использованием клеточного автомата
function generateMap() {
    // Инициализация случайными стенами и полом
    map = [];
    for (let y = 0; y < ROWS; y++) {
        map[y] = [];
        for (let x = 0; x < COLS; x++) {
            // Границы - всегда стены
            if (x === 0 || x === COLS - 1 || y === 0 || y === ROWS - 1) {
                map[y][x] = TILE_TYPES.WALL;
            } else {
                // 40% шанс стены
                map[y][x] = Math.random() < 0.4 ? TILE_TYPES.WALL : TILE_TYPES.FLOOR;
            }
        }
    }

    // Применяем клеточный автомат несколько раз для сглаживания
    for (let i = 0; i < 4; i++) {
        map = smoothMap();
    }

    // Находим свободное место для игрока
    let placed = false;
    while (!placed) {
        const x = Math.floor(Math.random() * (COLS - 2)) + 1;
        const y = Math.floor(Math.random() * (ROWS - 2)) + 1;
        if (map[y][x] === TILE_TYPES.FLOOR) {
            // Проверяем, что вокруг достаточно места
            let floorCount = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (map[y + dy] && map[y + dy][x + dx] === TILE_TYPES.FLOOR) {
                        floorCount++;
                    }
                }
            }
            if (floorCount >= 5) {
                player.x = x;
                player.y = y;
                placed = true;
            }
        }
    }

    // Размещаем лестницу вдали от игрока
    let stairsPlaced = false;
    while (!stairsPlaced) {
        const x = Math.floor(Math.random() * (COLS - 2)) + 1;
        const y = Math.floor(Math.random() * (ROWS - 2)) + 1;
        if (map[y][x] === TILE_TYPES.FLOOR) {
            const distToPlayer = Math.abs(x - player.x) + Math.abs(y - player.y);
            if (distToPlayer > 8) {
                stairs = { x, y };
                stairsPlaced = true;
            }
        }
    }

    // Размещаем врагов
    enemies = [];
    const enemyCount = 3 + floor;
    for (let i = 0; i < enemyCount; i++) {
        placeEntity(() => {
            const enemyType = ENEMIES[Math.min(Math.floor(Math.random() * (floor + 1)), ENEMIES.length - 1)];
            return {
                ...enemyType,
                x: 0,
                y: 0,
                maxHp: enemyType.hp
            };
        }, enemies);
    }

    // Размещаем предметы
    items = [];
    const itemCount = 2 + Math.floor(floor / 2);
    for (let i = 0; i < itemCount; i++) {
        placeEntity(() => {
            const itemType = ITEMS[Math.floor(Math.random() * ITEMS.length)];
            return {
                ...itemType,
                x: 0,
                y: 0
            };
        }, items);
    }
}

function smoothMap() {
    const newMap = JSON.parse(JSON.stringify(map));
    for (let y = 1; y < ROWS - 1; y++) {
        for (let x = 1; x < COLS - 1; x++) {
            let wallCount = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (map[y + dy][x + dx] === TILE_TYPES.WALL) {
                        wallCount++;
                    }
                }
            }
            if (wallCount > 4) {
                newMap[y][x] = TILE_TYPES.WALL;
            } else if (wallCount < 4) {
                newMap[y][x] = TILE_TYPES.FLOOR;
            }
        }
    }
    return newMap;
}

function placeEntity(createFn, collection) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
        const x = Math.floor(Math.random() * (COLS - 2)) + 1;
        const y = Math.floor(Math.random() * (ROWS - 2)) + 1;
        if (map[y][x] === TILE_TYPES.FLOOR) {
            // Не размещать слишком близко к игроку
            const distToPlayer = Math.abs(x - player.x) + Math.abs(y - player.y);
            if (distToPlayer > 3) {
                // Не размещать на других сущностях
                const existingEnemy = collection.find(e => e.x === x && e.y === y);
                const existingItem = items.find(i => i.x === x && i.y === y);
                const onStairs = stairs && stairs.x === x && stairs.y === y;
                if (!existingEnemy && !existingItem && !onStairs && !(player.x === x && player.y === y)) {
                    const entity = createFn();
                    entity.x = x;
                    entity.y = y;
                    collection.push(entity);
                    placed = true;
                }
            }
        }
        attempts++;
    }
}

// Отрисовка карты
function render() {
    gameArea.innerHTML = '';
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            
            // Определяем что отображать на клетке
            if (player.x === x && player.y === y) {
                tile.textContent = TILE_TYPES.PLAYER;
                tile.classList.add('player');
            } else if (stairs && stairs.x === x && stairs.y === y) {
                tile.textContent = TILE_TYPES.STAIRS;
                tile.classList.add('stairs');
            } else {
                let content = map[y][x];
                let tileClass = map[y][x] === TILE_TYPES.WALL ? 'wall' : 'floor';
                
                // Проверяем предметы
                const item = items.find(i => i.x === x && i.y === y);
                if (item) {
                    content = item.symbol;
                    tileClass = 'item';
                }
                
                // Проверяем врагов
                const enemy = enemies.find(e => e.x === x && e.y === y);
                if (enemy) {
                    content = enemy.symbol.toUpperCase();
                    tileClass = 'enemy';
                }
                
                tile.textContent = content;
                tile.classList.add(tileClass);
            }
            
            gameArea.appendChild(tile);
        }
    }
}

// Добавление сообщения в лог
function addMessage(text, color = '#aaa') {
    messageLog.unshift({ text, color });
    if (messageLog.length > 50) {
        messageLog.pop();
    }
    updateMessageLog();
}

function updateMessageLog() {
    messageLogEl.innerHTML = '';
    messageLog.forEach(msg => {
        const p = document.createElement('p');
        p.textContent = msg.text;
        p.style.color = msg.color;
        messageLogEl.appendChild(p);
    });
}

// Обновление статистики
function updateStats() {
    hpEl.textContent = player.hp;
    maxHpEl.textContent = player.maxHp;
    attackEl.textContent = player.attack;
    defenseEl.textContent = player.defense;
    levelEl.textContent = player.level;
    xpEl.textContent = player.xp;
    nextLevelEl.textContent = player.nextLevelXp;
    floorEl.textContent = floor;
}

// Движение игрока
function movePlayer(dx, dy) {
    if (!isGameRunning) return;
    
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    // Проверка стен
    if (map[newY][newX] === TILE_TYPES.WALL) {
        return;
    }
    
    // Проверка врагов
    const enemy = enemies.find(e => e.x === newX && e.y === newY);
    if (enemy) {
        combat(enemy);
        endTurn();
        return;
    }
    
    // Проверка предметов
    const itemIndex = items.findIndex(i => i.x === newX && i.y === newY);
    if (itemIndex !== -1) {
        const item = items[itemIndex];
        useItem(item);
        items.splice(itemIndex, 1);
    }
    
    // Проверка лестницы
    if (stairs && stairs.x === newX && stairs.y === newY) {
        nextFloor();
        return;
    }
    
    player.x = newX;
    player.y = newY;
    
    endTurn();
}

// Бой с врагом
function combat(enemy) {
    // Игрок атакует
    const damageToEnemy = Math.max(1, player.attack - enemy.defense);
    enemy.hp -= damageToEnemy;
    addMessage(`⚔️ Вы нанесли ${damageToEnemy} урона ${enemy.name}!`, '#ffff00');
    
    if (enemy.hp <= 0) {
        addMessage(`💀 ${enemy.name} повержен! +${enemy.xp} XP`, '#00ff00');
        player.gainXp(enemy.xp);
        enemies = enemies.filter(e => e !== enemy);
        return;
    }
    
    // Враг атакует
    const damageToPlayer = Math.max(1, enemy.attack - player.defense);
    player.takeDamage(damageToPlayer);
    addMessage(`🩸 ${enemy.name} атакует вас на ${damageToPlayer} урона!`, '#ff8888');
}

// Использование предмета
function useItem(item) {
    switch (item.effect) {
        case 'heal':
            player.heal(item.value);
            addMessage(`🧪 Вы использовали ${item.name} и восстановили ${item.value} HP`, '#00ff00');
            break;
        case 'attack':
            player.attack += item.value;
            addMessage(`⚔️ Вы взяли ${item.name}! Атака +${item.value}`, '#00ffff');
            break;
        case 'defense':
            player.defense += item.value;
            addMessage(`🛡️ Вы взяли ${item.name}! Защита +${item.value}`, '#00ffff');
            break;
        case 'xp':
            player.gainXp(item.value);
            addMessage(`📜 Вы прочитали ${item.name}! +${item.value} XP`, '#ffff00');
            break;
    }
    updateStats();
}

// Переход на следующий этаж
function nextFloor() {
    floor++;
    addMessage(`🏰 Вы спустились на этаж ${floor}!`, '#ffd700');
    generateMap();
    render();
}

// Конец хода (враги двигаются)
function endTurn() {
    // Движение врагов
    enemies.forEach(enemy => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.abs(dx) + Math.abs(dy);
        
        if (dist <= 8) { // Враг замечает игрока
            let moveX = 0, moveY = 0;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                moveX = dx > 0 ? 1 : -1;
            } else {
                moveY = dy > 0 ? 1 : -1;
            }
            
            const newX = enemy.x + moveX;
            const newY = enemy.y + moveY;
            
            // Проверка можно ли двигаться
            if (map[newY][newX] !== TILE_TYPES.WALL && 
                !enemies.some(e => e.x === newX && e.y === newY) &&
                !(player.x === newX && player.y === newY)) {
                enemy.x = newX;
                enemy.y = newY;
            } else if (player.x === newX && player.y === newY) {
                // Атака игрока
                const damage = Math.max(1, enemy.attack - player.defense);
                player.takeDamage(damage);
                addMessage(`🩸 ${enemy.name} атакует вас на ${damage} урона!`, '#ff4444');
            }
        }
    });
    
    render();
}

// Ждать ход
function wait() {
    if (!isGameRunning) return;
    addMessage(`⏳ Вы ждёте...`, '#888');
    endTurn();
}

// Конец игры
function gameOver() {
    isGameRunning = false;
    addMessage(`☠️ ИГРА ОКОНЧЕНА! Вы достигли этажа ${floor}, уровень ${player.level}`, '#ff0000');
    startBtn.textContent = 'Играть снова';
}

// Старт игры
function startGame() {
    if (isGameRunning) return;
    
    isGameRunning = true;
    floor = 1;
    messageLog = [];
    player = new Player(0, 0);
    
    addMessage('🏰 Добро пожаловать в Подземелье!', '#ffd700');
    addMessage('Найдите лестницу (>) чтобы спуститься глубже.', '#aaa');
    
    generateMap();
    render();
    updateStats();
    startBtn.textContent = 'Игра идёт...';
}

// Обработчики событий
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) {
        if (e.code === 'Space' || e.code === 'Enter') {
            startGame();
        }
        return;
    }
    
    switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
            e.preventDefault();
            movePlayer(0, -1);
            break;
        case 'KeyS':
        case 'ArrowDown':
            e.preventDefault();
            movePlayer(0, 1);
            break;
        case 'KeyA':
        case 'ArrowLeft':
            e.preventDefault();
            movePlayer(-1, 0);
            break;
        case 'KeyD':
        case 'ArrowRight':
            e.preventDefault();
            movePlayer(1, 0);
            break;
        case 'Space':
            e.preventDefault();
            wait();
            break;
    }
});

startBtn.addEventListener('click', () => {
    if (!isGameRunning) {
        startGame();
    }
});

// Начальное состояние
startBtn.textContent = 'Начать игру';
addMessage('Нажмите "Начать игру" или ПРОБЕЛ для старта', '#888');
