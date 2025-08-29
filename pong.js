// Get the canvas and context
const canvas = document.getElementById('pong-canvas');
const ctx = canvas.getContext('2d');

// Game constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 90;
const BALL_SIZE = 16;
const PLAYER_X = 20;
const AI_X = WIDTH - PLAYER_X - PADDLE_WIDTH;
const PADDLE_COLOR = "#fafafa";
const BALL_COLOR = "#f5b041";
const NET_COLOR = "#444";
const NET_WIDTH = 4;

// Game variables
let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let ballX = WIDTH / 2 - BALL_SIZE / 2;
let ballY = HEIGHT / 2 - BALL_SIZE / 2;
let ballSpeedX = Math.random() > 0.5 ? 5 : -5;
let ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
let playerScore = 0;
let aiScore = 0;
let isPaused = false;

// Mouse movement for player paddle
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  let mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp paddle within canvas
  if (playerY < 0) playerY = 0;
  if (playerY > HEIGHT - PADDLE_HEIGHT) playerY = HEIGHT - PADDLE_HEIGHT;
});

// Draw net
function drawNet() {
  ctx.fillStyle = NET_COLOR;
  for (let y = 0; y < HEIGHT; y += 30) {
    ctx.fillRect(WIDTH / 2 - NET_WIDTH / 2, y, NET_WIDTH, 18);
  }
}

// Draw paddles and ball
function draw() {
  // Clear
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Net
  drawNet();

  // Player Paddle
  ctx.fillStyle = PADDLE_COLOR;
  ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // AI Paddle
  ctx.fillStyle = PADDLE_COLOR;
  ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Ball
  ctx.fillStyle = BALL_COLOR;
  ctx.beginPath();
  ctx.arc(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();
}

// Ball movement and collision
function update() {
  if (isPaused) return;

  // Move ball
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Top/Bottom wall collision
  if (ballY <= 0 || ballY + BALL_SIZE >= HEIGHT) {
    ballSpeedY = -ballSpeedY;
    ballY = ballY <= 0 ? 0 : HEIGHT - BALL_SIZE;
  }

  // Player paddle collision
  if (
    ballX <= PLAYER_X + PADDLE_WIDTH &&
    ballY + BALL_SIZE >= playerY &&
    ballY <= playerY + PADDLE_HEIGHT
  ) {
    ballSpeedX = -ballSpeedX;
    // Add some variation depending on where it hits the paddle
    let collidePoint = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
    let norm = collidePoint / (PADDLE_HEIGHT / 2);
    ballSpeedY = norm * 5;
    ballX = PLAYER_X + PADDLE_WIDTH; // Avoid stuck
  }

  // AI paddle collision
  if (
    ballX + BALL_SIZE >= AI_X &&
    ballY + BALL_SIZE >= aiY &&
    ballY <= aiY + PADDLE_HEIGHT
  ) {
    ballSpeedX = -ballSpeedX;
    let collidePoint = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
    let norm = collidePoint / (PADDLE_HEIGHT / 2);
    ballSpeedY = norm * 5;
    ballX = AI_X - BALL_SIZE; // Avoid stuck
  }

  // Score check
  if (ballX < -BALL_SIZE) {
    // AI scores
    aiScore++;
    resetBall();
  } else if (ballX > WIDTH + BALL_SIZE) {
    // Player scores
    playerScore++;
    resetBall(true);
  }

  // Update score display
  document.getElementById('player-score').textContent = playerScore;
  document.getElementById('ai-score').textContent = aiScore;

  // AI move (simple: follow ball's center with easing)
  let aiCenter = aiY + PADDLE_HEIGHT / 2;
  let ballCenter = ballY + BALL_SIZE / 2;
  let diff = ballCenter - aiCenter;
  aiY += diff * 0.09; // AI speed factor
  // Clamp
  if (aiY < 0) aiY = 0;
  if (aiY > HEIGHT - PADDLE_HEIGHT) aiY = HEIGHT - PADDLE_HEIGHT;
}

// Reset ball to center after a score
function resetBall(playerServe = false) {
  ballX = WIDTH / 2 - BALL_SIZE / 2;
  ballY = HEIGHT / 2 - BALL_SIZE / 2;
  // Serve towards the scorer
  ballSpeedX = playerServe ? -5 : 5;
  // Randomize Y direction
  ballSpeedY = 3 * (Math.random() > 0.5 ? 1 : -1);
  aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
  isPaused = true;
  setTimeout(() => { isPaused = false; }, 900);
}

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();
