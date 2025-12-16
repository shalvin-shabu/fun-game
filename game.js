const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// SOUNDS
const jumpSound = new Audio("sounds/jump.mp3");
const hitSound = new Audio("sounds/hit.mp3");

jumpSound.volume = 1;
hitSound.volume = 1;

let gameOver = false;
let score = 0;

// ---------- DINO ----------
const dino = {
    x: 50,
    y: 140,
    width: 30,
    height: 30,
    velocityY: 0,
    onGround: true
};

// ---------- OBSTACLES ----------
let obstacles = [];

function unlockAudio() {
    [jumpSound, hitSound].forEach(sound => {
        sound.play().then(() => {
            sound.pause();
            sound.currentTime = 0;
        }).catch(() => {});
    });

    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
}

// Unlock on first user interaction
document.addEventListener("click", unlockAudio);
document.addEventListener("touchstart", unlockAudio);

const gravity = 0.6;
let speed = 6; // 🚀 FASTER START
let spawnRate = 1500; // ⏱️ FASTER SPAWN

/* =====================
   UNLOCK AUDIO (ONCE)
===================== */
function unlockAudio() {
    [jumpSound, hitSound].forEach(sound => {
        sound.play().then(() => {
            sound.pause();
            sound.currentTime = 0;
        }).catch(() => {});
    });

    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
}
document.addEventListener("click", unlockAudio);
document.addEventListener("touchstart", unlockAudio);

/* =====================
   JUMP
===================== */
function jump() {
    if (dino.onGround && !gameOver) {
        dino.velocityY = -13;
        dino.onGround = false;

        jumpSound.currentTime = 0;
        jumpSound.play().catch(() => {});
    }
}

/* =====================
   CONTROLS
===================== */
// Keyboard
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") jump();
    if (e.key === "r" && gameOver) location.reload();
});

// Mobile
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    jump();
}, { passive: false });

/* =====================
   CREATE OBSTACLE
===================== */
function createObstacle() {
    obstacles.push({
        x: canvas.width,
        y: 150,
        width: 25,
        height: 30
    });
}

/* =====================
   COLLISION
===================== */
function collision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/* =====================
   GAME LOOP
===================== */
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "black";
    ctx.fillRect(0, 170, canvas.width, 2);

    // Physics
    dino.velocityY += gravity;
    dino.y += dino.velocityY;

    if (dino.y >= 140) {
        dino.y = 140;
        dino.velocityY = 0;
        dino.onGround = true;
    }

    // Dino
    ctx.fillStyle = "green";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Obstacles
    obstacles.forEach((obs, index) => {
        obs.x -= speed;
        ctx.fillStyle = "red";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

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
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 10, 20);

    // 🚀 SPEED UP SMOOTHLY
    if (score % 200 === 0) speed += 0.3;

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        showGameOver();
    }
}

/* =====================
   GAME OVER
===================== */
function showGameOver() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Game Over 😵", 320, 90);
    ctx.fillText("Tap or Press R to Restart", 250, 120);
}

/* =====================
   SPAWN LOOP
===================== */
setInterval(() => {
    if (!gameOver) createObstacle();
}, spawnRate);

// START
gameLoop();
