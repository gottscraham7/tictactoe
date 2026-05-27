class TicTacToeGame {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.player1Name = 'Player 1';
    this.player2Name = 'Player 2';
    this.player1Score = 0;
    this.player2Score = 0;
    this.startTime = null;
    this.timerInterval = null;
    this.gameTime = 0;

    this.winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];

    this.initDOM();
    this.setupEventListeners();
  }

  initDOM() {
    this.setupModal = document.getElementById('setupModal');
    this.gameContainer = document.getElementById('gameContainer');
    this.winModal = document.getElementById('winModal');
    this.board_cells = document.querySelectorAll('.cell');
    this.turnDisplay = document.getElementById('turnDisplay');
    this.p1NameDisplay = document.getElementById('p1Name');
    this.p2NameDisplay = document.getElementById('p2Name');
    this.p1ScoreDisplay = document.getElementById('p1Score');
    this.p2ScoreDisplay = document.getElementById('p2Score');
    this.timerDisplay = document.getElementById('timer');
    this.winMessage = document.getElementById('winMessage');
    this.winStats = document.getElementById('winStats');
    this.explosionCanvas = document.getElementById('explosionCanvas');
    this.ctx = this.explosionCanvas.getContext('2d');
    this.setupCanvasSize();
  }

  setupCanvasSize() {
    this.explosionCanvas.width = window.innerWidth;
    this.explosionCanvas.height = window.innerHeight;
    window.addEventListener('resize', () => this.setupCanvasSize());
  }

  setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetBoard());
    document.getElementById('resetScoreBtn').addEventListener('click', () => this.resetScore());
    document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
    document.getElementById('nextRoundBtn').addEventListener('click', () => this.resetBoard());

    this.board_cells.forEach((cell, index) => {
      cell.addEventListener('click', () => this.cellClick(index));
    });

    document.getElementById('player1Name').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('startBtn').click();
    });
    document.getElementById('player2Name').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('startBtn').click();
    });
  }

  startGame() {
    const p1Input = document.getElementById('player1Name').value.trim();
    const p2Input = document.getElementById('player2Name').value.trim();

    if (!p1Input || !p2Input) {
      alert('Please enter both player names!');
      return;
    }

    this.player1Name = p1Input;
    this.player2Name = p2Input;

    this.setupModal.classList.add('hidden');
    this.gameContainer.classList.remove('hidden');

    this.p1NameDisplay.textContent = this.player1Name;
    this.p2NameDisplay.textContent = this.player2Name;

    this.resetBoard();
    this.startTimer();
  }

  startTimer() {
    this.startTime = Date.now();
    this.gameTime = 0;

    this.timerInterval = setInterval(() => {
      this.gameTime = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      this.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 100);
  }

  cellClick(index) {
    if (!this.gameActive || this.board[index] !== null) return;

    this.board[index] = this.currentPlayer;
    this.board_cells[index].textContent = this.currentPlayer;
    this.board_cells[index].classList.add(this.currentPlayer.toLowerCase());
    this.board_cells[index].classList.add('taken');

    const result = this.checkWinner();

    if (result === 'win') {
      this.endGame('win');
    } else if (result === 'draw') {
      this.endGame('draw');
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.updateTurnDisplay();
    }
  }

  checkWinner() {
    for (let combo of this.winningCombinations) {
      const [a, b, c] = combo;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.highlightWinningCells(combo);
        return 'win';
      }
    }

    if (this.board.every(cell => cell !== null)) {
      return 'draw';
    }

    return null;
  }

  highlightWinningCells(combo) {
    combo.forEach(index => {
      this.board_cells[index].classList.add('winner');
    });
  }

  endGame(result) {
    this.gameActive = false;
    clearInterval(this.timerInterval);

    if (result === 'win') {
      const winner = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
      const winnerScore = this.currentPlayer === 'X' ? ++this.player1Score : ++this.player2Score;

      this.p1ScoreDisplay.textContent = this.player1Score;
      this.p2ScoreDisplay.textContent = this.player2Score;

      this.winMessage.textContent = `🎉 ${winner} Wins! 🎉`;
      const minutes = Math.floor(this.gameTime / 60);
      const seconds = this.gameTime % 60;
      this.winStats.textContent = `Winning player: ${winner} | Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;

      this.createExplosion();
    } else {
      this.winMessage.textContent = "🤝 It's a Draw! 🤝";
      this.winStats.textContent = `Game ended in a tie!`;
    }

    this.winModal.classList.remove('hidden');
  }

  createExplosion() {
    const particleCount = 50;
    const centerX = this.explosionCanvas.width / 2;
    const centerY = this.explosionCanvas.height / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 5 + Math.random() * 5;
      const color = ['#fbbf24', '#6366f1', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)];

      this.animateParticle(centerX, centerY, angle, velocity, color);
    }

    // Confetti effect
    setTimeout(() => this.createConfetti(), 200);
  }

  animateParticle(x, y, angle, velocity, color) {
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;
    let opacity = 1;
    let currentX = x;
    let currentY = y;

    const animate = () => {
      currentX += vx;
      currentY += vy;
      opacity -= 0.02;

      if (opacity > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(currentX, currentY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        requestAnimationFrame(animate);
      } else {
        this.ctx.clearRect(0, 0, this.explosionCanvas.width, this.explosionCanvas.height);
      }
    };

    animate();
  }

  createConfetti() {
    const confettiPieces = 30;
    for (let i = 0; i < confettiPieces; i++) {
      const x = Math.random() * this.explosionCanvas.width;
      const y = -10;
      const vx = (Math.random() - 0.5) * 8;
      const vy = 3 + Math.random() * 4;
      const color = ['#fbbf24', '#6366f1', '#ec4899'][Math.floor(Math.random() * 3)];

      this.fallConfetti(x, y, vx, vy, color);
    }
  }

  fallConfetti(x, y, vx, vy, color) {
    let currentY = y;
    let currentX = x;
    let rotation = 0;

    const animate = () => {
      currentX += vx;
      currentY += vy;
      rotation += 5;

      if (currentY < this.explosionCanvas.height) {
        this.ctx.save();
        this.ctx.translate(currentX, currentY);
        this.ctx.rotate((rotation * Math.PI) / 180);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-5, -5, 10, 10);
        this.ctx.restore();

        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  updateTurnDisplay() {
    const currentName = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
    const symbol = this.currentPlayer === 'X' ? '⭕' : '❌';
    this.turnDisplay.textContent = `${symbol} ${currentName}'s Turn`;
  }

  resetBoard() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.gameTime = 0;

    this.board_cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('x', 'o', 'taken', 'winner');
    });

    this.winModal.classList.add('hidden');
    this.ctx.clearRect(0, 0, this.explosionCanvas.width, this.explosionCanvas.height);
    this.updateTurnDisplay();
    this.startTimer();
  }

  resetScore() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.p1ScoreDisplay.textContent = '0';
    this.p2ScoreDisplay.textContent = '0';
    this.resetBoard();
  }

  newGame() {
    clearInterval(this.timerInterval);
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameActive = true;
    this.player1Score = 0;
    this.player2Score = 0;
    this.gameTime = 0;

    this.setupModal.classList.remove('hidden');
    this.gameContainer.classList.add('hidden');
    this.winModal.classList.add('hidden');

    document.getElementById('player1Name').value = '';
    document.getElementById('player2Name').value = '';

    this.board_cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('x', 'o', 'taken', 'winner');
    });

    this.ctx.clearRect(0, 0, this.explosionCanvas.width, this.explosionCanvas.height);
    this.timerDisplay.textContent = '0:00';
  }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new TicTacToeGame();
});
