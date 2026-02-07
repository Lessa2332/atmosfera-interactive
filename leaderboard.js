// Завантаження лідерборду
async function loadLeaderboard() {
    try {
        const response = await fetch(`${GAME_CONFIG.apiUrl}?action=get`);
        const data = await response.json();
        
        if (data.status === 'success') {
            renderLeaderboard(data.leaderboard);
        }
    } catch (error) {
        console.error('Помилка завантаження лідерборду:', error);
        // Показуємо демо-дані
        renderLeaderboard(getDemoLeaderboard());
    }
}

// Відображення лідерборду
function renderLeaderboard(leaderboardData) {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    
    // Сортуємо за загальним рахунком (колонка I, індекс 8)
    leaderboardData.sort((a, b) => (b[8] || 0) - (a[8] || 0));
    
    container.innerHTML = '';
    
    leaderboardData.slice(0, 10).forEach((row, index) => {
        const name = row[0] || 'Невідомий';
        const score = row[8] || 0;
        const userClass = row[1] || '';
        
        const isCurrentPlayer = name === player.name && userClass === player.class;
        
        const rowElement = document.createElement('div');
        rowElement.className = `leaderboard-row ${isCurrentPlayer ? 'lb-you' : ''}`;
        
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : '';
        
        rowElement.innerHTML = `
            <div class="lb-rank">${index + 1}</div>
            <div class="lb-medal">${medal}</div>
            <div class="lb-name">
                ${name}
                ${userClass ? `<span class="lb-class">(${userClass})</span>` : ''}
            </div>
            <div class="lb-score">💎 ${score}</div>
        `;
        
        container.appendChild(rowElement);
    });
}

// Демо-дані для лідерборду
function getDemoLeaderboard() {
    return [
        [player.name, player.class, 100, 150, 200, 120, 180, 250, player.totalScore],
        ["Аліса", "6А", 300, 280, 250, 270, 290, 320, 1710],
        ["Максим", "6Б", 280, 260, 240, 250, 270, 300, 1600],
        ["Софія", "6В", 250, 240, 230, 220, 260, 280, 1480],
        ["Тимур", "6А", 200, 220, 210, 230, 240, 260, 1360]
    ];
}

// Автоматичне оновлення лідерборду кожні 30 секунд
setInterval(loadLeaderboard, 30000);
