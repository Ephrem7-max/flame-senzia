document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const name1Input = document.getElementById('name1');
    const name2Input = document.getElementById('name2');
    const calculateBtn = document.getElementById('calculate-btn');
    const processingArea = document.getElementById('processing-area');
    const name1Display = document.getElementById('name1-display');
    const name2Display = document.getElementById('name2-display');
    const countDisplay = document.querySelector('.count-display');
    const countValue = document.getElementById('count-value');
    const flamesContainer = document.querySelector('.flames-container');
    const flamesBox = document.querySelector('.flames-box');
    const modal = document.getElementById('result-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const resultTitle = document.getElementById('result-title');
    const resultEmoji = document.getElementById('result-emoji');
    const resultMeaning = document.getElementById('result-meaning');

    // --- Event Listeners ---
    calculateBtn.addEventListener('click', startGame);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- Game Logic ---

    /**
     * Resets the UI to its initial state for a new game.
     */
    function resetUI() {
        processingArea.classList.add('hidden');
        name1Display.innerHTML = '';
        name2Display.innerHTML = '';
        countDisplay.classList.add('hidden');
        countDisplay.classList.remove('visible');
        flamesContainer.classList.add('hidden');
        flamesContainer.classList.remove('visible');
        flamesBox.innerHTML = `
            <span>F</span><span>L</span><span>A</span><span>M</span><span>E</span><span>S</span>
        `;
    }

    /**
     * Starts the FLAMES game calculation process.
     */
    async function startGame() {
        const name1 = name1Input.value.toLowerCase().replace(/[^a-z]/g, '');
        const name2 = name2Input.value.toLowerCase().replace(/[^a-z]/g, '');

        if (!name1 || !name2) {
            showResult('Error', '🤔', 'Please enter both names to play!');
            return;
        }

        resetUI();
        processingArea.classList.remove('hidden');

        // Display names with letter spans
        displayNames(name1, name2);

        // Strike common letters and get the remaining count
        const remainingCount = await strikeCommonLetters(name1, name2);

        // Animate the counting process
        await animateCount(remainingCount);

        // Show FLAMES container and start the striking logic
        flamesContainer.classList.remove('hidden');
        flamesContainer.classList.add('visible');

        await calculateFlames(remainingCount);
    }

    /**
     * Displays the names in the UI, each letter in its own span.
     * @param {string} name1 - The first name.
     * @param {string} name2 - The second name.
     */
    function displayNames(name1, name2) {
        name1.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            name1Display.appendChild(span);
        });
        name2.split('').forEach(char => {
            const span = document.createElement('span');
            span.textContent = char;
            name2Display.appendChild(span);
        });
    }

    /**
     * Finds and strikes out common letters between two names with an animation delay.
     * This function has been updated to correctly handle duplicate letters.
     * @param {string} name1 - The first name.
     * @param {string} name2 - The second name.
     * @returns {Promise<number>} - A promise that resolves with the count of remaining letters.
     */
    function strikeCommonLetters(name1, name2) {
        return new Promise(resolve => {
            let name1Array = name1.split('');
            let name2Array = name2.split('');
            let remainingCount = 0;

            // Find common letters and mark them for removal
            for (let i = 0; i < name1Array.length; i++) {
                for (let j = 0; j < name2Array.length; j++) {
                    if (name1Array[i] === name2Array[j]) {
                        // Mark as null to prevent re-matching
                        name1Array[i] = null;
                        name2Array[j] = null;
                        break; // Move to the next letter in name1
                    }
                }
            }
            
            // Calculate remaining letters count
            remainingCount = name1Array.filter(Boolean).length + name2Array.filter(Boolean).length;

            // Animate striking out the letters
            let strikeDelay = 100;
            const name1Spans = name1Display.children;
            const name2Spans = name2Display.children;

            // Animate strikes for name1
            name1Array.forEach((char, i) => {
                if (char === null) {
                    setTimeout(() => name1Spans[i].classList.add('strike'), strikeDelay);
                    strikeDelay += 100;
                }
            });

            // Animate strikes for name2
            name2Array.forEach((char, i) => {
                if (char === null) {
                    setTimeout(() => name2Spans[i].classList.add('strike'), strikeDelay);
                    strikeDelay += 100;
                }
            });
            
            // Resolve with the correct count after animations are queued
            setTimeout(() => resolve(remainingCount), strikeDelay + 200);
        });
    }


    /**
     * Animates the count-up of remaining letters.
     * @param {number} finalCount - The total number of remaining letters.
     * @returns {Promise<void>} - A promise that resolves when the animation is complete.
     */
    function animateCount(finalCount) {
        return new Promise(resolve => {
            countDisplay.classList.remove('hidden');
            countDisplay.classList.add('visible');
            // If count is 0, just show it and resolve
            if (finalCount === 0) {
                 countValue.textContent = 0;
                 resolve();
                 return;
            }
            
            let currentCount = 0;
            const interval = setInterval(() => {
                currentCount++;
                countValue.textContent = currentCount;
                if (currentCount >= finalCount) {
                    clearInterval(interval);
                    resolve();
                }
            }, 100);
        });
    }

    /**
     * Calculates the final FLAMES result by striking out letters.
     * @param {number} count - The count of remaining letters.
     */
    function calculateFlames(count) {
        if (count === 0) {
            showResult('Oops!', '🤷‍♀️', 'No remaining letters means we can\'t play! Try different names.');
            return;
        }

        return new Promise(resolve => {
            let flames = ['F', 'L', 'A', 'M', 'E', 'S'];
            let index = 0;

            const strikeLoop = setInterval(() => {
                if (flames.length === 1) {
                    clearInterval(strikeLoop);
                    displayFinalResult(flames[0]);
                    resolve();
                    return;
                }

                index = (index + count - 1) % flames.length;
                const letterToStrike = flames[index];
                
                // Find the corresponding span and strike it
                const spans = Array.from(flamesBox.children);
                const spanToStrike = spans.find(span => span.textContent === letterToStrike && !span.classList.contains('strike'));
                if (spanToStrike) {
                    spanToStrike.classList.add('strike');
                }
                
                flames.splice(index, 1);

            }, 1500); // Changed from 1000ms to 1500ms for a slower animation
        });
    }

    /**
     * Displays the final result in the modal based on the remaining letter.
     * @param {string} resultLetter - The final letter from FLAMES.
     */
    function displayFinalResult(resultLetter) {
        const results = {
            'F': { title: 'Friendship', emoji: '😊', meaning: 'You are destined to be great friends!' },
            'L': { title: 'Love', emoji: '❤️', meaning: 'A beautiful love story is on the horizon!' },
            'A': { title: 'Affection', emoji: '🥰', meaning: 'There is a sweet affection between you two.' },
            'M': { title: 'Marriage', emoji: '💍', meaning: 'Wedding bells might be in your future!' },
            'E': { title: 'Enemy', emoji: '😠', meaning: 'Watch out! It seems you might be rivals.' },
            'S': { title: 'Sibling', emoji: '👫', meaning: 'You share a strong, sibling-like bond.' }
        };
        const result = results[resultLetter];
        showResult(result.title, result.emoji, result.meaning);
    }

    /**
     * Shows the result modal with the specified content.
     * @param {string} title - The title for the modal.
     * @param {string} emoji - The emoji to display.
     * @param {string} meaning - The meaning or message.
     */
    function showResult(title, emoji, meaning) {
        resultTitle.textContent = title;
        resultEmoji.textContent = emoji;
        resultMeaning.textContent = meaning;
        modal.classList.remove('hidden');
    }

    /**
     * Hides the result modal.
     */
    function closeModal() {
        modal.classList.add('hidden');
    }
});
