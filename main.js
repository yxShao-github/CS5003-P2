// main.js
import express from 'express';
import gameRoutes from './src/routes/gameRoutes.js';
import {startGame} from "./src/controllers/gameController.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());

app.post('/api/game/start', startGame);

// Mount the game routes
app.use('/api/game', gameRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
