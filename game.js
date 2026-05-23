/**
 * Color Blindness Guessing Game
 * Main game logic and state management
 */

const game = {
    // Game state
    currentPlateIndex: 0,
    answers: [],
    totalPlates: colorPlates.length,
    gameStarted: false,
    gamePaused: false,

    // Initialize game
    init() {
        this.attachEventListeners();
        this.showScreen('startScreen');
    },

    // Attach event listeners
    attachEventListeners() {
        const answerInput = document.getElementById('answerInput');
        
        // Allow pressing Enter to submit
        answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        // Auto-focus input when game screen shows
        document.addEventListener('focus', () => {
            if (this.gameStarted && !this.gamePaused) {
                answerInput.focus();
            }
        }, true);
    },

    // Start the game
    startGame() {
        this.currentPlateIndex = 0;
        this.answers = [];
        this.gameStarted = true;
        this.gamePaused = false;

        this.showScreen('gameScreen');
        this.displayPlate();

        // Focus on input
        setTimeout(() => {
            document.getElementById('answerInput').focus();
        }, 100);
    },

    // Display current plate
    displayPlate() {
        if (this.currentPlateIndex >= this.totalPlates) {
            this.endGame();
            return;
        }

        const plate = colorPlates[this.currentPlateIndex];
        const canvas = document.getElementById('colorCanvas');

        // Draw the plate
        drawColorPlate(canvas, plate);

        // Update progress
        document.getElementById('currentPlate').textContent = this.currentPlateIndex + 1;
        document.getElementById('totalPlates').textContent = this.totalPlates;

        // Update progress bar
        const progress = ((this.currentPlateIndex) / this.totalPlates) * 100;
        document.getElementById('progressFill').style.width = progress + '%';

        // Set alt text
        document.getElementById('plateAlt').textContent = plate.altText;

        // Clear input and feedback
        document.getElementById('answerInput').value = '';
        const feedbackEl = document.getElementById('feedback');
        feedbackEl.textContent = '';
        feedbackEl.classList.remove('show', 'correct', 'incorrect');

        // Focus input
        setTimeout(() => {
            document.getElementById('answerInput').focus();
        }, 100);
    },

    // Submit answer
    submitAnswer() {
        if (this.currentPlateIndex >= this.totalPlates) return;

        const plate = colorPlates[this.currentPlateIndex];
        const answerInput = document.getElementById('answerInput');
        const userAnswer = answerInput.value.trim();

        if (!userAnswer) {
            this.showFeedback('Please enter an answer', 'incorrect');
            return;
        }

        const isCorrect = validateAnswer(userAnswer, plate.expectedAnswer);

        // Store answer
        this.answers.push({
            plateId: plate.id,
            plateNumber: this.currentPlateIndex + 1,
            expected: plate.expectedAnswer,
            userAnswer: userAnswer,
            correct: isCorrect,
            skipped: false
        });

        // Show feedback
        const feedbackText = isCorrect 
            ? '✓ Correct! The answer was ' + plate.expectedAnswer
            : '✗ Incorrect. The answer was ' + plate.expectedAnswer;
        
        this.showFeedback(feedbackText, isCorrect ? 'correct' : 'incorrect');

        // Move to next plate
        setTimeout(() => {
            this.currentPlateIndex++;
            this.displayPlate();
        }, 1500);
    },

    // Skip plate
    skipPlate() {
        if (this.currentPlateIndex >= this.totalPlates) return;

        const plate = colorPlates[this.currentPlateIndex];

        // Store as skipped
        this.answers.push({
            plateId: plate.id,
            plateNumber: this.currentPlateIndex + 1,
            expected: plate.expectedAnswer,
            userAnswer: '',
            correct: false,
            skipped: true
        });

        // Move to next plate
        this.currentPlateIndex++;
        this.displayPlate();
    },

    // Show feedback message
    showFeedback(message, type) {
        const feedbackEl = document.getElementById('feedback');
        feedbackEl.textContent = message;
        feedbackEl.classList.add('show', type);
    },

    // End game and show results
    endGame() {
        this.gameStarted = false;

        // Calculate score
        const correctCount = this.answers.filter(a => a.correct).length;
        const score = Math.round((correctCount / this.totalPlates) * 100);

        // Store results
        this.lastResults = {
            score,
            correctCount,
            totalPlates: this.totalPlates,
            answers: this.answers,
            timestamp: new Date().toISOString()
        };

        // Display results
        this.displayResults(score, correctCount);
        this.showScreen('resultsScreen');
    },

    // Display results
    displayResults(score, correctCount) {
        document.getElementById('finalScore').textContent = score;
        document.getElementById('correctCount').textContent = correctCount;

        // Get interpretation
        const interpretation = getInterpretation(score, correctCount, this.answers);

        // Create interpretation HTML
        const interpHTML = `
            <h3>${interpretation.category}</h3>
            <p>${interpretation.description}</p>
            <p><strong>Recommendation:</strong> ${interpretation.recommendation}</p>
        `;

        document.getElementById('resultInterpretation').innerHTML = interpHTML;

        // Add visual indicator
        const interpEl = document.getElementById('resultInterpretation');
        interpEl.className = 'interpretation-box ' + interpretation.type;
    },

    // View detailed results
    viewDetails() {
        const detailsList = document.getElementById('detailsList');
        let html = '';

        this.answers.forEach((answer, index) => {
            const statusClass = answer.skipped ? 'skipped' : (answer.correct ? 'correct' : 'incorrect');
            const statusText = answer.skipped ? 'SKIPPED' : (answer.correct ? 'CORRECT' : 'INCORRECT');
            const userAnswerText = answer.skipped ? 'Skipped' : answer.userAnswer;

            html += `
                <div class="detail-item ${statusClass}">
                    <div>
                        <div class="detail-label">Plate ${answer.plateNumber}</div>
                        <div style="color: #7f8c8d; font-size: 12px; margin-top: 3px;">
                            Correct answer: ${answer.expected}
                        </div>
                    </div>
                    <div class="detail-answer">
                        <span>${userAnswerText}</span>
                        <span class="badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
            `;
        });

        detailsList.innerHTML = html;
        this.showScreen('detailsScreen');
    },

    // Restart game
    restartGame() {
        this.startGame();
    },

    // Show specific screen
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }
};

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    game.init();
});
