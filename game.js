const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// =====================
// SOUNDS
// =====================
const jumpSound = new Audio("sounds/jump.mp3");
const hitSound = new Audio("sounds/hit.mp3");

jumpSound.volume = 0.6; // comfortable for long sound
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
    y: 140,
    width: 30,
    height: 30,
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

// =====================
// SAFE AUDIO UNLOCK
// =====================
function unlockAudioSafe() {
    const s1 = jumpSound.cloneNode();
    const s2 = hitSound.cloneNode();

    s1.volume = 0;
    s2.volume = 0;

    s1.play().catch(() => {});
    s2.play().catch(() => {});

    document.removeEventListener("click", unlockAudioSafe);
    document.removeEventListener("touchstart", unlockAudioSafe);
}
document.addEventListener("click", unlockAudioSafe);
document.addEventListener("touchstart", unlockAudioSafe);

// =====================
// JUMP (PHYSICS ONLY)
// =====================
function jump() {
    if (dino.onGround && !gameOver) {
        dino.velocityY = -13;
        dino.onGround = false;
    }
}

// =====================
// KEYBOARD CONTROLS (NO SOUND)
// =====================
document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") jump();
    if (e.key === "r" && gameOver) location.reload();
});

// =====================
// CREATE OBSTACLE
// =====================
function createObstacle() {
    obstacles.push({
        x: canvas.width,
        y: 150,
        width: 25,
        height: 30
    });
}

// =====================
// COLLISION
// =====================
function collision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// =====================
// GAME LOOP
// =====================
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

    // Speed increase
    if (score % 200 === 0) speed += 0.3;

    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    } else {
        showGameOver();
    }
}

// =====================
// GAME OVER
// =====================
function showGameOver() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Game Over 😵", 320, 90);
    ctx.fillText(" REFRESH or Press R", 270, 120);
}

// =====================
// JUMP BUTTON (ALWAYS PLAYS SOUND)
// =====================
const jumpBtn = document.createElement("button");
jumpBtn.innerText = "JUMP";

jumpBtn.style.position = "fixed";
jumpBtn.style.bottom = "20px";
jumpBtn.style.right = "20px";
jumpBtn.style.padding = "16px 24px";
jumpBtn.style.fontSize = "18px";
jumpBtn.style.border = "none";
jumpBtn.style.borderRadius = "12px";
jumpBtn.style.background = "#2ecc71";
jumpBtn.style.color = "white";
jumpBtn.style.fontWeight = "bold";
jumpBtn.style.zIndex = "1000";

jumpBtn.addEventListener("click", () => {
    jumpSound.currentTime = 0; // 🔁 restart sound EVERY press
    jumpSound.play().catch(() => {});
    jump();
});

jumpBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => {});
    jump();
}, { passive: false });

document.body.appendChild(jumpBtn);

// =====================
// RESTART BUTTON
// =====================
const restartBtn = document.createElement("button");
restartBtn.innerText = "RESTART";

restartBtn.style.position = "fixed";
restartBtn.style.bottom = "20px";
restartBtn.style.right = "140px";
restartBtn.style.padding = "16px 20px";
restartBtn.style.fontSize = "16px";
restartBtn.style.border = "none";
restartBtn.style.borderRadius = "12px";
restartBtn.style.background = "#e74c3c";
restartBtn.style.color = "white";
restartBtn.style.fontWeight = "bold";
restartBtn.style.zIndex = "1000";

restartBtn.addEventListener("click", () => location.reload());
restartBtn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    location.reload();
}, { passive: false });

document.body.appendChild(restartBtn);

// =====================
// SPAWN LOOP
// =====================
setInterval(() => {
    if (!gameOver) createObstacle();
}, spawnRate);

// START GAME
gameLoop();
