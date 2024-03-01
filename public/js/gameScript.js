document.addEventListener('DOMContentLoaded', () => {
    const gameBoard = document.getElementById('gameBoard');
    initializeGameBoard();

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
            currentGameId = data.gameId;
            currentPlayerId = data.playerId; // Assume the server returns a playerId for the game starter
            gameState = data.gameState;
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
                body: JSON.stringify({ gameId: currentGameId, playerId: currentPlayerId, start, end }),
            });
            const data = await response.json();
            if (data.success) {
                fetchGameState(); // Update game state after successfully building a fence
            } else {
                console.error('Failed to build fence:', data.message);
            }
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
