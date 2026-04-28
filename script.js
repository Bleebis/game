// Конфигурация игры
const COLS = 20;
const ROWS = 16;
const TILE_SIZE = 32;

// Графика персонажей и объектов (SVG)
const GRAPHICS = {
    // Игрок - воин в шлеме
    player: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <!-- Тело -->
            <circle cx="16" cy="16" r="14" fill="#2d5a27"/>
            <!-- Шлем -->
            <ellipse cx="16" cy="12" rx="10" ry="8" fill="#4a4a4a"/>
            <rect x="8" y="10" width="16" height="4" fill="#6a6a6a"/>
            <!-- Забрало -->
            <rect x="10" y="11" width="12" height="2" fill="#2a2a2a"/>
            <!-- Глаза -->
            <circle cx="13" cy="12" r="1.5" fill="#fff"/>
            <circle cx="19" cy="12" r="1.5" fill="#fff"/>
            <circle cx="13" cy="12" r="0.8" fill="#000"/>
            <circle cx="19" cy="12" r="0.8" fill="#000"/>
            <!-- Детали брони -->
            <path d="M16 20 L16 28" stroke="#3a3a3a" stroke-width="2"/>
            <path d="M10 24 L22 24" stroke="#3a3a3a" stroke-width="2"/>
        </svg>`,
    
    // Крыса
    rat: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="16" cy="18" rx="12" ry="8" fill="#8b7355"/>
            <circle cx="24" cy="16" r="5" fill="#8b7355"/>
            <circle cx="26" cy="14" r="2" fill="#ffb6c1"/>
            <circle cx="26" cy="18" r="2" fill="#ffb6c1"/>
            <circle cx="25" cy="15" r="1.5" fill="#ff0000"/>
            <path d="M28 16 L32 14 M28 16 L32 18" stroke="#ffb6c1" stroke-width="1.5"/>
            <path d="M10 18 Q8 14 6 16" stroke="#8b7355" stroke-width="2" fill="none"/>
        </svg>`,
    
    // Гоблин
    goblin: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#4a8f4a"/>
            <polygon points="6,10 4,6 10,8" fill="#4a8f4a"/>
            <polygon points="26,10 28,6 22,8" fill="#4a8f4a"/>
            <ellipse cx="16" cy="18" rx="8" ry="6" fill="#3a7f3a"/>
            <circle cx="12" cy="14" r="2" fill="#ffff00"/>
            <circle cx="20" cy="14" r="2" fill="#ffff00"/>
            <circle cx="12" cy="14" r="1" fill="#000"/>
            <circle cx="20" cy="14" r="1" fill="#000"/>
            <path d="M14 20 Q16 22 18 20" stroke="#000" stroke-width="1.5" fill="none"/>
            <polygon points="16,21 14,24 18,24" fill="#fff"/>
        </svg>`,
    
    // Скелет
    skeleton: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="14" r="10" fill="#f5f5dc"/>
            <circle cx="13" cy="12" r="3" fill="#000"/>
            <circle cx="19" cy="12" r="3" fill="#000"/>
            <circle cx="13" cy="12" r="1.5" fill="#fff"/>
            <circle cx="19" cy="12" r="1.5" fill="#fff"/>
            <ellipse cx="16" cy="18" rx="3" ry="2" fill="#000"/>
            <line x1="14" y1="18" x2="14" y2="20" stroke="#f5f5dc" stroke-width="1"/>
            <line x1="16" y1="18" x2="16" y2="20" stroke="#f5f5dc" stroke-width="1"/>
            <line x1="18" y1="18" x2="18" y2="20" stroke="#f5f5dc" stroke-width="1"/>
            <ellipse cx="16" cy="24" rx="6" ry="4" fill="#f5f5dc"/>
        </svg>`,
    
    // Орк
    orc: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="13" fill="#3a5f3a"/>
            <polygon points="4,12 2,8 8,10" fill="#3a5f3a"/>
            <polygon points="28,12 30,8 24,10" fill="#3a5f3a"/>
            <rect x="8" y="10" width="16" height="4" fill="#2a4f2a"/>
            <circle cx="12" cy="13" r="2" fill="#ff6600"/>
            <circle cx="20" cy="13" r="2" fill="#ff6600"/>
            <circle cx="12" cy="13" r="1" fill="#000"/>
            <circle cx="20" cy="13" r="1" fill="#000"/>
            <polygon points="14,20 16,23 18,20" fill="#fff"/>
            <polygon points="12,19 13,21 11,21" fill="#fff"/>
            <polygon points="20,19 19,21 21,21" fill="#fff"/>
        </svg>`,
    
    // Тролль
    troll: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="16" cy="18" rx="14" ry="11" fill="#5a7f5a"/>
            <circle cx="16" cy="12" r="9" fill="#5a7f5a"/>
            <polygon points="16,4 14,8 18,8" fill="#5a7f5a"/>
            <circle cx="12" cy="11" r="2.5" fill="#ff0000"/>
            <circle cx="20" cy="11" r="2.5" fill="#ff0000"/>
            <circle cx="12" cy="11" r="1" fill="#000"/>
            <circle cx="20" cy="11" r="1" fill="#000"/>
            <path d="M10 18 Q16 24 22 18" stroke="#3a5f3a" stroke-width="3" fill="none"/>
            <polygon points="14,20 15,23 17,23 18,20" fill="#fff"/>
            <polygon points="12,19 13,21 11,21" fill="#fff"/>
        </svg>`,
    
    // Зелье лечения
    healthPotion: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8 L12 12 Q8 14 8 20 Q8 28 16 28 Q24 28 24 20 Q24 14 20 12 L20 8 Z" fill="#ff4444"/>
            <ellipse cx="16" cy="8" rx="4" ry="3" fill="#ff6666"/>
            <circle cx="14" cy="18" r="3" fill="#ffaaaa"/>
            <circle cx="18" cy="22" r="2" fill="#ffaaaa"/>
        </svg>`,
    
    // Меч
    sword: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect x="14" y="4" width="4" height="18" fill="#c0c0c0"/>
            <polygon points="16,4 12,10 20,10" fill="#a0a0a0"/>
            <rect x="10" y="22" width="12" height="4" fill="#8b4513"/>
            <circle cx="16" cy="24" r="3" fill="#ffd700"/>
            <polygon points="16,27 14,32 18,32" fill="#8b4513"/>
        </svg>`,
    
    // Щит
    shield: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4 L26 10 L26 18 Q26 26 16 28 Q6 26 6 18 L6 10 Z" fill="#4a4a4a"/>
            <path d="M16 6 L24 11 L24 17 Q24 24 16 26 Q8 24 8 17 L8 11 Z" fill="#6a6a6a"/>
            <circle cx="16" cy="16" r="4" fill="#ffd700"/>
            <path d="M16 8 L16 24" stroke="#8a8a8a" stroke-width="2"/>
        </svg>`,
    
    // Свиток
    scroll: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="16" cy="16" rx="12" ry="8" fill="#f5deb3"/>
            <ellipse cx="16" cy="16" rx="10" ry="6" fill="#f0e6d0"/>
            <path d="M10 14 L14 16 L10 18" stroke="#8b4513" stroke-width="1.5" fill="none"/>
            <circle cx="18" cy="15" r="1" fill="#8b4513"/>
            <circle cx="20" cy="17" r="1" fill="#8b4513"/>
            <ellipse cx="6" cy="16" rx="3" ry="8" fill="#d2b48c"/>
            <ellipse cx="26" cy="16" rx="3" ry="8" fill="#d2b48c"/>
        </svg>`,
    
    // Лестница
    stairs: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="20" width="24" height="8" fill="#4a4a4a"/>
            <rect x="6" y="14" width="20" height="6" fill="#5a5a5a"/>
            <rect x="8" y="8" width="16" height="6" fill="#6a6a6a"/>
            <rect x="10" y="4" width="12" height="4" fill="#7a7a7a"/>
            <polygon points="16,4 12,2 20,2" fill="#ffd700"/>
        </svg>`,
    
    // Стена
    wall: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" fill="#3a3a5a"/>
            <rect x="0" y="0" width="15" height="15" fill="#4a4a6a" stroke="#2a2a4a" stroke-width="1"/>
            <rect x="16" y="0" width="16" height="15" fill="#4a4a6a" stroke="#2a2a4a" stroke-width="1"/>
            <rect x="0" y="16" width="16" height="16" fill="#4a4a6a" stroke="#2a2a4a" stroke-width="1"/>
            <rect x="17" y="16" width="15" height="16" fill="#4a4a6a" stroke="#2a2a4a" stroke-width="1"/>
            <rect x="8" y="8" width="4" height="4" fill="#5a5a7a" opacity="0.5"/>
            <rect x="20" y="20" width="4" height="4" fill="#5a5a7a" opacity="0.5"/>
        </svg>`,
    
    // Пол
    floor: `
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" fill="#1a1a2e"/>
            <rect x="2" y="2" width="28" height="28" fill="none" stroke="#2a2a4a" stroke-width="0.5"/>
            <circle cx="8" cy="8" r="1" fill="#2a2a4a" opacity="0.5"/>
            <circle cx="24" cy="12" r="1" fill="#2a2a4a" opacity="0.5"/>
            <circle cx="16" cy="24" r="1" fill="#2a2a4a" opacity="0.5"/>
            <circle cx="6" cy="20" r="1" fill="#2a2a4a" opacity="0.5"/>
            <circle cx="26" cy="26" r="1" fill="#2a2a4a" opacity="0.5"/>
        </svg>`
};

const ENEMIES = [
    { name: 'Крыса', graphicKey: 'rat', hp: 15, attack: 3, defense: 0, xp: 10 },
    { name: 'Гоблин', graphicKey: 'goblin', hp: 25, attack: 5, defense: 1, xp: 20 },
    { name: 'Скелет', graphicKey: 'skeleton', hp: 35, attack: 7, defense: 2, xp: 30 },
    { name: 'Орк', graphicKey: 'orc', hp: 50, attack: 10, defense: 3, xp: 50 },
    { name: 'Тролль', graphicKey: 'troll', hp: 80, attack: 15, defense: 5, xp: 100 }
];

const ITEMS = [
    { name: 'Зелье лечения', graphicKey: 'healthPotion', effect: 'heal', value: 20 },
    { name: 'Меч +1', graphicKey: 'sword', effect: 'attack', value: 2 },
    { name: 'Щит +1', graphicKey: 'shield', effect: 'defense', value: 1 },
    { name: 'Свиток опыта', graphicKey: 'scroll', effect: 'xp', value: 25 }
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
                map[y][x] = 'wall';
            } else {
                // 40% шанс стены
                map[y][x] = Math.random() < 0.4 ? 'wall' : 'floor';
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
        if (map[y][x] === 'floor') {
            // Проверяем, что вокруг достаточно места
            let floorCount = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (map[y + dy] && map[y + dy][x + dx] === 'floor') {
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
        if (map[y][x] === 'floor') {
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
                    if (map[y + dy][x + dx] === 'wall') {
                        wallCount++;
                    }
                }
            }
            if (wallCount > 4) {
                newMap[y][x] = 'wall';
            } else if (wallCount < 4) {
                newMap[y][x] = 'floor';
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
                tile.innerHTML = GRAPHICS.player;
                tile.classList.add('player');
            } else {
                let graphicKey = map[y][x];
                
                // Проверяем предметы
                const item = items.find(i => i.x === x && i.y === y);
                if (item) {
                    graphicKey = item.graphicKey;
                }
                
                // Проверяем врагов
                const enemy = enemies.find(e => e.x === x && e.y === y);
                if (enemy) {
                    graphicKey = enemy.graphicKey;
                }
                
                // Проверяем лестницу (если нет других объектов)
                if (stairs && stairs.x === x && stairs.y === y && !item && !enemy) {
                    graphicKey = 'stairs';
                }
                
                // Рендерим графику
                if (GRAPHICS[graphicKey]) {
                    tile.innerHTML = GRAPHICS[graphicKey];
                }
                
                tile.classList.add(graphicKey);
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
    if (map[newY][newX] === 'wall') {
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
            if (map[newY][newX] !== 'wall' && 
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
