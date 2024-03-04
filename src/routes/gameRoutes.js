// src/routes/gameRoutes.js
import express from 'express';
import { joinGame, startGame, placeFence, getGameState, leaveGame } from '../controllers/gameController.js';

const router = express.Router();

// 玩家加入游戏
router.post('/join', joinGame);

// 开始游戏
router.post('/start', startGame);

// 玩家放置栅栏
router.post('/place-fence', placeFence);

// 获取当前游戏状态
router.get('/state', getGameState);

// 玩家离开游戏
router.post('/leave', leaveGame);

export default router;
