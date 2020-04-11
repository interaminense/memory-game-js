// Utils

const createElement = tmpl => new DOMParser().parseFromString(tmpl, 'text/html').body.firstChild;

const shuffle = array => {
    let currentIndex = array.length;
    let temporaryValue;
    let randomIndex;
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
    
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
    
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    
    return array;
}

const getTime = (time, showMs) => {
    const ms = time % 1000;
    time = (time - ms) / 1000;

    const secs = time % 60;
    time = (time - secs) / 60;

    const mins = time % 60;
    const hrs = (time - mins) / 60;
    
    function formatNumber (n) {
        return `${n < 10 ? `0${n}` : n}`;
    };

    const formattedTime = `${formatNumber(hrs)}:${formatNumber(mins)}:${formatNumber(secs)}`;

    return showMs ? `${formattedTime}:${ms}` : formattedTime; 
}

const getSelectedLevel = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const levelFromQuery = urlParams.get('level');

    return levelFromQuery || 'normal';
}

// Constants

const BTN_LABELS = {
    'easy': 'EASY_LEVEL',
    'normal': 'NORMAL_LEVEL',
    'hard': 'HARD_LEVEL'
}

const TMPL = {
    HEADER: createElement(`
        <div class="header">
            <h1 class="header__title">Memory Game</h1>
        </div>
    `),
    FOOTER: createElement(`<div class="footer"></div>`),
    COUNT_FLIPS: createElement(`
        <div class="count-flips">
            flip count
            <span class="count"></span>
        </div>
    `),
    CARD: (name, {size}) => createElement(`
        <div
            class="card"
            data-id="${name}"
            style="width: ${size}px; height: ${size}px"
        >
            <div class="card__content">
                <div class="card__front-face">
                    <img src="https://api.adorable.io/avatars/200/${name}.png" alt="" />
                </div>
                <div class="card__back-face"></div>
            </div>
        </div>
    `),
    BOARD: ({columns, size}) => createElement(`
        <div
            class="board"
            style="grid-template-columns: repeat(${columns}, ${size}px);"
        ></div>
    `),
    CONTAINER_LEVEL: createElement(`
        <div class="level">
            <div class="level__content"></div>
        </div>
    `),
    EASY_LEVEL: createElement(`
        <button class="btn-level" data-id="easy">easy</button>
    `),
    NORMAL_LEVEL: createElement(`
        <button class="btn-level" data-id="normal">normal</button>
    `),
    HARD_LEVEL: createElement(`
        <button class="btn-level" data-id="hard">hard</button>
    `),
    TIME: createElement(`<div class="time"></div>`)
};

// Game

const Game = (selector, options) => {
    const {flipCardTime = 1000, levels} = options;

    const app = document.querySelector(selector);

    const level = levels[getSelectedLevel()];

    let cards = [];
    
    for (let index = 0; index < level.total; index++) {
        cards.push(index);
    }
    
    let countFlips = 1;
    let hasFlippedCard = false;
    let lockBoard = false;
    let totalCards = cards.length;
    let firstCard, secondCard, startedTime, timeInterval;

    /**
     * Check if the cards does match
     */
    const checkMatch = () => firstCard.dataset.id === secondCard.dataset.id;

    /**
     * Check if the game are finished
     */
    const checkFinished = () => {
        totalCards--;

        if (totalCards === 0) {
            console.log('FINISHED', getTime(new Date().getTime() - startedTime));

            clearInterval(timeInterval);
        }
    }

    /**
     * Create Board Game
     */
    const createBoardGame = () => {
        let board = TMPL['BOARD'](level);
        const cardGroup = shuffle([...cards, ...cards]);

        cardGroup.forEach(name => board.appendChild(TMPL['CARD'](name, level)));

        return board;
    }

    /**
     * Reset Board Game
     */
    const resetBoardGame = () => {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    /**
     * Disable card while does not match
     */
    const disableCards = () => {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
    
        resetBoardGame();
    }

    /**
     * Unflip cards
     */
    const unflipCards = () => {
        lockBoard = true;
    
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');

            resetBoardGame();
        }, flipCardTime);
    }

    /**
     * Flip Cards
     * @param {Event} event 
     */
    const flipCard = event => {
        // Start Time
        if (!startedTime) {
            startedTime = new Date().getTime();

            // Update time in the DOM
            updateTime();
        };

        // Board Blocked
        if (lockBoard) return;

        // Click in the same card
        if (firstCard && event.currentTarget === firstCard) return;

        // Add flip classname
        event.currentTarget.classList.add('flip');

        // Store First Card
        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = event.currentTarget;
        
            return;
        }

        // Store Second Card
        secondCard = event.currentTarget;

        // Count flips iterator
        document.querySelector('.count-flips .count').textContent = countFlips++;

        // Check if has match between cards
        if (checkMatch()) {
            // Remove clicks for matched cards
            disableCards();

            // Check if game is finished
            checkFinished();

            return;
        }

        // Unflip cards if does not match
        unflipCards();
    }

    /**
     * Create count flip element
     */
    const createCountFlips = () => {
        const countFlipsElement = TMPL['COUNT_FLIPS'];
        countFlipsElement.querySelector('.count').textContent = 0;

        return countFlipsElement;
    }

    const selectLevelGame = ({target: {dataset: {id: lvl}}}) => {
        window.location.search = `level=${lvl}`;
    }

    /**
     * Create Level Game Buttons
     */
    const createLevelGame = () => {
        const containerLevel = TMPL['CONTAINER_LEVEL'];
        const containerLevelContent = containerLevel.querySelector('.level__content');

        TMPL[BTN_LABELS[getSelectedLevel()]].classList.add('selected');

        containerLevel.addEventListener('click', selectLevelGame);
    
        containerLevelContent.appendChild(TMPL['EASY_LEVEL']);
        containerLevelContent.appendChild(TMPL['NORMAL_LEVEL']);
        containerLevelContent.appendChild(TMPL['HARD_LEVEL']);

        return containerLevel;
    }

    const createTime = () => {
        const timeElement = TMPL['TIME'];
        timeElement.textContent = getTime(0);

        return timeElement;
    }

    const updateTime = () => {
        const timeElement = document.querySelector('.time');
        timeInterval = setInterval(() => {
            timeElement.textContent = getTime(new Date().getTime() - startedTime)
        }, 1000);
    }

    // const createHeader = () => {
    //     const headerElement = TMPL['HEADER'];

    //     return headerElement;
    // }

    // Clear App
    app.innerHTML = "";

    const header = TMPL['HEADER'];
    const footer = TMPL['FOOTER'];

    // Create options to select level
    header.appendChild(createLevelGame());

    // Add Header
    app.appendChild(header);
    
    // Add board game within App
    app.appendChild(createBoardGame());

    // Create count flips
    footer.appendChild(createCountFlips());
    
    // Create time
    footer.appendChild(createTime());

    // Add Footer
    app.appendChild(footer);

    // Add Eventlistener in all cards
    document.querySelectorAll('.card').forEach(card => card.addEventListener('click', flipCard));
};