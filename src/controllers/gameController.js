// src/controllers/gameController.js
const gameData = {
    players: [],
    fences: [],
    turn: null,
    gameState: 'waiting', // 可能的状态包括 'waiting', 'started', 'finished'
    scores: {},
    lands: Array(4).fill().map(() => Array(4).fill(null)),
};

// 玩家加入游戏
export const joinGame = (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).send({ message: 'Player name is required' });
    }

    // 确保玩家名称唯一
    if (gameData.players.includes(name)) {
        return res.status(400).send({ message: 'Player name already exists' });
    }

    gameData.players.push(name);
    gameData.scores[name] = 0; // 初始化玩家分数

    // 如果是第一个加入的玩家，自动设置为当前回合
    if (gameData.players.length === 1) {
        gameData.turn = name;
    }

    res.send({ message: 'Player joined', playerName: name, gameState: gameData.gameState });
};

// 开始游戏
export const startGame = (req, res) => {
    if (gameData.gameState !== 'waiting') {
        return res.status(400).send({ message: 'Game cannot be started' });
    }

    gameData.gameState = 'started';
    res.send({ message: 'Game started', gameState: gameData.gameState });
};

// 验证栅栏是否可以放置的函数
function isValidFence(fence) {
    // 解析栅栏的起点和终点
    const [start, end] = fence.split("-");
    const [startX, startY] = start.split(",").map(Number);
    const [endX, endY] = end.split(",").map(Number);

    // 检查栅栏是否横向或纵向，并且长度为1
    if (!((startX === endX && Math.abs(startY - endY) === 1) || (startY === endY && Math.abs(startX - endX) === 1))) {
        return false;
    }

    // 检查栅栏是否已经被放置
    if (gameData.fences.includes(fence)) {
        return false;
    }

    return true;
}

function updateLandsAndScores(playerName, fence) {
    let claimedLands = 0;
    const grid = gameData.fences; // 存放已经放置的栅栏

    // 假设网格是4x4的，我们检查每个1x1区域是否被围绕
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            // 构造当前区域四周的栅栏标识
            const fences = [
                `${x},${y}-${x + 1},${y}`, // 上
                `${x},${y}-${x},${y + 1}`, // 左
                `${x + 1},${y}-${x + 1},${y + 1}`, // 右
                `${x},${y + 1}-${x + 1},${y + 1}` // 下
            ];

            // 检查是否所有的栅栏都存在
            if (fences.every(f => grid.includes(f))) {
                // 如果该区域尚未被占领，则更新土地占领状态和玩家分数
                if (gameData.lands[x][y] === null) {
                    gameData.lands[x][y] = playerName; // 更新为占领土地的玩家名字
                    gameData.scores[playerName] = (gameData.scores[playerName] || 0) + 1;
                    claimedLands++;
                }
            }
        }
    }

    // 如果玩家占领了至少一块土地，则允许他再次放置栅栏
    if (claimedLands > 0) {
        return true; // 表示玩家还可以继续放置栅栏
    } else {
        // 否则，轮到下一个玩家
        switchTurn();
        return false; // 表示轮到下一个玩家
    }
}

// 切换到下一个玩家的回合
function switchTurn() {
    const currentPlayerIndex = gameData.players.indexOf(gameData.turn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % gameData.players.length;
    gameData.turn = gameData.players[nextPlayerIndex];
}


// 玩家放置栅栏
export const placeFence = (req, res) => {
    const { playerName, fence } = req.body;
    if (gameData.turn !== playerName) {
        return res.status(403).send({ message: 'It is not your turn' });
    }

    if (!isValidFence(fence)) {
        return res.status(400).send({ message: 'Invalid fence placement' });
    }

    gameData.fences.push(fence);
    const canPlaceAnotherFence = updateLandsAndScores(playerName, fence);

    // 计算并声明获胜玩家的逻辑，移动到更新土地和分数逻辑之后
    const allLandsClaimed = gameData.lands.flat().every(land => land);
    if (allLandsClaimed) {
        gameData.gameState = 'finished';
        let winners = [];
        let highestScore = 0;

        Object.entries(gameData.scores).forEach(([player, score]) => {
            if (score > highestScore) {
                highestScore = score;
                winners = [player];
            } else if (score === highestScore) {
                winners.push(player);
            }
        });

        // 构造结束游戏的消息
        const endGameMessage = winners.length > 1 ?
            `Game finished with a tie between: ${winners.join(", ")}. Each with a score of ${highestScore}.` :
            `Game finished. Winner: ${winners[0]} with a score of ${highestScore}.`;

        // 发送游戏结束的响应
        return res.send({
            gameState: gameData.gameState,
            message: endGameMessage,
            winners,
            highestScore,
            scores: gameData.scores
        });
    }

    // 如果游戏未结束，发送当前操作的响应
    res.send({
        message: 'Fence placed',
        playerName,
        fence,
        canPlaceAnotherFence,
        gameState: gameData.gameState,
        scores: gameData.scores
    });
};


// 获取当前游戏状态
export const getGameState = (req, res) => {
    res.send({
        gameState: gameData.gameState,
        players: gameData.players,
        scores: gameData.scores,
        lands: gameData.lands, // 返回土地占有者信息
    });
};


// 玩家离开游戏
export const leaveGame = (req, res) => {
    const { playerName } = req.body;
    const index = gameData.players.indexOf(playerName);
    if (index > -1) {
        gameData.players.splice(index, 1);
        delete gameData.scores[playerName];

        // 如果当前轮到离开的玩家，需要转移回合
        if (gameData.turn === playerName) {
            switchTurn();
        }
    }

    // 如果游戏中只剩下一个玩家，则该玩家为获胜者
    if (gameData.players.length === 1 && gameData.gameState !== 'finished') {
        gameData.gameState = 'finished';
        const remainingPlayer = gameData.players[0];
        console.log(`Game finished. Winner: ${remainingPlayer} by default as the last player.`);
    } else if (gameData.players.length === 0) {
        // 如果所有玩家都离开了游戏，可以重置游戏状态
        resetGame();
    }

    res.send({ message: 'Player left', playerName, gameState: gameData.gameState });
};

// 重置游戏状态的函数，用于所有玩家都离开时
const resetGame = () => {
    gameData.players = [];
    gameData.fences = [];
    gameData.turn = null;
    gameData.gameState = 'waiting';
    gameData.scores = {};
    gameData.lands = Array(4).fill().map(() => Array(4).fill(null));
};


