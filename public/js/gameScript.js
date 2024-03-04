document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    initializeGameBoard();

    // 绑定游戏面板的点击事件来建造栅栏
    gameBoard.addEventListener('click', event => {
        const cellIndex = Array.from(gameBoard.children).indexOf(event.target);
        if (cellIndex >= 0) {
            handleCellClick(cellIndex);
        }
    });

    document.getElementById('startGame').addEventListener('click', startGame);

    function initializeGameBoard() {
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'gameCell';
            gameBoard.appendChild(cell);
        }
    }

    function handleCellClick(cellIndex) {
        // 确定单元格在网格中的行和列
        const row = Math.floor(cellIndex / 4);
        const col = cellIndex % 4;

        // 根据点击的单元格确定栅栏的起点和终点
        let start, end;
        if (col < 3) { // 不是最右列，尝试在右侧建造栅栏
            start = { x: col + 1, y: row };
            end = { x: col + 1, y: row + 1 };
        } else if (row < 3) { // 最右列但不是最底行，尝试在下方建造栅栏
            start = { x: col, y: row + 1 };
            end = { x: col + 1, y: row + 1 };
        } else {
            // 最右列且是最底行，不执行操作
            return;
        }

        // 调用建造栅栏的函数
        buildFence(start, end);
    }

    let currentGameId = null;
    let currentPlayerId = null;

    async function fetchGameState() {
        try {
            const response = await fetch(`/api/game/state?gameId=${currentGameId}`);
            const data = await response.json();
            if (!data.gameState) {
                throw new Error('Game state not found in response');
            }
            gameState = data.gameState;
            updateUI(gameState);
        } catch (error) {
            console.error('Failed to fetch game state:', error);
        }
    }

    async function startGame() {
        try {
            const response = await fetch('/api/game/start', { method: 'POST' });
            const data = await response.json();
            if (!data.gameId || !data.playerId) {
                throw new Error('Game ID or Player ID not found in response');
            }
            currentGameId = data.gameId;
            currentPlayerId = data.playerId; // 保存从后端获取的 playerId
            fetchGameState();
        } catch (error) {
            console.error('Failed to start game:', error);
        }
    }

    async function buildFence(start, end) {
        try {
            const response = await fetch('/api/game/build', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameId: currentGameId, playerId: currentPlayerId, position: { start, end } }),
            });
            const data = await response.json();
            if (!data.message) {
                throw new Error('Unexpected response from server');
            }
            fetchGameState(); // 成功建造栅栏后更新游戏状态
        } catch (error) {
            console.error('Error building fence:', error);
        }
    }


    function updateUI(gameState) {
        // 更新UI，显示游戏状态、得分等
        document.getElementById('playerScore').textContent = `Player Score: ${gameState.scores[currentPlayerId] || 0}`;
        document.getElementById('currentTurn').textContent = `Current Turn: Player ${gameState.currentPlayerIndex + 1}`;
        // 此处还可以添加更多UI更新逻辑，如显示栅栏位置等
    }

});
