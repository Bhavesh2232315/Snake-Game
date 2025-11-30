// ======== GAME CONFIG & STATE ========

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startButton = document.getElementById("startButton");
const restartBtn = document.getElementById("restartBtn");
const newGameBtn = document.getElementById("newGameBtn");
const settingsBtn = document.getElementById("settingsBtn");
const pauseBtn = document.getElementById("pauseBtn");   // <-- ADDED

const settingsModal = document.getElementById("settingsModal");
const playerNameInput = document.getElementById("playerNameInput");
const themeSelect = document.getElementById("themeSelect");
const speedSelect = document.getElementById("speedSelect");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");

const displayName = document.getElementById("displayName");
const currentScoreEl = document.getElementById("currentScore");
const highScoreEl = document.getElementById("highScore");
const highScoreBtn = document.getElementById("highScoreBtn");
const resetHighScoreBtn = document.getElementById("resetHighScoreBtn");

const GRID_SIZE = 20;
const TILE_SIZE = canvas.width / GRID_SIZE;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 10, y: 10 };

let intervalId = null;
let speedMs = 120;
let running = false;
let paused = false;              // <-- ADDED
let score = 0;
let highScore = 0;

let config = {
  name: "Player",
  theme: "sky",
  speedMs: 120,
};

// ======== CONFIG / THEME / SCORE ========

function loadConfig() {
  const storedConfig = localStorage.getItem("snakeGameConfig");
  if (storedConfig) {
    try { config = JSON.parse(storedConfig); } 
    catch (e) { console.error("Failed to parse config", e); }
  }

  playerNameInput.value = config.name;
  themeSelect.value = config.theme;
  speedSelect.value = String(config.speedMs);

  displayName.textContent = config.name || "Player";
  speedMs = config.speedMs || 120;

  applyTheme(config.theme);
}

function saveConfig() {
  config.name = playerNameInput.value.trim() || "Player";
  config.theme = themeSelect.value;
  config.speedMs = parseInt(speedSelect.value, 10);

  localStorage.setItem("snakeGameConfig", JSON.stringify(config));

  displayName.textContent = config.name;
  speedMs = config.speedMs;
  applyTheme(config.theme);

  if (running) {
    clearInterval(intervalId);
    intervalId = setInterval(gameLoop, speedMs);
  }
}

function applyTheme(theme) {
  document.body.classList.remove("theme-sky", "theme-normal");
  document.body.classList.add(theme === "normal" ? "theme-normal" : "theme-sky");
}

function loadHighScore() {
  const stored = localStorage.getItem("snakeHighScore");
  highScore = stored ? parseInt(stored, 10) : 0;
  highScoreEl.textContent = highScore;
}

function saveHighScore() {
  localStorage.setItem("snakeHighScore", String(highScore));
}

// ======== GAME LOGIC ========

function initSnake() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  paused = false;        // reset pause
  currentScoreEl.textContent = score;
  pauseBtn.textContent = "Pause";
  placeFood();
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function placeFood() {
  let newFood;
  do {
    newFood = {
      x: randomInt(0, GRID_SIZE - 1),
      y: randomInt(0, GRID_SIZE - 1),
    };
  } while (snake.some((s) => s.x === newFood.x && s.y === newFood.y));
  food = newFood;
}

function startGame() {
  if (running) return;
  initSnake();
  running = true;
  paused = false;
  startButton.classList.add("hidden");
  clearInterval(intervalId);
  intervalId = setInterval(gameLoop, speedMs);
}

function restartGame() {
  clearInterval(intervalId);
  initSnake();
  running = true;
  paused = false;
  startButton.classList.add("hidden");
  intervalId = setInterval(gameLoop, speedMs);
}

function newGame() {
  restartGame();
}

// FULL PAUSE FUNCTION (Button + Spacebar)
function pauseGame() {                              // <-- ADDED
  if (!running) return;

  paused = !paused;

  pauseBtn.textContent = paused ? "Resume" : "Pause";
}

function stopGame() {
  running = false;
  clearInterval(intervalId);
  startButton.textContent = "Play Again";
  startButton.classList.remove("hidden");
  paused = false;
  pauseBtn.textContent = "Pause";
}

function gameLoop() {
  if (paused) return;                               // <-- IMPORTANT

  direction = nextDirection;

  const head = snake[0];
  const newHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  if (newHead.x < 0 || newHead.x >= GRID_SIZE ||
      newHead.y < 0 || newHead.y >= GRID_SIZE) {
    stopGame();
    return;
  }

  if (snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
    stopGame();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    currentScoreEl.textContent = score;

    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore;
      saveHighScore();
    }
    placeFood();
  } else snake.pop();

  draw();
}

function draw() {
  ctx.fillStyle = config.theme === "normal" ? "#020617" : "#e0f2fe";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  for (let i = 0; i <= GRID_SIZE; i++) {
    const pos = i * TILE_SIZE;
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
  }
  ctx.strokeStyle = "#9ca3af";
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = config.theme === "normal" ? "#f97316" : "#ec4899";
  ctx.fillRect(
    food.x * TILE_SIZE + 2,
    food.y * TILE_SIZE + 2,
    TILE_SIZE - 4,
    TILE_SIZE - 4
  );

  ctx.fillStyle = config.theme === "normal" ? "#22c55e" : "#0f172a";

  snake.forEach((segment, index) => {
    const x = segment.x * TILE_SIZE;
    const y = segment.y * TILE_SIZE;

    ctx.beginPath();
    ctx.rect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    ctx.fill();

    if (index === 0) {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(x + TILE_SIZE * 0.3, y + TILE_SIZE * 0.3, 3, 0, Math.PI * 2);
      ctx.arc(x + TILE_SIZE * 0.7, y + TILE_SIZE * 0.3, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(x + TILE_SIZE * 0.3, y + TILE_SIZE * 0.3, 1.5, 0, Math.PI * 2);
      ctx.arc(x + TILE_SIZE * 0.7, y + TILE_SIZE * 0.3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = config.theme === "normal" ? "#22c55e" : "#0f172a";
    }
  });
}

// ======== INPUT HANDLERS ========

function handleKeyDown(e) {
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
      break;

    case "ArrowDown":
    case "s":
    case "S":
      if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
      break;

    case "ArrowLeft":
    case "a":
    case "A":
      if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
      break;

    case "ArrowRight":
    case "d":
    case "D":
      if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
      break;

    // SPACE = PAUSE / RESUME
    case " ":
      e.preventDefault();
      if (!running) startGame();
      else pauseGame();               // <-- ADDED
      break;
  }
}

document.addEventListener("keydown", handleKeyDown);

// ======== UI EVENTS ========

startButton.addEventListener("click", startGame);

pauseBtn.addEventListener("click", pauseGame);       // <-- ADDED

restartBtn.addEventListener("click", restartGame);

newGameBtn.addEventListener("click", newGame);

settingsBtn.addEventListener("click", () => {
  settingsModal.classList.add("open");
});

settingsModal.addEventListener("click", (e) => {
  if (e.target === settingsModal) {
    settingsModal.classList.remove("open");
  }
});

saveSettingsBtn.addEventListener("click", () => {
  saveConfig();
  settingsModal.classList.remove("open");
});

resetHighScoreBtn.addEventListener("click", () => {
  highScore = 0;
  highScoreEl.textContent = highScore;
  saveHighScore();
});

highScoreBtn.addEventListener("click", () => {
  highScoreBtn.classList.add("bump");
  setTimeout(() => highScoreBtn.classList.remove("bump"), 200);
});

// ======== INITIALIZE ========

window.addEventListener("load", () => {
  loadConfig();
  loadHighScore();
  initSnake();
  draw();

  if (!localStorage.getItem("snakeGameConfig")) {
    settingsModal.classList.add("open");
  }
});




