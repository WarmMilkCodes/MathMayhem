// public/script.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    // DOM Elements
    const mainMenu = document.getElementById('main-menu');
    const lobby = document.getElementById('lobby');
    const gameSection = document.getElementById('game');
    const scoreboard = document.getElementById('scoreboard');
    const playerNameInput = document.getElementById('playerName');
    const joinGameButton = document.getElementById('joinGameButton');
    const displayName = document.getElementById('displayName');
    const problemContainer = document.getElementById('problem');
    const answerInput = document.getElementById('answer');
    const submitAnswerButton = document.getElementById('submitAnswerButton');
    const playersList = document.getElementById('playersList');
    const playersListGame = document.getElementById('playersListGame');
    const timerDisplay = document.getElementById('time');
    const countdownDisplay = document.getElementById('countdown');
    const feedback = document.getElementById('feedback');
    const scoreTableBody = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
    const errorMessage = document.getElementById('error');
    const playAgainButton = document.getElementById('playAgainButton');

    let playerName = '';
    let hasAnswered = false;

    // Event Listeners
    joinGameButton.addEventListener('click', () => {
        const name = playerNameInput.value.trim();
        if (name === '') {
            displayError('Please enter a valid name.');
            return;
        }
        playerName = name;
        socket.emit('joinGame', playerName);
        displayName.textContent = `Player: ${playerName}`;
        mainMenu.style.display = 'none';
        lobby.style.display = 'block';
    });

    submitAnswerButton.addEventListener('click', () => {
        if (hasAnswered) {
            feedback.textContent = 'You have already answered this question.';
            return;
        }

        const answer = answerInput.value.trim();
        if (answer === '') {
            feedback.textContent = 'Please enter an answer.';
            return;
        }

        if (isNaN(answer)) {
            feedback.textContent = 'Please enter a numeric answer.';
            return;
        }

        // Submit the answer to the server
        socket.emit('submitAnswer', { problem: currentProblem, answer: Number(answer) });
        hasAnswered = true;
        feedback.textContent = 'Answer submitted!';
        submitAnswerButton.disabled = true;
    });

    playAgainButton.addEventListener('click', () => {
        // Reload the page to start a new game
        window.location.reload();
    });

    // Socket.io Event Handlers

    // Handle error messages
    socket.on('errorMessage', (msg) => {
        displayError(msg);
    });

    // Update player list in lobby
    socket.on('updatePlayerList', (playerNames) => {
        playersList.innerHTML = '';
        playerNames.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            playersList.appendChild(li);
        });
    });

    // Handle countdown before game starts
    socket.on('countdown', (remainingTime) => {
        lobby.style.display = 'block';
        gameSection.style.display = 'none';
        countdownDisplay.textContent = `Game starts in: ${remainingTime}s`;
    });

    // Handle game start
    socket.on('gameStarted', (data) => {
        lobby.style.display = 'none';
        gameSection.style.display = 'block';
        scoreboard.style.display = 'none';
        answerInput.value = '';
        answerInput.disabled = false;
        submitAnswerButton.disabled = false;
        feedback.textContent = '';
        hasAnswered = false;

        // Display the first problem
        problemContainer.textContent = data.problem;
        currentProblem = data.problem;
    });

    // Update game timer
    socket.on('gameTimer', (remainingTime) => {
        timerDisplay.textContent = remainingTime;
    });

    // Handle new problem
    socket.on('newProblem', (problem) => {
        problemContainer.textContent = problem.problem;
        currentProblem = problem.problem;
        answerInput.value = '';
        answerInput.disabled = false;
        submitAnswerButton.disabled = false;
        feedback.textContent = '';
        hasAnswered = false;
    });

    // Handle answer result
    socket.on('answerResult', (data) => {
        if (data.correct) {
            feedback.textContent = 'Correct!';
            feedback.style.color = 'green';
        } else {
            feedback.textContent = `Wrong! Correct Answer: ${data.correctAnswer}`;
            feedback.style.color = 'red';
        }
    });

    // Handle game over and display leaderboard
    socket.on('gameOver', (leaderboard) => {
        gameSection.style.display = 'none';
        scoreboard.style.display = 'block';
        scoreTableBody.innerHTML = '';

        leaderboard.forEach(player => {
            const row = scoreTableBody.insertRow();
            const nameCell = row.insertCell(0);
            const scoreCell = row.insertCell(1);
            nameCell.textContent = player.name;
            scoreCell.textContent = player.score;
        });
    });

    // Update player list in game section
    socket.on('updatePlayerList', (playerNames) => {
        playersListGame.innerHTML = '';
        playerNames.forEach(name => {
            const li = document.createElement('li');
            li.textContent = name;
            playersListGame.appendChild(li);
        });
    });

    // Utility Functions
    function displayError(msg) {
        errorMessage.textContent = msg;
        setTimeout(() => {
            errorMessage.textContent = '';
        }, 3000);
    }

    // Variable to store the current problem
    let currentProblem = null;
});
