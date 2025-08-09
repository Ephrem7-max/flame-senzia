document.addEventListener('DOMContentLoaded', () => {
    // --- Paste your Giphy API Key here ---
    const GIPHY_API_KEY = 'dlW7YFaGJ5IQyAjPe669ajYJwNpkytGV';

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
    const resultMemeContainer = document.getElementById('result-meme-container');
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

    async function startGame() {
        const name1 = name1Input.value.toLowerCase().replace(/[^a-z]/g, '');
        const name2 = name2Input.value.toLowerCase().replace(/[^a-z]/g, '');

        if (!name1 || !name2) {
            await showResult('Error', 'Please enter both names to play!');
            return;
        }

        resetUI();
        processingArea.classList.remove('hidden');
        displayNames(name1, name2);
        const remainingCount = await strikeCommonLetters(name1, name2);
        await animateCount(remainingCount);
        flamesContainer.classList.remove('hidden');
        flamesContainer.classList.add('visible');
        await calculateFlames(remainingCount);
    }

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

    function strikeCommonLetters(name1, name2) {
        return new Promise(resolve => {
            let name1Array = name1.split('');
            let name2Array = name2.split('');
            let remainingCount = 0;

            for (let i = 0; i < name1Array.length; i++) {
                for (let j = 0; j < name2Array.length; j++) {
                    if (name1Array[i] === name2Array[j]) {
                        name1Array[i] = null;
                        name2Array[j] = null;
                        break;
                    }
                }
            }
            
            remainingCount = name1Array.filter(Boolean).length + name2Array.filter(Boolean).length;

            let strikeDelay = 100;
            const name1Spans = name1Display.children;
            const name2Spans = name2Display.children;

            name1Array.forEach((char, i) => {
                if (char === null) {
                    setTimeout(() => name1Spans[i].classList.add('strike'), strikeDelay);
                    strikeDelay += 100;
                }
            });

            name2Array.forEach((char, i) => {
                if (char === null) {
                    setTimeout(() => name2Spans[i].classList.add('strike'), strikeDelay);
                    strikeDelay += 100;
                }
            });
            
            setTimeout(() => resolve(remainingCount), strikeDelay + 200);
        });
    }

    function animateCount(finalCount) {
        return new Promise(resolve => {
            countDisplay.classList.remove('hidden');
            countDisplay.classList.add('visible');
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

    function calculateFlames(count) {
        if (count === 0) {
            showResult('Oops!', 'No remaining letters means we can\'t play! Try different names.');
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
                
                const spans = Array.from(flamesBox.children);
                const spanToStrike = spans.find(span => span.textContent === letterToStrike && !span.classList.contains('strike'));
                if (spanToStrike) {
                    spanToStrike.classList.add('strike');
                }
                
                flames.splice(index, 1);
            }, 1500);
        });
    }

    /**
     * Fetches a meme and displays the final result in the modal.
     * @param {string} resultLetter - The final letter from FLAMES.
     */
    async function displayFinalResult(resultLetter) {
        const results = {
            'F': { title: 'Friendship', meaning: 'You are destined to be great friends!', searchTerm: 'best friends' },
            'L': { title: 'Love', meaning: 'A beautiful love story is on the horizon!', searchTerm: 'love' },
            'A': { title: 'Affection', meaning: 'There is a sweet affection between you two.', searchTerm: 'hugs' },
            'M': { title: 'Marriage', meaning: 'Wedding bells might be in your future!', searchTerm: 'wedding' },
            'E': { title: 'Enemy', meaning: 'Watch out! It seems you might be rivals.', searchTerm: 'angry' },
            'S': { title: 'Sibling', meaning: 'You share a strong, sibling-like bond.', searchTerm: 'siblings' }
        };
        const result = results[resultLetter];
        
        // Show a loading message while fetching the meme
        showResult(result.title, result.meaning, null, true);

        try {
            const response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${GIPHY_API_KEY}&tag=${result.searchTerm}&rating=g`);
            const data = await response.json();
            const imageUrl = data.data.images.downsized_medium.url;
            showResult(result.title, result.meaning, imageUrl, false);
        } catch (error) {
            console.error('Failed to fetch meme:', error);
            // Fallback to a simple message if the API fails
            showResult(result.title, result.meaning, null, false);
        }
    }

    /**
     * Shows the result modal with the specified content.
     * @param {string} title - The title for the modal.
     * @param {string} meaning - The meaning or message.
     * @param {string|null} imageUrl - The URL of the meme to display.
     * @param {boolean} isLoading - Whether to show a loading state.
     */
    function showResult(title, meaning, imageUrl = null, isLoading = false) {
        resultTitle.textContent = title;
        resultMeaning.textContent = meaning;
        resultMemeContainer.innerHTML = ''; // Clear previous meme/emoji

        if (isLoading) {
            resultMemeContainer.textContent = 'Loading meme...';
        } else if (imageUrl) {
            const memeImg = document.createElement('img');
            memeImg.src = imageUrl;
            memeImg.alt = title;
            memeImg.style.maxWidth = '100%';
            memeImg.style.maxHeight = '250px';
            memeImg.style.borderRadius = '10px';
            resultMemeContainer.appendChild(memeImg);
        } else {
             // Fallback if there's an error or no image
            resultMemeContainer.textContent = '🤔';
        }

        modal.classList.remove('hidden');
    }

    function closeModal() {
        modal.classList.add('hidden');
    }
});
