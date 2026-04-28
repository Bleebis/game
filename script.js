// 3D Roguelike Game using Three.js

// Конфигурация игры
const COLS = 20;
const ROWS = 20;
const TILE_SIZE = 2;

// Глобальные переменные Three.js
let scene, camera, renderer;
let playerMesh, enemyMeshes = [], itemMeshes = [], wallMeshes = [], floorMeshes = [];
let stairsMesh = null;
let minimapScene, minimapCamera, minimapRenderer;

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
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const hpEl = document.getElementById('hp');
const maxHpEl = document.getElementById('maxHp');
const attackEl = document.getElementById('attack');
const defenseEl = document.getElementById('defense');
const levelEl = document.getElementById('level');
const xpEl = document.getElementById('xp');
const nextLevelEl = document.getElementById('nextLevel');
const floorEl = document.getElementById('floor');
const messageLogEl = document.getElementById('messageLog');
const hpFillEl = document.getElementById('hpFill');
const minimapCanvas = document.getElementById('minimapCanvas');

// Враги
const ENEMIES = [
    { name: 'Крыса', color: 0x8b7355, hp: 15, attack: 3, defense: 0, xp: 10, size: 0.8 },
    { name: 'Гоблин', color: 0x4a8f4a, hp: 25, attack: 5, defense: 1, xp: 20, size: 1.0 },
    { name: 'Скелет', color: 0xf5f5dc, hp: 35, attack: 7, defense: 2, xp: 30, size: 1.0 },
    { name: 'Орк', color: 0x3a5f3a, hp: 50, attack: 10, defense: 3, xp: 50, size: 1.2 },
    { name: 'Тролль', color: 0x5a7f5a, hp: 80, attack: 15, defense: 5, xp: 100, size: 1.4 }
];

// Предметы
const ITEMS = [
    { name: 'Зелье лечения', color: 0xff4444, effect: 'heal', value: 20 },
    { name: 'Меч +1', color: 0xc0c0c0, effect: 'attack', value: 2 },
    { name: 'Щит +1', color: 0x4a4a4a, effect: 'defense', value: 1 },
    { name: 'Свиток опыта', color: 0xf5deb3, effect: 'xp', value: 25 }
];

// Инициализация Three.js сцены
function initThree() {
    const canvas = document.getElementById('gameCanvas');
    
    // Основная сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
    
    // Камера
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 20, 15);
    camera.lookAt(0, 0, 0);
    
    // Рендерер
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    
    // Освещение
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xffaa00, 0.5, 20);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);
    
    // Мини-карта
    minimapScene = new THREE.Scene();
    minimapCamera = new THREE.OrthographicCamera(-15, 15, 15, -15, 0.1, 100);
    minimapCamera.position.set(0, 30, 0);
    minimapCamera.lookAt(0, 0, 0);
    
    minimapRenderer = new THREE.WebGLRenderer({ canvas: minimapCanvas, antialias: true });
    minimapRenderer.setSize(150, 150);
    minimapRenderer.setClearColor(0x1a1a2e);
    
    // Обработка изменения размера окна
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Создание меша стены
function createWallMesh(x, y) {
    const geometry = new THREE.BoxGeometry(TILE_SIZE, TILE_SIZE * 1.5, TILE_SIZE);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x4a4a6a,
        roughness: 0.8,
        metalness: 0.2
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x * TILE_SIZE, TILE_SIZE * 0.75, y * TILE_SIZE);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

// Создание меша пола
function createFloorMesh(x, y) {
    const geometry = new THREE.PlaneGeometry(TILE_SIZE, TILE_SIZE);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x1a1a2e,
        roughness: 0.9,
        metalness: 0.1
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x * TILE_SIZE, 0, y * TILE_SIZE);
    mesh.receiveShadow = true;
    return mesh;
}

// Создание меша игрока
function createPlayerMesh() {
    const group = new THREE.Group();
    
    // Тело
    const bodyGeometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);
    
    // Шлем
    const helmetGeometry = new THREE.SphereGeometry(0.4, 8, 8);
    const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.8 });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.7;
    helmet.castShadow = true;
    group.add(helmet);
    
    // Меч
    const swordGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const swordMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9 });
    const sword = new THREE.Mesh(swordGeometry, swordMaterial);
    sword.position.set(0.4, 0.2, 0.3);
    sword.rotation.x = Math.PI / 4;
    group.add(sword);
    
    return group;
}

// Создание меша врага
function createEnemyMesh(enemyType) {
    const group = new THREE.Group();
    const size = enemyType.size;
    
    // Тело
    const bodyGeometry = new THREE.SphereGeometry(size * 0.5, 8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: enemyType.color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    group.add(body);
    
    // Глаза
    const eyeGeometry = new THREE.SphereGeometry(size * 0.15, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.5 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-size * 0.2, size * 0.1, size * 0.4);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(size * 0.2, size * 0.1, size * 0.4);
    group.add(rightEye);
    
    return group;
}

// Создание меша предмета
function createItemMesh(itemType) {
    const geometry = new THREE.OctahedronGeometry(0.4);
    const material = new THREE.MeshStandardMaterial({ 
        color: itemType.color,
        emissive: itemType.color,
        emissiveIntensity: 0.3,
        metalness: 0.5
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    
    // Анимация вращения
    mesh.userData = { rotate: true };
    
    return mesh;
}

// Создание лестницы
function createStairsMesh() {
    const group = new THREE.Group();
    
    for (let i = 0; i < 4; i++) {
        const stepGeometry = new THREE.BoxGeometry(TILE_SIZE * 0.8, 0.2, TILE_SIZE * 0.5);
        const stepMaterial = new THREE.MeshStandardMaterial({ color: 0x5a5a5a });
        const step = new THREE.Mesh(stepGeometry, stepMaterial);
        step.position.set(0, i * 0.2, -i * TILE_SIZE * 0.3);
        step.castShadow = true;
        group.add(step);
    }
    
    // Стрелка вверх
    const arrowGeometry = new THREE.ConeGeometry(0.3, 0.5, 4);
    const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.5 });
    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(0, 1, 0);
    arrow.rotation.y = Math.PI / 4;
    group.add(arrow);
    
    return group;
}

// Генерация карты
function generateMap() {
    // Очистка старых мешей
    wallMeshes.forEach(mesh => scene.remove(mesh));
    floorMeshes.forEach(mesh => scene.remove(mesh));
    enemyMeshes.forEach(mesh => scene.remove(mesh));
    itemMeshes.forEach(mesh => scene.remove(mesh));
    if (stairsMesh) scene.remove(stairsMesh);
    
    wallMeshes = [];
    floorMeshes = [];
    enemyMeshes = [];
    itemMeshes = [];
    
    // Инициализация случайными стенами и полом
    map = [];
    for (let y = 0; y < ROWS; y++) {
        map[y] = [];
        for (let x = 0; x < COLS; x++) {
            if (x === 0 || x === COLS - 1 || y === 0 || y === ROWS - 1) {
                map[y][x] = 'wall';
            } else {
                map[y][x] = Math.random() < 0.35 ? 'wall' : 'floor';
            }
        }
    }

    // Сглаживание карты
    for (let i = 0; i < 3; i++) {
        map = smoothMap();
    }

    // Находим место для игрока
    let placed = false;
    while (!placed) {
        const x = Math.floor(Math.random() * (COLS - 2)) + 1;
        const y = Math.floor(Math.random() * (ROWS - 2)) + 1;
        if (map[y][x] === 'floor') {
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

    // Размещаем лестницу
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
        }, enemyMeshes, createEnemyMesh);
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
        }, itemMeshes, createItemMesh);
    }
    
    // Создаем меши карты
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (map[y][x] === 'wall') {
                const wallMesh = createWallMesh(x, y);
                scene.add(wallMesh);
                wallMeshes.push(wallMesh);
            } else {
                const floorMesh = createFloorMesh(x, y);
                scene.add(floorMesh);
                floorMeshes.push(floorMesh);
            }
        }
    }
    
    // Создаем лестницу
    stairsMesh = createStairsMesh();
    stairsMesh.position.set(stairs.x * TILE_SIZE, 0.1, stairs.y * TILE_SIZE);
    scene.add(stairsMesh);
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

function placeEntity(createFn, meshArray, meshCreator) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
        const x = Math.floor(Math.random() * (COLS - 2)) + 1;
        const y = Math.floor(Math.random() * (ROWS - 2)) + 1;
        if (map[y][x] === 'floor') {
            const distToPlayer = Math.abs(x - player.x) + Math.abs(y - player.y);
            if (distToPlayer > 3) {
                const existingEnemy = enemies.find(e => e.x === x && e.y === y);
                const existingItem = items.find(i => i.x === x && i.y === y);
                const onStairs = stairs && stairs.x === x && stairs.y === y;
                if (!existingEnemy && !existingItem && !onStairs && !(player.x === x && player.y === y)) {
                    const entity = createFn();
                    entity.x = x;
                    entity.y = y;
                    
                    const mesh = meshCreator(entity);
                    mesh.position.set(x * TILE_SIZE, 0.5, y * TILE_SIZE);
                    scene.add(mesh);
                    meshArray.push(mesh);
                    
                    if (meshArray === enemyMeshes) {
                        enemies.push(entity);
                    } else {
                        items.push(entity);
                    }
                    
                    placed = true;
                }
            }
        }
        attempts++;
    }
}

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

// Обновление позиции игрока в 3D
function updatePlayerPosition() {
    if (playerMesh) {
        playerMesh.position.x = player.x * TILE_SIZE;
        playerMesh.position.z = player.y * TILE_SIZE;
        
        // Камера следует за игроком
        camera.position.x = playerMesh.position.x;
        camera.position.z = playerMesh.position.z + 15;
        camera.lookAt(playerMesh.position.x, 0, playerMesh.position.z);
    }
}

// Движение игрока
function movePlayer(dx, dy) {
    if (!isGameRunning) return;
    
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    // Проверка границ и стен
    if (newX < 0 || newX >= COLS || newY < 0 || newY >= ROWS) return;
    if (map[newY][newX] === 'wall') return;
    
    // Проверка на врагов
    const enemy = enemies.find(e => e.x === newX && e.y === newY);
    if (enemy) {
        attackEnemy(enemy);
        return;
    }
    
    // Движение
    player.x = newX;
    player.y = newY;
    updatePlayerPosition();
    
    // Проверка на предметы
    const itemIndex = items.findIndex(i => i.x === newX && i.y === newY);
    if (itemIndex !== -1) {
        pickupItem(items[itemIndex], itemIndex);
    }
    
    // Проверка на лестницу
    if (stairs && stairs.x === newX && stairs.y === newY) {
        nextFloor();
    }
    
    // Ход врагов
    enemyTurn();
    
    updateMinimap();
}

// Атака врага
function attackEnemy(enemy) {
    const damage = Math.max(1, player.attack - enemy.defense);
    enemy.hp -= damage;
    addMessage(`⚔️ Вы нанесли ${damage} урона ${enemy.name}!`, '#ffff00');
    
    if (enemy.hp <= 0) {
        addMessage(`💀 ${enemy.name} повержен! +${enemy.xp} XP`, '#00ff00');
        player.gainXp(enemy.xp);
        
        // Удаляем врага
        const index = enemies.indexOf(enemy);
        if (index !== -1) {
            enemies.splice(index, 1);
            scene.remove(enemyMeshes[index]);
            enemyMeshes.splice(index, 1);
        }
    }
}

// Подбор предмета
function pickupItem(item, index) {
    addMessage(`📦 Вы подобрали: ${item.name}`, '#00ffff');
    
    if (item.effect === 'heal') {
        player.heal(item.value);
        addMessage(`❤️ Восстановлено ${item.value} HP`, '#00ff00');
    } else if (item.effect === 'attack') {
        player.attack += item.value;
        addMessage(`⚔️ Атака увеличена на ${item.value}`, '#00ff00');
    } else if (item.effect === 'defense') {
        player.defense += item.value;
        addMessage(`🛡️ Защита увеличена на ${item.value}`, '#00ff00');
    } else if (item.effect === 'xp') {
        player.gainXp(item.value);
        addMessage(`✨ Получено ${item.value} опыта`, '#00ff00');
    }
    
    // Удаляем предмет
    items.splice(index, 1);
    scene.remove(itemMeshes[index]);
    itemMeshes.splice(index, 1);
}

// Ход врагов
function enemyTurn() {
    enemies.forEach((enemy, index) => {
        const dist = Math.abs(enemy.x - player.x) + Math.abs(enemy.y - player.y);
        
        if (dist <= 1) {
            // Атака игрока
            player.takeDamage(enemy.attack);
        } else if (dist < 8) {
            // Движение к игроку
            const dx = player.x > enemy.x ? 1 : (player.x < enemy.x ? -1 : 0);
            const dy = player.y > enemy.y ? 1 : (player.y < enemy.y ? -1 : 0);
            
            let newX = enemy.x + dx;
            let newY = enemy.y + dy;
            
            // Простая проверка пути
            if (map[newY][newX] !== 'wall' && !enemies.some(e => e.x === newX && e.y === newY)) {
                enemy.x = newX;
                enemy.y = newY;
                enemyMeshes[index].position.set(newX * TILE_SIZE, 0.5, newY * TILE_SIZE);
            }
        }
    });
}

// Следующий этаж
function nextFloor() {
    floor++;
    addMessage(`🏰 Вы спустились на этаж ${floor}!`, '#ffd700');
    floorEl.textContent = floor;
    
    // Лечим игрока немного
    player.heal(Math.floor(player.maxHp * 0.1));
    
    generateMap();
    updatePlayerPosition();
    updateMinimap();
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
    
    const hpPercent = (player.hp / player.maxHp) * 100;
    hpFillEl.style.width = `${hpPercent}%`;
}

// Добавление сообщения в лог
function addMessage(text, color) {
    messageLog.unshift({ text, color, time: Date.now() });
    if (messageLog.length > 50) messageLog.pop();
    
    renderMessageLog();
}

function renderMessageLog() {
    messageLogEl.innerHTML = '';
    const recentMessages = messageLog.slice(0, 10);
    recentMessages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'message';
        div.textContent = msg.text;
        div.style.color = msg.color;
        messageLogEl.appendChild(div);
    });
}

// Обновление мини-карты
function updateMinimap() {
    // Очистка мини-карты
    while(minimapScene.children.length > 0){ 
        minimapScene.remove(minimapScene.children[0]); 
    }
    
    // Рисуем карту
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (map[y][x] === 'wall') {
                const geometry = new THREE.PlaneGeometry(0.8, 0.8);
                const material = new THREE.MeshBasicMaterial({ color: 0x4a4a6a });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set((x - COLS/2) * 0.8, 0, (y - ROWS/2) * 0.8);
                minimapScene.add(mesh);
            }
        }
    }
    
    // Рисуем лестницу
    if (stairs) {
        const geometry = new THREE.CircleGeometry(0.5, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set((stairs.x - COLS/2) * 0.8, 0.1, (stairs.y - ROWS/2) * 0.8);
        minimapScene.add(mesh);
    }
    
    // Рисуем врагов
    enemies.forEach(enemy => {
        const geometry = new THREE.CircleGeometry(0.4, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set((enemy.x - COLS/2) * 0.8, 0.1, (enemy.y - ROWS/2) * 0.8);
        minimapScene.add(mesh);
    });
    
    // Рисуем предметы
    items.forEach(item => {
        const geometry = new THREE.CircleGeometry(0.3, 8);
        const material = new THREE.MeshBasicMaterial({ color: item.color });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set((item.x - COLS/2) * 0.8, 0.1, (item.y - ROWS/2) * 0.8);
        minimapScene.add(mesh);
    });
    
    // Рисуем игрока
    const playerGeometry = new THREE.CircleGeometry(0.5, 8);
    const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
    playerMesh.position.set((player.x - COLS/2) * 0.8, 0.2, (player.y - ROWS/2) * 0.8);
    minimapScene.add(playerMesh);
}

// Отрисовка мини-карты
function renderMinimap() {
    minimapRenderer.render(minimapScene, minimapCamera);
}

// Game Over
function gameOver() {
    isGameRunning = false;
    addMessage(`💀 Игра окончена! Вы достигли этажа ${floor}`, '#ff0000');
    startBtn.classList.add('hidden');
    restartBtn.classList.remove('hidden');
}

// Основной цикл анимации
function animate() {
    requestAnimationFrame(animate);
    
    // Анимация предметов
    itemMeshes.forEach(mesh => {
        if (mesh.userData.rotate) {
            mesh.rotation.y += 0.02;
            mesh.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.1;
        }
    });
    
    renderer.render(scene, camera);
    renderMinimap();
}

// Начало игры
function startGame() {
    player = new Player(10, 10);
    floor = 1;
    messageLog = [];
    enemies = [];
    items = [];
    
    floorEl.textContent = floor;
    updateStats();
    
    generateMap();
    updatePlayerPosition();
    
    // Создаем игрока
    if (playerMesh) scene.remove(playerMesh);
    playerMesh = createPlayerMesh();
    playerMesh.position.set(player.x * TILE_SIZE, 0.5, player.y * TILE_SIZE);
    scene.add(playerMesh);
    
    isGameRunning = true;
    startBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    
    addMessage('🎮 Добро пожаловать в подземелье!', '#00ff00');
    addMessage('Найдите лестницу (желтая стрелка) чтобы спуститься ниже', '#ffff00');
    
    updateMinimap();
}

// Управление
document.addEventListener('keydown', (e) => {
    if (!isGameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer(1, 0);
            break;
        case ' ':
            addMessage('⏳ Вы ждёте...', '#888888');
            enemyTurn();
            break;
        case 'e':
        case 'E':
            // Использование предметов (можно расширить)
            addMessage('📜 Инвентарь в разработке...', '#888888');
            break;
    }
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initThree();
    
    // Обработчики кнопок
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    
    animate();
});
