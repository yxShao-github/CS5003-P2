// src/routes/gameRoutes.js
import express from 'express';
import { startGame, joinGame, viewGameState, buildFence } from '../controllers/gameController.js';

const router = express.Router();

// Route to start a new game
router.post('/start', startGame);

// Route for a player to join an existing game
router.post('/join', joinGame);

// Route to get the current state of the game
router.get('/state', viewGameState);

// Route to build a fence
router.post('/build', buildFence);

export default router;
