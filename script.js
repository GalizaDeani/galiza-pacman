const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const resultBox = document.getElementById('result');
const resultTitle = document.getElementById('result-title');
const finalScore = document.getElementById('final-score');

const CELL = 30; // ukuran tiap kotak grid dalam pixel
const COLS = 12;
const ROWS = 12;

// 0 = jalan + dot, 1 = tembok, 2 = jalan kosong (sudah dimakan)
const mazeLayout = [
  [1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,1],
  [1,0,1,0,0,0,0,0,1,0,0,1],
  [1,0,0,0,1,1,1,0,1,1,0,1],
  [1,1,1,0,1,0,0,0,0,1,0,1],
  [1,0,0,0,0,0,1,1,0,0,0,1],
  [1,0,1,1,1,0,1,0,0,1,0,1],
  [1,0,0,0,1,0,1,0,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,1,1,0,1,1,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1],
];

let maze = [];
let pacman = { x: 1, y: 1, dir: 'right' };
let ghosts = [];
let score = 0;
let lives = 3;
let totalDots = 0;
let isRunning = false;
let gameLoop = null;

function resetGame() {
  maze = mazeLayout.map(row => [...row]);
  pacman = { x: 1, y: 1, dir: 'right' };
  ghosts = [
    { x: 10, y: 1, color: '#f85149' },
    { x: 10, y: 10, color: '#a371f7' }
  ];
  score = 0;
  lives = 3;
  totalDots = maze.flat().filter(cell => cell === 0).length;
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

function drawMaze() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const cell = maze[y][x];
      if (cell === 1) {
        ctx.fillStyle = '#1f6feb';
        ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
      } else if (cell === 0) {
        ctx.fillStyle = '#e6edf3';
        ctx.beginPath();
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawPacman() {
  ctx.fillStyle = '#f2cc0d';
  ctx.beginPath();
  ctx.arc(
    pacman.x * CELL + CELL / 2,
    pacman.y * CELL + CELL / 2,
    CELL / 2 - 3, 0.25 * Math.PI, 1.75 * Math.PI
  );
  ctx.lineTo(pacman.x * CELL + CELL / 2, pacman.y * CELL + CELL / 2);
  ctx.fill();
}

function drawGhosts() {
  ghosts.forEach(ghost => {
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(ghost.x * CELL + CELL / 2, ghost.y * CELL + CELL / 2, CELL / 2 - 4, Math.PI, 0);
    ctx.lineTo(ghost.x * CELL + CELL - 4, ghost.y * CELL + CELL - 4);
    ctx.lineTo(ghost.x * CELL + 4, ghost.y * CELL + CELL - 4);
    ctx.fill();
  });
}

function canMove(x, y) {
  if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
  return maze[y][x] !== 1;
}

function movePacman(dx, dy) {
  const newX = pacman.x + dx;
  const newY = pacman.y + dy;
  if (canMove(newX, newY)) {
    pacman.x = newX;
    pacman.y = newY;

    if (maze[newY][newX] === 0) {
      maze[newY][newX] = 2;
      score += 10;
      scoreEl.textContent = score;

      if (score >= totalDots * 10) {
        endGame(true);
      }
    }
  }
}

function moveGhosts() {
  ghosts.forEach(ghost => {
    const directions = [[0,1],[0,-1],[1,0],[-1,0]];
    const valid = directions.filter(([dx, dy]) => canMove(ghost.x + dx, ghost.y + dy));
    if (valid.length > 0) {
      const [dx, dy] = valid[Math.floor(Math.random() * valid.length)];
      ghost.x += dx;
      ghost.y += dy;
    }
  });
}

function checkGhostCollision() {
  const hit = ghosts.some(ghost => ghost.x === pacman.x && ghost.y === pacman.y);
  if (hit) {
    lives--;
    livesEl.textContent = lives;
    if (lives <= 0) {
      endGame(false);
    } else {
      pacman.x = 1;
      pacman.y = 1;
    }
  }
}

function gameTick() {
  moveGhosts();
  checkGhostCollision();
  drawMaze();
  drawGhosts();
  drawPacman();
}

function startGame() {
  isRunning = true;
  resetGame();
  startBtn.classList.add('hidden');
  resultBox.classList.add('hidden');
  drawMaze();
  drawGhosts();
  drawPacman();

  gameLoop = setInterval(gameTick, 500);
}

function endGame(won) {
  isRunning = false;
  clearInterval(gameLoop);

  resultTitle.textContent = won ? 'You Win! 🎉' : 'Game Over 💀';
  finalScore.textContent = `Final score: ${score}`;
  resultBox.classList.remove('hidden');
}

document.addEventListener('keydown', (e) => {
  if (!isRunning) return;

  switch (e.key) {
    case 'ArrowUp': movePacman(0, -1); break;
    case 'ArrowDown': movePacman(0, 1); break;
    case 'ArrowLeft': movePacman(-1, 0); break;
    case 'ArrowRight': movePacman(1, 0); break;
  }
  drawMaze();
  drawGhosts();
  drawPacman();
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
  startBtn.classList.remove('hidden');
  resultBox.classList.add('hidden');
});
