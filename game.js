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

// =====================
// AUDIO UNLOCK (MOBILE SAFE)
// =====================
function unlockAudio() {
    [jumpSound, hitSound].forEach(s => {
        s.play().then(() => {
            s.pause();
            s.currentTime = 0;
        }).catch(() => {});
    });

    document.removeEventListener("click", unlockAudio);
    document.removeEventListener("touchstart", unlockAudio);
}
document.addEventListener("click", unlockAudio);
document.addEventListener("touchstart", unlockAudio);

// =====================
// IMAGES
// =====================
const dinoImg = new Image();
const obstacleImg = new Image();

dinoImg.src = "images/dino.png";
obstacleImg.src = "images/obstacle.png";

let imagesReady = false;
let loaded = 0;

function imageLoaded(name) {
    loaded++;
    console.log(`✅ ${name} loaded`);
    if (loaded === 2) imagesReady = true;
}

dinoImg.onload = () => imageLoaded("Dino");
obstacleImg.onload = () => imageLoaded("Obstacle");

dinoImg.onerror = () => console.error("❌ Dino image not loaded");
obstacleImg.onerror = () => console.error("❌ Obstacle image not loaded");

// =====================
// JUMP
// =====================
function jump() {
    if (dino.onGround && !gameOver) {
        dino.velocityY = -13;
        dino.onGround = false;
    }
}

// =====================
// KEYBOARD CONTROLS
// =====================
document.addEventListener("keydown", e => {
    if (e.code === "Space" || e.code === "ArrowUp") jump();
    if (e.key === "r" && gameOver) location.reload();
});

// =====================
// CREATE OBSTACLE (FIXED)
// =====================
function createObstacle() {
    const size = 80; // obstacle size

    obstacles.push({
        x: canvas.width,
        y: GROUND_Y - size, // 🔥 CORRECT ALIGNMENT
        width: size,
        height: size
    });
}

// =====================
// COLLISION
// =====================
function collision(a, b) {
    return (
        a.x + 8 < b.x + b.width - 8 &&
        a.x + a.width - 8 > b.x + 8 &&
        a.y + 8 < b.y + b.height - 8 &&
        a.y + a.height - 8 > b.y + 8
    );
}

// =====================
// GAME LOOP
// =====================
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground
    ctx.fillStyle = "#000";
    ctx.fillRect(0, GROUND_Y, canvas.width, 2);

    // Physics
    dino.velocityY += gravity;
    dino.y += dino.velocityY;

    if (dino.y >= GROUND_Y - dino.height) {
        dino.y = GROUND_Y - dino.height;
        dino.velocityY = 0;
        dino.onGround = true;
    }

    // Dino
    if (imagesReady) {
        ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    } else {
        ctx.fillStyle = "green";
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    }

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

    if (score % 200 === 0) speed += 0.3;

    if (!gameOver) requestAnimationFrame(gameLoop);
    else showGameOver();
}

// =====================
// GAME OVER
// =====================
function showGameOver() {
    ctx.fillStyle = "#000";
    ctx.font = "20px Arial";
    ctx.fillText("Game Over 😵", 320, 90);
    ctx.fillText("Tap RESTART or Press R", 250, 120);
}

// =====================
// JUMP BUTTON
// =====================
const jumpBtn = document.createElement("button");
jumpBtn.innerText = "JUMP";
jumpBtn.style.position = "fixed";
jumpBtn.style.bottom = "20px";
jumpBtn.style.right = "20px";
jumpBtn.style.padding = "16px 24px";
jumpBtn.style.borderRadius = "12px";
jumpBtn.style.background = "#2ecc71";
jumpBtn.style.color = "white";
jumpBtn.style.fontWeight = "bold";
jumpBtn.style.zIndex = "1000";

jumpBtn.addEventListener("click", () => {
    jumpSound.currentTime = 0;
    jumpSound.play().catch(() => {});
    jump();
});
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
restartBtn.style.borderRadius = "12px";
restartBtn.style.background = "#e74c3c";
restartBtn.style.color = "white";
restartBtn.style.fontWeight = "bold";
restartBtn.style.zIndex = "1000";

restartBtn.addEventListener("click", () => location.reload());
document.body.appendChild(restartBtn);

// =====================
// SPAWN LOOP
// =====================
setInterval(() => {
    if (!gameOver) createObstacle();
}, spawnRate);

// START
gameLoop();