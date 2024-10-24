// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from 'public' directory
app.use(express.static('public'));

// Game Configuration
const MIN_PLAYERS = 2; // Minimum players to start the game
const COUNTDOWN_TIME = 10; // Countdown duration in seconds
const GAME_DURATION = 120; // Total game time in seconds

// Game State
let players = {}; // { socket.id: { name: string, score: number } }
let gameStarted = false;
let countdownTimer = null;
let gameTimer = null;

// Function to generate a random math problem
function generateMathProblem() {
    const operations = ['+', '-', '*'];
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operation = operations[Math.floor(Math.random() * operations.length)];

    let answer;
    switch (operation) {
        case '+':
            answer = num1 + num2;
            break;
        case '-':
            answer = num1 - num2;
            break;
        case '*':
            answer = num1 * num2;
            break;
    }

    return { problem: `${num1} ${operation} ${num2}`, answer };
}

// Function to start the countdown before the game begins
function startCountdown() {
    let remaining = COUNTDOWN_TIME;
    io.emit('countdown', remaining);

    countdownTimer = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            io.emit('countdown', remaining);
        } else {
            clearInterval(countdownTimer);
            startGame();
        }
    }, 1000);
}

// Function to start the game
function startGame() {
    gameStarted = true;
    io.emit('gameStarted', { duration: GAME_DURATION });

    // Start the game timer
    let remaining = GAME_DURATION;
    gameTimer = setInterval(() => {
        remaining--;
        if (remaining >= 0) {
            io.emit('gameTimer', remaining);
        }

        if (remaining === 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }, 1000);
}

// Function to end the game and display the leaderboard
function endGame() {
    gameStarted = false;
    const leaderboard = Object.values(players).sort((a, b) => b.score - a.score);
    io.emit('gameOver', leaderboard);
    // Reset players' scores for the next game
    Object.keys(players).forEach((id) => {
        players[id].score = 0;
    });
}

// Handle new socket connections
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // Handle player joining the game
    socket.on('joinGame', (playerName) => {
        if (gameStarted) {
            socket.emit('errorMessage', 'Game already in progress. Please wait for the next round.');
            return;
        }

        if (!playerName || playerName.trim() === '') {
            socket.emit('errorMessage', 'Invalid name. Please enter a valid name.');
            return;
        }

        // Add player to the players object
        players[socket.id] = {
            name: playerName.trim(),
            score: 0,
        };

        // Notify all players about the updated player list
        io.emit('updatePlayerList', Object.values(players).map(p => p.name));

        // If minimum players are reached and countdown hasn't started, begin countdown
        if (Object.keys(players).length >= MIN_PLAYERS && !countdownTimer && !gameStarted) {
            startCountdown();
        }
    });

    // Handle answer submission
    socket.on('submitAnswer', (data) => {
        if (!gameStarted) {
            socket.emit('errorMessage', 'Game has not started yet.');
            return;
        }

        const player = players[socket.id];
        if (!player) {
            socket.emit('errorMessage', 'Player not found.');
            return;
        }

        const { problem, answer } = data;

        // Validate the answer
        if (answer === problem.answer) {
            player.score += 1;
            socket.emit('answerResult', { correct: true });
        } else {
            socket.emit('answerResult', { correct: false, correctAnswer: problem.answer });
        }

        // Send the next problem
        const nextProblem = generateMathProblem();
        socket.emit('newProblem', nextProblem);
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        // Remove player from the players object
        delete players[socket.id];
        // Notify all players about the updated player list
        io.emit('updatePlayerList', Object.values(players).map(p => p.name));
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
