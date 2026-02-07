// Простий робочий варіант для початку
const GAME_CONFIG = {
    apiUrl: 'https://script.google.com/macros/s/AKfycbyCw1v0aK2h7_acX8brCUlzCeFU4RzZbCucH93LZy2jV4NvhTlB5Nz8URju7LlfZCw/exec',
    
    levels: [
        { 
            id: 1, 
            title: "Температура повітря", 
            theme: "Температура", 
            emoji: "🌡️",
            color: "#FF9500",
            unlocked: true
        },
        { 
            id: 2, 
            title: "Атмосферний тиск", 
            theme: "Тиск", 
            emoji: "📉",
            color: "#00FFFF",
            unlocked: false
        },
        { 
            id: 3, 
            title: "Вітер", 
            theme: "Вітер", 
            emoji: "🌬️",
            color: "#39FF14",
            unlocked: false
        },
        { 
            id: 4, 
            title: "Хмари та вологість", 
            theme: "Хмари", 
            emoji: "☁️",
            color: "#C77DFF",
            unlocked: false
        },
        { 
            id: 5, 
            title: "Опади", 
            theme: "Опади", 
            emoji: "🌧️",
            color: "#0099FF",
            unlocked: false
        },
        { 
            id: 6, 
            title: "Підсумковий проект", 
            theme: "Проект", 
            emoji: "🧭",
            color: "#FF4081",
            unlocked: false
        }
    ]
};

// Дані гравця
let player = {
    name: localStorage.getItem('playerName') || 'Гравець',
    class: localStorage.getItem('playerClass') || '6 клас',
    crystals: parseInt(localStorage.getItem('playerCrystals')) || 0,
    completed: JSON.parse(localStorage.getItem('completedLevels')) || [],
    stars: JSON.parse(localStorage.getItem('levelStars')) || {},
    scores: JSON.parse(localStorage.getItem('levelScores')) || {}
};

// Ініціалізація
function initGame() {
    console.log('Ініціалізація гри...');
    updatePlayerDisplay();
    renderLevels();
    loadLeaderboard();
}

// Оновлення відображення гравця
function updatePlayerDisplay() {
    const usernameEl = document.getElementById('username');
    const crystalCountEl = document.getElementById('crystal-count');
    const totalStarsEl = document.getElementById('total-stars');
    const totalScoreEl = document.getElementById('total-score');
    const progressFillEl = document.getElementById('progress-fill');
    const progressTextEl = document.getElementById('progress-text');
    const progressPercentEl = document.getElementById('progress-percent');
    
    if (usernameEl) usernameEl.textContent = player.name;
    if (crystalCountEl) crystalCountEl.textContent = player.crystals;
    
    // Розраховуємо загальну кількість зірок
    const totalStars = Object.values(player.stars).reduce((sum, stars) => sum + stars, 0);
    if (totalStarsEl) totalStarsEl.textContent = totalStars;
    
    // Розраховуємо загальний рахунок
    const totalScore = Object.values(player.scores).reduce((sum, score) => sum + score, 0);
    if (totalScoreEl) totalScoreEl.textContent = totalScore;
    
    // Розраховуємо прогрес
    const completedCount = player.completed.length;
    const totalLevels = GAME_CONFIG.levels.length;
    const percent = Math.round((completedCount / totalLevels) * 100);
    
    if (progressFillEl) progressFillEl.style.width = percent + '%';
    if (progressTextEl) progressTextEl.textContent = `${completedCount}/${totalLevels}`;
    if (progressPercentEl) progressPercentEl.textContent = `${percent}%`;
}

// Відображення рівнів
function renderLevels() {
    const container = document.getElementById('levels-grid');
    if (!container) {
        console.error('Не знайдено контейнер для рівнів!');
        return;
    }
    
    container.innerHTML = '';
    
    GAME_CONFIG.levels.forEach(level => {
        const isUnlocked = level.id === 1 || player.completed.includes(level.id - 1);
        const stars = player.stars[level.id] || 0;
        const score = player.scores[level.id] || 0;
        
        const levelCard = document.createElement('div');
        levelCard.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
        levelCard.style.borderColor = isUnlocked ? level.color : '#666';
        
        levelCard.innerHTML = `
            <div class="level-number">${level.id}</div>
            <div class="level-emoji">${level.emoji}</div>
            <div class="level-title">${level.title}</div>
            
            ${isUnlocked ? `
            <div class="level-stars">
                ${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}
            </div>
            <div class="level-score" style="color: ${level.color}">💎 ${score}</div>
            ` : ''}
            
            <button class="level-button" 
                onclick="${isUnlocked ? `startLevel(${level.id})` : ''}"
                ${!isUnlocked ? 'disabled' : ''}
                style="background: linear-gradient(45deg, ${level.color}, ${level.color}80)">
                ${isUnlocked ? 'ГРАТИ' : '🔒 ЗАБЛОКОВАНО'}
            </button>
        `;
        
        container.appendChild(levelCard);
    });
}

// Запуск рівня
function startLevel(levelId) {
    const level = GAME_CONFIG.levels.find(l => l.id === levelId);
    if (!level) return;
    
    showMessage(`Завантаження: ${level.title}...`, 'info');
    
    // Тимчасово - перехід на заглушку
    setTimeout(() => {
        alert(`Запуск рівня ${levelId}\nНаразі в розробці`);
        // Пізніше: window.location.href = `levels/level${levelId}.html`;
    }, 1000);
}

// Завантаження лідерборду
async function loadLeaderboard() {
    try {
        const response = await fetch(GAME_CONFIG.apiUrl);
        const data = await response.json();
        
        if (data.status === 'success' && data.leaderboard) {
            renderLeaderboard(data.leaderboard);
        } else {
            showLocalLeaderboard();
        }
    } catch (error) {
        console.error('Помилка завантаження лідерборду:', error);
        showLocalLeaderboard();
    }
}

// Відображення лідерборду
function renderLeaderboard(leaderboardData) {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    
    container.innerHTML = '';
    
    leaderboardData.slice(0, 10).forEach((player, index) => {
        const row = document.createElement('div');
        row.className = 'leaderboard-row';
        
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : '';
        const isCurrent = player.name === player.name && player.class === player.class;
        
        if (isCurrent) row.classList.add('lb-you');
        
        row.innerHTML = `
            <div class="lb-rank">${index + 1}</div>
            <div class="lb-medal">${medal}</div>
            <div class="lb-name">
                ${player.name}
                <span class="lb-class">(${player.class})</span>
            </div>
            <div class="lb-score">💎 ${player.total || 0}</div>
        `;
        
        container.appendChild(row);
    });
}

// Локальний лідерборд (якщо сервер недоступний)
function showLocalLeaderboard() {
    const demoData = [
        { name: "Аліса", class: "6А", total: 1710 },
        { name: "Максим", class: "6Б", total: 1600 },
        { name: "Софія", class: "6В", total: 1480 },
        { name: "Тимур", class: "6А", total: 1360 },
        { name: player.name, class: player.class, total: player.crystals }
    ];
    
    renderLeaderboard(demoData);
}

// Показ повідомлень
function showMessage(text, type = 'info') {
    // Простий alert для початку
    alert(text);
}

// Збереження результатів
function saveLevelResults(levelId, score, stars) {
    if (!player.completed.includes(levelId)) {
        player.completed.push(levelId);
    }
    
    player.stars[levelId] = Math.max(player.stars[levelId] || 0, stars);
    player.scores[levelId] = Math.max(player.scores[levelId] || 0, score);
    player.crystals += score * 10 + stars * 50;
    
    // Зберігаємо в localStorage
    localStorage.setItem('playerName', player.name);
    localStorage.setItem('playerClass', player.class);
    localStorage.setItem('playerCrystals', player.crystals);
    localStorage.setItem('completedLevels', JSON.stringify(player.completed));
    localStorage.setItem('levelStars', JSON.stringify(player.stars));
    localStorage.setItem('levelScores', JSON.stringify(player.scores));
    
    // Оновлюємо відображення
    updatePlayerDisplay();
    renderLevels();
    
    // Надсилаємо на сервер
    sendToLeaderboard(score, GAME_CONFIG.levels[levelId - 1].theme);
}

// Надсилання на сервер
async function sendToLeaderboard(score, theme) {
    try {
        await fetch(GAME_CONFIG.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: player.name,
                class: player.class,
                theme: theme,
                points: score
            })
        });
    } catch (error) {
        console.error('Помилка відправки:', error);
    }
}

// Запуск при завантаженні
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
