const statusArea = document.getElementById('status-area');
const gameBoardElement = document.getElementById('game-board');
const restartBtn = document.getElementById('restart-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
// REMOVED: const changeNamesBtn = document.getElementById('change-names-btn');
const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');
const howToPlayModal = document.getElementById('how-to-play-modal');
const winnerModal = document.getElementById('winner-modal');
const winnerMessage = document.getElementById('winner-message');
const finalBoardDisplay = document.getElementById('final-board-display');

audio = new Audio("win.wav");

var mouseclick1 = new Audio();
mouseclick1.src = "S1.wav";
var mouseclick2 = new Audio();
mouseclick2.src = "S2.wav";

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
// Initialize playerNames based on initial input values
let playerNames = {
    'X': player1Input.value.trim() || 'Player 1',
    'O': player2Input.value.trim() || 'Player 2'
};
let playerMoves = { 'X': [], 'O': [] }; // Stores cell indices

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]  // Diagonals
];

function createBoard() {
    gameBoardElement.innerHTML = ''; // Clear previous board
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        gameBoardElement.appendChild(cell);
    }
}

function startGame() {
    // Update names from inputs at the very start of a new game
    playerNames['X'] = player1Input.value.trim() || 'Player 1';
    playerNames['O'] = player2Input.value.trim() || 'Player 2';

    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    playerMoves = { 'X': [], 'O': [] };
    updateStatus(); // Will use the names just read
    createBoard(); // Recreate board elements
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('winning', 'x', 'o', 'removing');
        cell.innerText = '';
    });
    hideModal('winner-modal');
}

function updateStatus() {
    if (gameActive) {
        statusArea.innerText = `${playerNames[currentPlayer]}'s Turn (${currentPlayer})`;
        statusArea.style.color = currentPlayer === 'X' ? 'var(--accent-color-x)' : 'var(--accent-color-o)';
    } else {
        // Handle status display after game ends if needed, currently handled by announceWinner
    }
}

function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.dataset.index);

    if (board[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    // --- Bolt Rule Implementation ---
    if (playerMoves[currentPlayer].length >= 3) {
        const oldestMoveIndex = playerMoves[currentPlayer].shift();
        board[oldestMoveIndex] = '';
        const cellToRemove = gameBoardElement.querySelector(`[data-index='${oldestMoveIndex}']`);
        if (cellToRemove) {
            cellToRemove.classList.add('removing');
            setTimeout(() => {
                if (cellToRemove) { // Check if still exists
                    cellToRemove.innerText = '';
                    cellToRemove.classList.remove('x', 'o', 'removing');
                }
            }, 500);
        }
    }
    // --- End Bolt Rule ---

    board[clickedCellIndex] = currentPlayer;
    clickedCell.innerText = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    playerMoves[currentPlayer].push(clickedCellIndex);

    checkResult();
}

function checkResult() {
    let roundWon = false;
    let winningLine = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const winCondition = winningConditions[i];
        let a = board[winCondition[0]];
        let b = board[winCondition[1]];
        let c = board[winCondition[2]];

        if (a === '' || b === '' || c === '') continue;
        if (a === b && b === c) {
            roundWon = true;
            winningLine = winCondition;
            break;
        }
    }

    if (roundWon) {
        announceWinner(currentPlayer, winningLine);
        gameActive = false;
        return;
    }

    if (!board.includes('')) {
        announceWinner('Draw');
        gameActive = false;
        return;
    }

    switchPlayer();
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
}

function announceWinner(winner, winningLine = []) {
    let message = '';
    if (winner === 'Draw') {
        message = "It's a Draw!";
        statusArea.innerText = message;
        statusArea.style.color = 'var(--text-color)';
    } else {
        // Ensure latest names are used for the announcement
        playerNames['X'] = player1Input.value.trim() || 'Player 1';
        playerNames['O'] = player2Input.value.trim() || 'Player 2';
        message = `${playerNames[winner]} Wins!`;
        statusArea.innerText = message;
        statusArea.style.color = winner === 'X' ? 'var(--accent-color-x)' : 'var(--accent-color-o)';

        winningLine.forEach(index => {
            const cell = gameBoardElement.querySelector(`[data-index='${index}']`);
            if (cell) cell.classList.add('winning');
        });
    }

    winnerMessage.innerText = message;
    displayFinalBoard(winningLine);
    audio.play().catch(error => {
        console.log("Audio playback failed:", error);
    });
    showModal('winner-modal');
}

function displayFinalBoard(winningLine) {
    finalBoardDisplay.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const miniCell = document.createElement('div');
        miniCell.classList.add('mini-cell');
        if (board[i]) {
            miniCell.innerText = board[i];
            miniCell.classList.add(board[i].toLowerCase());
        }
        if (winningLine.includes(i)) {
            miniCell.classList.add('winning');
        }
        finalBoardDisplay.appendChild(miniCell);
    }
}

// REMOVED: function handleNameChange() { ... }

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        void modal.offsetWidth; // Force reflow
        modal.style.opacity = 1;
        modal.style.visibility = 'visible';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
     if (modal) {
        modal.style.opacity = 0;
        modal.style.visibility = 'hidden';
        // Using timeout matching transition duration to hide completely
         setTimeout(() => {
             if (modal.style.opacity == 0) modal.classList.add('hidden');
         }, 400);
    }
}

// --- NEW: Add input event listeners for live name updates ---
player1Input.addEventListener('input', () => {
    const p1Name = player1Input.value.trim();
    playerNames['X'] = p1Name === '' ? 'Player 1' : p1Name;
    // Update status immediately only if game is active and it's X's turn
    if (gameActive && currentPlayer === 'X') {
        updateStatus();
    }
});

player2Input.addEventListener('input', () => {
    const p2Name = player2Input.value.trim();
    playerNames['O'] = p2Name === '' ? 'Player 2' : p2Name;
    // Update status immediately only if game is active and it's O's turn
    if (gameActive && currentPlayer === 'O') {
        updateStatus();
    }
});
// --- End of new listeners ---

// Event Listeners
restartBtn.addEventListener('click', startGame);
howToPlayBtn.addEventListener('click', () => showModal('how-to-play-modal'));
// REMOVED: changeNamesBtn event listener

// Close modal if clicking outside the content area
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        hideModal(event.target.id);
    }
});

// Initial setup
startGame(); // Calls createBoard and updateStatus
