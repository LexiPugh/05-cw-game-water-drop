document.addEventListener('DOMContentLoaded', () => {
    // Game state variables
    let gameActive = false;  // Tracks if game is currently running
    let gameInterval;        // Stores the interval that creates drops
    let score = 0;           // Tracks the player's score
    let timer = 30;          // Game duration in seconds
    let timerInterval;       // Stores the interval for the timer

    // Additional state variables for tracking statistics
    let goodDropsCaught = 0;
    let goodDropsMissed = 0;
    let badDropsCaught = 0;

    // Multiplier for drop speed based on difficulty
    let dropSpeedMultiplier = 1;

    // Event listener for the start button
    document.getElementById('start-btn').addEventListener('click', startGame);

    // Event listener for the Reset button
    document.getElementById('reset-btn').addEventListener('click', resetGame);

    // Function to start the game
    function startGame() {
        // Clear any existing intervals to ensure smooth switching between difficulties
        clearInterval(gameInterval);
        clearInterval(timerInterval);

        // Prevent multiple game instances
        if (gameActive) return;

        // Set up initial game state
        gameActive = true;
        timer = 30; // Reset timer
        score = 0; // Reset score
        goodDropsCaught = 0;
        goodDropsMissed = 0;
        badDropsCaught = 0;

        // Update score and timer displays
        document.getElementById('score-display').textContent = score;
        document.getElementById('timer-display').textContent = timer;

        // Safely access the end-game message element
        const messageDisplay = document.getElementById('message-display');
        if (messageDisplay) {
            messageDisplay.textContent = ''; // Clear the message content
            messageDisplay.classList.remove('active'); // Ensure the message box disappears
        }

        // Update drop speed multiplier based on the selected difficulty
        updateDropSpeedMultiplier();

        // Start the timer
        timerInterval = setInterval(updateTimer, 1000);

        // Start creating drops every 1000ms (1 second)
        gameInterval = setInterval(createDrop, 1000);

        // Disable the Start button and enable the Reset button
        document.getElementById('start-btn').disabled = true;
        document.getElementById('reset-btn').disabled = false;
        console.log('[startGame] Called. gameActive:', gameActive);
    }

    // Function to update the score display
    function updateScore(points) {
        if (!gameActive) return; // Prevent score updates after the game ends
        score += points;
        document.getElementById('score-display').textContent = score;
    }

    // Function to update the timer
    function updateTimer() {
        timer--;
        document.getElementById('timer-display').textContent = timer;

        if (timer <= 0) {
            endGame(); // End the game when the timer reaches 0
        }
    }

    // Function to end the game
    function endGame() {
        clearInterval(gameInterval); // Stop creating drops
        clearInterval(timerInterval); // Stop the timer
        gameActive = false; // Mark the game as inactive

        // Calculate statistics
        const pointsFromGoodDrops = goodDropsCaught * 10;
        const pointsLostFromMissedGoodDrops = goodDropsMissed * 10;
        const pointsLostFromBadDrops = badDropsCaught * 10;

        // Display end-game message within the game box
        const messageDisplay = document.getElementById('message-display');
        messageDisplay.innerHTML = `
            <p>Time's up! Here's how you did:</p>
            <ul>
                <li>Good drops caught: ${goodDropsCaught} (+${pointsFromGoodDrops} points)</li>
                <li>Good drops missed: ${goodDropsMissed} (-${pointsLostFromMissedGoodDrops} points)</li>
                <li>Bad drops caught: ${badDropsCaught} (-${pointsLostFromBadDrops} points)</li>
            </ul>
            <p>Your final score is: ${score}</p>
            <p>Charity:water is a nonprofit organization dedicated to bringing clean and safe drinking water to people in developing countries. Access to clean water transforms lives by improving health, enabling education, and fostering economic growth. In your game, the good water drops symbolizes the positive impact of clean water, while the bad drops reflects the challenges of unsafe water. Everyone deserves access to clean water—it’s a fundamental need that fuels brighter futures.</p>
        `;
        messageDisplay.classList.add('active'); // Show the message display

        // Enable the Start button for a new game
        document.getElementById('start-btn').disabled = false;
    }

    // Function to reset the game
    function resetGame() {
        clearInterval(gameInterval); // Stop creating drops
        clearInterval(timerInterval); // Stop the timer

        // Reset game state
        gameActive = false; // Ensure the game state is reset
        score = 0;
        timer = 30; // Reset timer to 30 seconds
        goodDropsCaught = 0;
        goodDropsMissed = 0;
        badDropsCaught = 0;

        // Update score and timer displays
        document.getElementById('score-display').textContent = score; // Ensure score is updated to 0
        document.getElementById('timer-display').textContent = timer;

        // Clear all drops from the game container
        const gameContainer = document.getElementById('game-container');
        while (gameContainer.firstChild) {
            gameContainer.firstChild.remove();
        }

        // Safely access the end-game message element
        const messageDisplay = document.getElementById('message-display');
        if (messageDisplay) {
            messageDisplay.textContent = ''; // Clear the message content
            messageDisplay.classList.remove('active'); // Hide the message display
        }

        // Enable the Start button and disable the Reset button
        document.getElementById('start-btn').disabled = false;
        document.getElementById('reset-btn').disabled = true;

        // Update drop speed multiplier based on the selected difficulty
        updateDropSpeedMultiplier();

        console.log('[resetGame] Called. gameActive:', gameActive);
    }

    // Function to update the drop speed multiplier based on the selected difficulty
    function updateDropSpeedMultiplier() {
        const difficulty = document.getElementById('difficulty-select').value;
        if (difficulty === 'easy') {
            dropSpeedMultiplier = 0.75;
        } else if (difficulty === 'hard') {
            dropSpeedMultiplier = 2; // 25% faster than 1.5x
        } else if (difficulty === 'extreme') {
            dropSpeedMultiplier = 2.5; // 25% faster than 2x
        } else {
            dropSpeedMultiplier = 1.25; // Default to normal
        }
    }

    // Function to create and manage individual water drops
    function createDrop() {
        if (!gameActive) return; // Prevent creating drops after the game ends

        const drop = document.createElement('div');
        
        // Adjusted randomization to ensure bad drops appear more consistently
        const isBadDrop = Math.random() < 0.3; // Increased chance of bad drops to 30%
        drop.className = isBadDrop ? 'water-drop bad-drop' : 'water-drop';
        drop.style.backgroundImage = isBadDrop ? "url('img/BadDrop.png')" : "url('img/GoodDrop.png')";
        drop.style.backgroundSize = 'cover';

        // Create random size variation for visual interest
        const scale = 0.8 + Math.random() * 0.7;  // Results in 80% to 150% of original size
        drop.style.transform = `scale(${scale})`;
        
        // Position drop randomly along the width of the game container
        const gameWidth = document.getElementById('game-container').offsetWidth;
        const randomX = Math.random() * (gameWidth - 40);
        drop.style.left = `${randomX}px`;
        
        // Set drop animation speed based on difficulty
        const baseSpeed = 4; // Base speed in seconds
        drop.style.animationDuration = `${baseSpeed / dropSpeedMultiplier}s`;
        
        // Click handler to update score and remove drops
        drop.addEventListener('click', () => {
            if (!gameActive) return; // Prevent score updates after the game ends
            if (isBadDrop) {
                updateScore(-10); // Deduct points for bad drops
                badDropsCaught++;
            } else {
                updateScore(10); // Add points for good drops
                goodDropsCaught++;
            }
            drop.remove(); // Ensure the drop disappears when clicked
        });
        
        // Add drop to game container
        document.getElementById('game-container').appendChild(drop);
        
        // Remove drop if it reaches bottom without being clicked
        drop.addEventListener('animationend', () => {
            if (!gameActive) return; // Prevent score updates after the game ends
            if (!isBadDrop) {
                updateScore(-10); // Deduct points for missed good drops
                goodDropsMissed++;
            }
            drop.remove();
        });
        console.log('[createDrop] Called. gameActive:', gameActive);
    }
});
