// src/controllers/gameController.js
import { createGame, addPlayer, getGameState, makeMove } from '../models/gameModel.js';

export const startGame = async (req, res) => {
    try {
        const game = createGame(); // 创建新游戏并返回游戏ID
        res.status(200).json({ message: 'Game started', gameId: game.id });
    } catch (error) {
        res.status(500).json({ message: 'Error starting game', error: error.message });
    }
};

export const joinGame = async (req, res) => {
    // 根据请求中提供的信息加入游戏
    const { gameId, playerId } = req.body;
    try {
        const game = addPlayer(gameId, playerId);
        res.status(200).json({ message: 'Player joined', gameId: game.id, playerId });
    } catch (error) {
        res.status(500).json({ message: 'Error joining game', error: error.message });
    }
};

export const viewGameState = async (req, res) => {
    // 获取并返回游戏状态
    const { gameId } = req.query;
    try {
        const gameState = getGameState(gameId);
        res.status(200).json({ gameState });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching game state', error: error.message });
    }
};

export const buildFence = async (req, res) => {
    // 根据请求中的信息建造栅栏并更新游戏状态
    const { gameId, playerId, position } = req.body;
    try {
        const game = makeMove(gameId, playerId, position);
        res.status(200).json({ message: 'Fence built', game });
    } catch (error) {
        res.status(500).json({ message: 'Error building fence', error: error.message });
    }
};
