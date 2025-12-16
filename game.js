const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const jumpSound = new Audio("sounds/jump.mp3");
const hitSound = new Audio("sounds/hit.mp3");

let gameOver = false;
let score = 0;
document.addEventListener("click", () => {
    jumpSound.play().then(() => {
        jumpSound.pause();
        jumpSound.currentTime = 0;
    });
}, { once: true });

// DINO
const dino = {
    x: 50,
    y: 140,
    width: 30,
    height: 30,
    velocityY: 0,
    onGround: true
};

// OBSTACLES
let obstacles = [];

const gravity = 0.6;
let speed = 4;

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
    obstacles.push({
        x: canvas.width,
        y: 150,
        width: 20 + Math.random() * 20,
        height: 30
    });
}

// COLLISION CHECK
function collision(d, o) {
    return (
        d.x < o.x + o.width &&
        d.x + d.width > o.x &&
        d.y < o.y + o.height &&
        d.y + d.height > o.y
    );
}

// GAME LOOP
function gameLoop() {
    if (gameOver) {
        showGameOver();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // GROUND
    ctx.fillStyle = "black";
    ctx.fillRect(0, 170, canvas.width, 2);

    // DINO PHYSICS
    dino.velocityY += gravity;
    dino.y += dino.velocityY;

    if (dino.y >= 140) {
        dino.y = 140;
        dino.velocityY = 0;
        dino.onGround = true;
    }

    // DRAW DINO
    ctx.fillStyle = "green";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // OBSTACLES
    obstacles.forEach((obs, index) => {
        obs.x -= speed;
        ctx.fillStyle = "red";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        if (collision(dino, obs)) {
            hitSound.play();
            gameOver = true;
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
        }
    });

    // SCORE
    score++;
    ctx.fillStyle = "black";
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
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Game Over 😵", 320, 90);
    ctx.fillText("Press R to Restart", 290, 120);
}

// START GAME
gameLoop();