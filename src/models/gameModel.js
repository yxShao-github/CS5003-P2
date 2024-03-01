// src/models/gameModel.js
import { nanoid } from 'nanoid';

// 存储当前所有游戏的状态
const games = {};

// 创建新游戏
export const createGame = () => {
    const gameId = nanoid();
    games[gameId] = {
        id: gameId,
        players: [],
        grid: initializeGrid(),
        currentPlayerIndex: 0,
        scores: {}
    };
    return games[gameId];
};

// 玩家加入游戏
export const addPlayer = (gameId, playerId) => {
    const game = games[gameId];
    if (!game) throw new Error('Game not found');

    const player = { id: playerId, name: `Player ${game.players.length + 1}` };
    game.players.push(player);
    game.scores[playerId] = 0; // 初始化玩家得分
    return game;
};

// 获取游戏状态
export const getGameState = (gameId) => {
    return games[gameId];
};

// 玩家建造栅栏并尝试占领土地
// 假设grid是一个4x4的点阵，我们用一个数组来存储栅栏的位置信息
// 每个栅栏表示为一个字符串，格式为"startX,startY-endX,endY"，例如"1,1-1,2"

// 更新makeMove函数以处理栅栏建造
export const makeMove = (gameId, playerId, start, end) => {
    const game = games[gameId];
    if (!game) throw new Error('Game not found');

    const currentPlayer = game.players[game.currentPlayerIndex];
    if (currentPlayer.id !== playerId) throw new Error('Not your turn');

    const fence = `${start.x},${start.y}-${end.x},${end.y}`;
    if (isFenceExists(game.grid, fence)) throw new Error('Fence already exists');

    addFence(game.grid, fence);

    const isLandClaimed = checkLandEnclosure(game.grid);
    if (isLandClaimed) {
        game.scores[playerId] += isLandClaimed; // 更新得分
    } else {
        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
    }

    return game;
};

// 检查栅栏是否已存在
const isFenceExists = (grid, fence) => {
    return grid.includes(fence);
};

// 在网格上添加栅栏
const addFence = (grid, fence) => {
    grid.push(fence);
};

// 检查是否完成土地围绕
// 检查是否完成土地围绕，并返回占领的土地数量
const checkLandEnclosure = (grid) => {
    let claimedLands = 0;

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
            if (fences.every(fence => grid.includes(fence))) {
                claimedLands++;
            }
        }
    }

    return claimedLands;
};



// 初始化网格
const initializeGrid = () => {
    // 在这个游戏中，网格被视为一个4x4的点阵，玩家可以在相邻点之间建造栅栏。
    // 栅栏由连接两个相邻点的线段表示，每个栅栏存储为一个字符串，格式为"startX,startY-endX,endY"。
    // 例如，栅栏"1,1-1,2"表示从点(1,1)到点(1,2)的栅栏。
    // 游戏开始时，没有任何栅栏被建造，所以我们初始化一个空数组来存储玩家将要建造的栅栏。

    return []; // 初始化一个空数组，用于存储建造的栅栏
};

