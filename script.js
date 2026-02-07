// Конфігурація
const GAME_CONFIG = {
    // Замініть на ваш URL після публікації
    apiUrl: 'https://script.google.com/macros/s/AKfycbyCw1v0aK2h7_acX8brCUlzCeFU4RzZbCucH93LZy2jV4NvhTlB5Nz8URju7LlfZCw/exec',
    
    levels: [
        { id: 1, title: "Температура повітря", theme: "Температура", color: "#FF9500" },
        { id: 2, title: "Атмосферний тиск", theme: "Тиск", color: "#00FFFF" },
        { id: 3, title: "Вітер", theme: "Вітер", color: "#39FF14" },
        { id: 4, title: "Хмари та вологість", theme: "Хмари", color: "#C77DFF" },
        { id: 5, title: "Опади", theme: "Опади", color: "#0099FF" },
        { id: 6, title: "Підсумковий проект", theme: "Проект", color: "#FF4081" }
    ]
};

// Надсилання балів на сервер
async function saveScore(score, theme) {
    const playerData = {
        name: player.name,
        class: player.class,
        theme: theme,
        points: score
    };
    
    console.log('Надсилаємо дані:', playerData);
    
    try {
        const response = await fetch(GAME_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'no-cors', // Додайте це для обходу CORS
            body: JSON.stringify(playerData)
        });
        
        // Для no-cors режиму
        console.log('Дані надіслані успішно');
        return { status: 'success' };
        
    } catch (error) {
        console.error('Помилка:', error);
        // Зберігаємо локально
        saveScoreLocally(playerData);
        return { status: 'saved_locally' };
    }
}

// Локальне збереження (якщо сервер не працює)
function saveScoreLocally(data) {
    const key = `score_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(data));
    console.log('Збережено локально:', data);
}

// Завантаження лідерборду
async function loadLeaderboard() {
    try {
        const response = await fetch(GAME_CONFIG.apiUrl);
        const data = await response.json();
        
        if (data.status === 'success') {
            renderLeaderboard(data.leaderboard);
        } else {
            showLocalLeaderboard();
        }
    } catch (error) {
        console.error('Не вдалося завантажити лідерборд:', error);
        showLocalLeaderboard();
    }
}

// Показ локального лідерборду
function showLocalLeaderboard() {
    const localScores = [];
    
    // Збираємо всі локальні результати
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('score_')) {
            const scoreData = JSON.parse(localStorage.getItem(key));
            localScores.push(scoreData);
        }
    }
    
    // Групуємо по гравцях
    const players = {};
    localScores.forEach(score => {
        const key = `${score.name}_${score.class}`;
        if (!players[key]) {
            players[key] = {
                name: score.name,
                class: score.class,
                scores: {}
            };
        }
        players[key].scores[score.theme] = Math.max(
            players[key].scores[score.theme] || 0,
            score.points
        );
    });
    
    // Розраховуємо загальну суму
    const leaderboard = Object.values(players).map(player => {
        const total = Object.values(player.scores).reduce((sum, score) => sum + score, 0);
        return {
            name: player.name,
            class: player.class,
            total: total,
            ...player.scores
        };
    });
    
    // Сортуємо
    leaderboard.sort((a, b) => b.total - a.total);
    renderLeaderboard(leaderboard);
}
