document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const gameSection = document.getElementById('game');
    const playerNameInput = document.getElementById('playerName');
    const setNameButton = document.getElementById('setNameButton');
    const displayName = document.getElementById('displayName');
    const joinGameButton = document.getElementById('joinGameButton');
    const problemContainer = document.getElementById('problem');
    const answerInput = document.getElementById('answer');
    const submitAnswerButton = document.getElementById('submitAnswerButton');

    let playerName = '';
    let currentProblemIndex = 0;
    let score = 0;
    let problems = [];
    let countdownTimer = null;

    let players = [
        { name: 'Player 1', score: 0 },
        { name: 'Player 2', score: 0 }
    ];

    function setPlayerName() {
        playerName = playerNameInput.value;
        console.log(`Player name set to: ${playerName}`);
        displayName.textContent = `Player: ${playerName}`;
    }

    function joinGame() {
        console.log(`${playerName} is trying to join a game...`);
        players.push({ name: playerName, score: 0});
        updatePlayerList();
        fetchOrCreateLobby();
    }

    function fetchOrCreateLobby() {
        console.log('Fetching or creating a lobby...');
        if (players.length === 1) {
            console.log("Waiting for additional players...");
        } else if (players.length === 2) {
            startCountdown(10);
        }
    }

    function startGame() {
        console.log('Starting game...');
    if (players.length >= 2) {
        mainMenu.style.display = 'none';
        gameSection.style.display = 'block';
        problems = generateMathProblems(5);
        displayNextProblem();
    } else {
        displayName.textContent = 'Not enough players to start the game.';
        }
    }

    function updatePlayerList() {
        playersList.innerHTML = '';
        players.forEach(player => {
            const playerItem = document.createElement('li');
            playerItem.textContent = player.name;
            playersList.appendChild(playerItem)
        });
    }

    function generateMathProblems(numberOfProblems) {
        const operations = ['+', '-', '*'];
        for (let i = 0; i < numberOfProblems; i++) {
            const num1 = Math.floor(Math.random() * 10) + 1;
            const num2 = Math.floor(Math.random() * 10) + 1;
            const operation = operations[Math.floor(Math.random() * operations.length)];
            const answer = eval(`${num1} ${operation} ${num2}`);
            problems.push({ problem: `${num1} ${operation} ${num2}`, answer: answer });
        }
        return problems;
    }

    function displayNextProblem() {
        if (currentProblemIndex < problems.length) {
            problemContainer.textContent = problems[currentProblemIndex].problem;
        } else {
            console.log('Game over!');
            console.log(`Final score: ${score}`);
            displayScore();
        }
    }

    function submitAnswer() {
        const userAnswer = Number(answerInput.value);
        if (userAnswer === problems[currentProblemIndex].answer) {
            console.log('Correct answer!');
            players[0].score++; // Assume current player is Player 1
        } else {
            console.log('Wrong answer!');
        }
        currentProblemIndex++;
        displayNextProblem();

        answerInput.value = ''; // Clear the input box after submitting the answer
    }

    function displayScore() {
        const scoreboard = document.getElementById('scoreboard');
        const scoreTableBody = document.getElementById('scoreTable').getElementsByTagName('tbody')[0];
        scoreTableBody.innerHTML = '';  // Clear existing rows

        players.forEach(player => {
            let row = scoreTableBody.insertRow();
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            cell1.textContent = player.name;
            cell2.textContent = player.score;
        });

        scoreboard.style.display = 'block';  // Show scoreboard
    }

    setNameButton.addEventListener('click', setPlayerName);
    joinGameButton.addEventListener('click', joinGame);
    submitAnswerButton.addEventListener('click', submitAnswer);
});
