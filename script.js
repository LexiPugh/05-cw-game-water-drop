// script.js

// grab our message container (script tag is at bottom of HTML, so this will work immediately)
const messageDisplay = document.getElementById('message-display');

// Game state variables
let gameActive     = false;  // Tracks if game is currently running
let gameInterval;            // Interval that creates drops
let timerInterval;           // Interval for the timer
let score          = 0;      // Player's score
let timer          = 30;     // Game duration in seconds

// Stats
let goodDropsCaught = 0;
let goodDropsMissed = 0;
let badDropsCaught  = 0;

// Drop speed multiplier
let dropSpeedMultiplier = 1;

// Wire up buttons
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('reset-btn').addEventListener('click', resetGame);

// START GAME
function startGame() {
  // clear old intervals
  clearInterval(gameInterval);
  clearInterval(timerInterval);

  if (gameActive) return; // don't double‑start
  
  // reset state
  gameActive = true;
  timer      = 30;
  score      = 0;
  goodDropsCaught = 0;
  goodDropsMissed = 0;
  badDropsCaught  = 0;

  // update displays
  document.getElementById('score-display').textContent = score;
  document.getElementById('timer-display').textContent = timer;

  // hide any old message
  messageDisplay.innerHTML = '';
  messageDisplay.removeAttribute('style');

  // set speed
  updateDropSpeedMultiplier();

  // start loops
  timerInterval = setInterval(updateTimer, 1000);
  gameInterval  = setInterval(createDrop, 1000);

  // toggle buttons
  document.getElementById('start-btn').disabled = true;
  document.getElementById('reset-btn').disabled = false;

  console.log('[startGame] gameActive:', gameActive);
}

// UPDATE SCORE
function updateScore(points) {
  if (!gameActive) return;
  score += points;
  document.getElementById('score-display').textContent = score;
}

// TIMER TICK
function updateTimer() {
  timer--;
  document.getElementById('timer-display').textContent = timer;
  if (timer <= 0) endGame();
}

// END GAME
function endGame() {
  console.log('[endGame] called');
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  gameActive = false;

  // compute stats
  const pGood   = goodDropsCaught * 10;
  const pMissed = goodDropsMissed * 10;
  const pBad    = badDropsCaught * 10;

  // build HTML
  messageDisplay.innerHTML = `
    <p>Time's up! Here's how you did:</p>
    <ul>
      <li>Good drops caught: ${goodDropsCaught} (+${pGood} points)</li>
      <li>Good drops missed: ${goodDropsMissed} (-${pMissed} points)</li>
      <li>Bad drops caught: ${badDropsCaught} (-${pBad} points)</li>
    </ul>
    <p>Your final score is: ${score}</p>
    <p>Charity:water is a nonprofit dedicated to bringing clean and safe drinking water to people in developing countries. Access to clean water transforms lives by improving health, enabling education, and fostering economic growth. In your game, the good water drops symbolize the positive impact of clean water, while the bad drops reflect the challenges of unsafe water. Everyone deserves access to clean water—it’s a fundamental need that fuels brighter futures.</p>
  `;

  // force a full inline‑style overlay so CSS never “sticks”
  Object.assign(messageDisplay.style, {
    display: 'flex',
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '999',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflowY: 'auto',
    padding: '20px',
    boxSizing: 'border-box',
    backgroundColor: '#FFF7E1',
  });

  // re‑enable start
  document.getElementById('start-btn').disabled = false;
}

// RESET GAME
function resetGame() {
  console.log('[resetGame] Called');
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  gameActive = false;

  // reset stats & UI
  score = 0;
  timer = 30;
  goodDropsCaught = 0;
  goodDropsMissed = 0;
  badDropsCaught  = 0;
  document.getElementById('score-display').textContent = score;
  document.getElementById('timer-display').textContent = timer;

  // remove all drops
  const gameContainer = document.getElementById('game-container');
  gameContainer.querySelectorAll('.water-drop').forEach(d => d.remove());

  // wipe message container completely
  messageDisplay.innerHTML = '';
  messageDisplay.removeAttribute('style');

  // toggle buttons
  document.getElementById('start-btn').disabled = false;
  document.getElementById('reset-btn').disabled = true;

  // reset speed
  updateDropSpeedMultiplier();
}

// DIFFICULTY
function updateDropSpeedMultiplier() {
  const diff = document.getElementById('difficulty-select').value;
  switch (diff) {
    case 'easy':    dropSpeedMultiplier = 0.75; break;
    case 'hard':    dropSpeedMultiplier = 2.75;    break;
    case 'extreme': dropSpeedMultiplier = 3.5;  break;
    default:        dropSpeedMultiplier = 1.5; break;
  }
}

// SPAWN A DROP
function createDrop() {
  if (!gameActive) return;

  const drop = document.createElement('div');
  const isBad = Math.random() < 0.3;
  drop.className = isBad ? 'water-drop bad-drop' : 'water-drop';
  drop.style.backgroundImage = isBad
    ? "url('img/BadDrop.png')"
    : "url('img/GoodDrop.png')";
  drop.style.backgroundSize = 'cover';

  // random scale
  const scale = 0.8 + Math.random() * 0.7;
  drop.style.transform = `scale(${scale})`;

  // random X
  const w = document.getElementById('game-container').offsetWidth;
  drop.style.left = `${Math.random()*(w-40)}px`;

  // animation speed
  const baseSpeed = 4;
  drop.style.animationDuration = `${baseSpeed/dropSpeedMultiplier}s`;

  // click handler
  drop.addEventListener('click', () => {
    if (!gameActive) return;
    if (isBad) {
      updateScore(-10);
      badDropsCaught++;
    } else {
      updateScore(10);
      goodDropsCaught++;
    }
    drop.remove();
  });

  // when it falls off bottom
  drop.addEventListener('animationend', () => {
    if (!gameActive) return;
    if (!isBad) {
      updateScore(-10);
      goodDropsMissed++;
    }
    drop.remove();
  });

  document.getElementById('game-container').appendChild(drop);
}

