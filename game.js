const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================
// CONSTANTS
// =====================
const GROUND_Y = 170;

// =====================
// SOUNDS
// =====================
const jumpSound = new Audio("sounds/jump.mp3");
const hitSound = new Audio("sounds/hit.mp3");

jumpSound.volume = 0.6;
hitSound.volume = 1;

// =====================
// GAME STATE
// =====================
let gameOver = false;
let score = 0;

// =====================
// DINO
// =====================
const dino = {
    x: 50,
    y: GROUND_Y - 50,
    width: 50,
    height: 50,
    velocityY: 0,
    onGround: true
};

// =====================
// OBSTACLES
// =====================
let obstacles = [];

const gravity = 0.6;
let speed = 6;
let spawnRate = 1500;

// 🔊 ENABLE SOUND AFTER FIRST USER ACTION
document.addEventListener("keydown", () => {
    jumpSound.play().catch(() => {});
}, { once: true });

// 🎮 PLAYER CONTROL (JUMP)
document.addEventListener("keydown", (e) => {
    if ((e.code === "Space" || e.code === "ArrowUp") && dino.onGround && !gameOver) {
        dino.velocityY = -12;
        dino.onGround = false;
        jumpSound.currentTime = 0;
        jumpSound.play();
    }

    // Restart
    if (e.key === "r" && gameOver) {
        location.reload();
    }
});

// CREATE OBSTACLE
function createObstacle() {
    const size = 80; // obstacle size

    obstacles.push({
        x: canvas.width,
        y: 150,
        width: 20 + Math.random() * 20,
        height: 30
    });
}

// =====================
// COLLISION
// =====================
function collision(a, b) {
    return (
        d.x < o.x + o.width &&
        d.x + d.width > o.x &&
        d.y < o.y + o.height &&
        d.y + d.height > o.y
    );
}

// =====================
// GAME LOOP
// =====================
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // GROUND
    ctx.fillStyle = "black";
    ctx.fillRect(0, 170, canvas.width, 2);

    // Physics
    dino.velocityY += gravity;
    dino.y += dino.velocityY;

    if (dino.y >= GROUND_Y - dino.height) {
        dino.y = GROUND_Y - dino.height;
        dino.velocityY = 0;
        dino.onGround = true;
    }

    // DRAW DINO
    ctx.fillStyle = "green";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Obstacles
    obstacles.forEach((obs, index) => {
        obs.x -= speed;

        if (imagesReady) {
            ctx.drawImage(obstacleImg, obs.x, obs.y, obs.width, obs.height);
        } else {
            ctx.fillStyle = "red";
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }

        if (collision(dino, obs)) {
            hitSound.currentTime = 0;
            hitSound.play().catch(() => {});
            gameOver = true;
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
        }
    });

    // Score
    score++;
    ctx.fillStyle = "#000";
    ctx.fillText("Score: " + score, 10, 20);

    // SPEED INCREASE
    if (score % 500 === 0) speed += 0.5;

    requestAnimationFrame(gameLoop);
}

// SPAWN OBSTACLES
setInterval(() => {
    if (!gameOver) createObstacle();
}, 1500);

// GAME OVER SCREEN
function showGameOver() {
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Game Over 😵", 320, 90);
    ctx.fillText("Press R to Restart", 290, 120);
}

// START GAME
gameLoop();
