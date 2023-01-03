import { RankingBuilderRenderer } from "ranking-builder";
import { RankingBuilder } from "ranking-builder";

type Card = {
  size: number;
  columns: number;
};

type Level = {
  total: number;
  columns: number;
  size: number;
};

type Options = {
  flipCardTime?: number;
  levels: {
    [key: string]: Level;
  };
};

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGIN_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const rankingBuilder = new RankingBuilder({ path: "memory-game-js" }, config);
const ranking = document.querySelector("#ranking") as Node;

// @ts-ignore

window.rankingBuilder = rankingBuilder;

new RankingBuilderRenderer({ app: ranking, rankingBuilder });

// Utils

const createElement = (tmpl: string) =>
  new DOMParser().parseFromString(tmpl, "text/html").body.firstChild;

const shuffle = (array: string[]) => {
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
};

function formatNumber(n: number) {
  return `${n < 10 ? `0${n}` : n}`;
}

const getTime = (time: number, showMs?: boolean) => {
  const ms = time % 1000;
  time = (time - ms) / 1000;

  const secs = time % 60;
  time = (time - secs) / 60;

  const mins = time % 60;
  const hrs = (time - mins) / 60;

  const formattedTime = `${formatNumber(hrs)}:${formatNumber(
    mins
  )}:${formatNumber(secs)}`;

  return showMs ? `${formattedTime}:${ms}` : formattedTime;
};

const getSeconds = (time: number) => {
  const secs = time % 60;
  time = (time - secs) / 60;

  return formatNumber(secs);
};

const getSelectedLevel = (): string => {
  const urlParams = new URLSearchParams(window.location.search);
  const levelFromQuery = urlParams.get("level");

  return levelFromQuery || "normal";
};

// Constants

const BTN_LABELS: { [key: string]: string } = {
  easy: "EASY_LEVEL",
  normal: "NORMAL_LEVEL",
  hard: "HARD_LEVEL",
};

const TMPL: { [key: string]: Node | null | ((...params: any) => Node | null) } =
  {
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
    CARD: (name: string, { size }: Card) =>
      createElement(`
        <div
            class="card"
            data-id="${name}"
            style="width: ${size}px; height: ${size}px"
        >
            <div class="card__content">
                <div class="card__front-face">
                    <img src="./src/assets/${name}.png" alt="" />
                </div>
                <div class="card__back-face"></div>
            </div>
        </div>
    `),
    BOARD: ({ columns, size }: Card) =>
      createElement(`
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
    TIME: createElement(`<div class="time"></div>`),
  };

const CARDS: { [key: string]: string[] } = {
  easy: ["bat", "bee", "burger", "butterfly", "cat", "frog"],
  normal: [
    "bat",
    "bee",
    "burger",
    "butterfly",
    "cat",
    "frog",
    "monkey",
    "penguin",
    "robot",
    "seal",
  ],
  hard: [
    "bat",
    "bee",
    "burger",
    "butterfly",
    "cat",
    "frog",
    "monkey",
    "penguin",
    "robot",
    "seal",
    "shark",
    "sheep",
    "snail",
    "turtle",
    "vegetables",
    "shark2",
    "dream",
    "cat2",
  ],
};

const calculateScore = (
  level: string,
  timeTaken: number,
  pairsMissed: number
) => {
  let score = 0;

  if (level === "easy") {
    score = 1000 - pairsMissed;
  } else if (level === "normal") {
    score = 2000 - pairsMissed;
  } else {
    score = 3000 - pairsMissed;
  }

  score -= timeTaken;

  return score || 0;
};

// Game

const Game = (selector: string, options: Options) => {
  const { flipCardTime = 1000, levels } = options;

  const app = document.querySelector(selector) as HTMLElement;

  const level = levels[getSelectedLevel()];

  let cards = CARDS[getSelectedLevel()];

  let countFlips = 1;
  let hasFlippedCard = false;
  let lockBoard = false;
  let totalCards = cards.length;
  let firstCard: any,
    secondCard: any,
    startedTime: number,
    timeInterval: number;

  // Check if the cards does match

  const checkMatch = () => firstCard.dataset.id === secondCard.dataset.id;

  // Check if the game are finished

  const checkFinished = () => {
    totalCards--;

    if (totalCards === 0) {
      const time = new Date().getTime() - startedTime;

      rankingBuilder.createUser({
        name: "Adriano",
        score: calculateScore(
          getSelectedLevel(),
          Number(getSeconds(time)),
          countFlips
        ),
        time: getTime(time),
      });

      console.log("FINISHED", getTime(time), countFlips);

      clearInterval(timeInterval);
    }
  };

  // Create Board Game

  const createBoardGame = () => {
    const boardTMPL = TMPL["BOARD"] as (level: Level) => Node;
    const cardTMPL = TMPL["CARD"] as (name: string, level: Level) => Node;

    let board = boardTMPL(level) as Node;
    const cardGroup = shuffle([...cards, ...cards]);

    cardGroup.forEach((name) =>
      board.appendChild(cardTMPL(name, level) as Node)
    );

    return board;
  };

  // Reset Board Game

  const resetBoardGame = () => {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  };

  // Disable card while does not match

  const disableCards = () => {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    resetBoardGame();
  };

  // Unflip Cards

  const unflipCards = () => {
    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.remove("flip");
      secondCard.classList.remove("flip");

      resetBoardGame();
    }, flipCardTime);
  };

  // Flip Cards

  const flipCard = (event: Event) => {
    // Start Time
    if (!startedTime) {
      startedTime = new Date().getTime();

      // Update time in the DOM
      updateTime();
    }

    // Board Blocked
    if (lockBoard) return;

    // Click in the same card
    if (firstCard && event.currentTarget === firstCard) return;

    // Add flip classname
    const element = event.currentTarget as HTMLElement;

    element.classList.add("flip");

    // Store First Card
    if (!hasFlippedCard) {
      hasFlippedCard = true;
      firstCard = event.currentTarget;

      return;
    }

    // Store Second Card
    secondCard = event.currentTarget;

    // Count flips iterator
    const countElement = document.querySelector(
      ".count-flips .count"
    ) as HTMLElement;

    countElement.textContent = String(countFlips++);

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
  };

  // Create count flip element

  const createCountFlips = () => {
    const countFlipsElement = TMPL["COUNT_FLIPS"] as HTMLElement;
    const countElement = countFlipsElement.querySelector(
      ".count"
    ) as HTMLElement;
    countElement.textContent = "0";

    return countFlipsElement;
  };

  const selectLevelGame = ({
    target: {
      dataset: { id },
    },
  }: any) => {
    window.location.search = `level=${id}`;
  };

  // Create Level Game Buttons

  const createLevelGame = () => {
    const containerLevel = TMPL["CONTAINER_LEVEL"] as HTMLElement;
    const containerLevelContent = containerLevel.querySelector(
      ".level__content"
    ) as HTMLElement;
    const btn = TMPL[BTN_LABELS[getSelectedLevel()]] as HTMLElement;

    btn.classList.add("selected");

    containerLevel.addEventListener("click", selectLevelGame);

    containerLevelContent.appendChild(TMPL["EASY_LEVEL"] as HTMLElement);
    containerLevelContent.appendChild(TMPL["NORMAL_LEVEL"] as HTMLElement);
    containerLevelContent.appendChild(TMPL["HARD_LEVEL"] as HTMLElement);

    return containerLevel;
  };

  const createTime = () => {
    const timeElement = TMPL["TIME"] as HTMLElement;
    timeElement.textContent = String(getTime(0));

    return timeElement;
  };

  const updateTime = () => {
    const timeElement = document.querySelector(".time") as HTMLElement;

    setInterval(() => {
      timeElement.textContent = String(
        getTime(new Date().getTime() - startedTime)
      );
    }, 1000);
  };

  // Clear App

  app.innerHTML = "";

  const header = TMPL["HEADER"] as HTMLElement;
  const footer = TMPL["FOOTER"] as HTMLElement;

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
  document
    .querySelectorAll(".card")
    .forEach((card) => card.addEventListener("click", flipCard));
};

window.onload = () => {
  Game("#app", {
    flipCardTime: 1000,
    levels: {
      easy: {
        total: 6,
        columns: 4,
        size: 200,
      },
      normal: {
        total: 10,
        columns: 5,
        size: 150,
      },
      hard: {
        total: 18,
        columns: 6,
        size: 100,
      },
    },
  });
};
