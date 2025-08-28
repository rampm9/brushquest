// Initialize game variables
let score = 0;
let timeLeft = 30;
let gameRunning = false;
let timer;

// Start Game
function startGame() {
  score = 0;
  timeLeft = 30;
  gameRunning = true;
  document.getElementById("score").innerText = "Score: " + score;
  document.getElementById("time").innerText = "Time Left: " + timeLeft + "s";

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("time").innerText = "Time Left: " + timeLeft + "s";
    if (timeLeft <= 0) endGame();
  }, 1000);
}

// Brushing Action
function brushTeeth() {
  if (!gameRunning) return;
  score++;
  document.getElementById("score").innerText = "Score: " + score;
}

// End Game
function endGame() {
  clearInterval(timer);
  gameRunning = false;
  alert("Time’s up! You brushed " + score + " times 🪥");
}
