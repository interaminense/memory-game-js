import { Card, FormattedCard, Level } from "./components/Game/Game";
import { useEffect, useState } from "react";
import { CARDS_PATH, MAX_CARDS, EXTRA_POINT, CHEAT_KEYWORD } from "./constants";
import CryptoJS from "crypto-js";

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  let temporaryValue;
  let randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export function mapAssetsByName(cards: Card[]): {
  [key: string]: FormattedCard;
} {
  return cards.reduce(
    (
      acc: { [key: string]: FormattedCard },
      { path, flipped, matched },
      index
    ) => {
      const id = encrypt(path, getSecretKey(index));

      acc[id] = {
        flipped,
        matched,
        id,
      };

      return acc;
    },
    {}
  );
}

export function secondsToTimeFormat(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getSelectedLevel(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const levelFromQuery = urlParams.get("level");

  return levelFromQuery || Level.Normal;
}

export function calculateScore({
  timeTaken,
  pairsMissed,
  bonus,
}: {
  timeTaken: number;
  pairsMissed: number;
  bonus: boolean;
}) {
  const result = 1000 - pairsMissed - timeTaken || 0;

  return bonus ? result + EXTRA_POINT : result;
}

function canBecomeWord(word: string, desiredWord: string) {
  word = word.toLowerCase();
  desiredWord = desiredWord.toLowerCase();

  if (word.length >= desiredWord.length) {
    return false;
  }

  if (desiredWord.indexOf(word) === -1) {
    return false;
  }

  return true;
}

export function useCheat() {
  const [cheat, setCheat] = useState<string>("");

  useEffect(() => {
    if (cheat === CHEAT_KEYWORD) return;

    function downHandler({ key }: KeyboardEvent) {
      if (canBecomeWord(key, CHEAT_KEYWORD)) {
        setCheat(cheat + key);
      } else {
        setCheat("");
      }
    }

    window.addEventListener("keydown", downHandler);

    return () => {
      window.removeEventListener("keydown", downHandler);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheat]);

  return cheat === CHEAT_KEYWORD;
}

export function randomNumber(maxNumber: number) {
  return Math.floor(Math.random() * maxNumber) + 1;
}

function randomArray(total: number): number[] {
  const numbers = [];

  while (numbers.length < MAX_CARDS) {
    const number = randomNumber(MAX_CARDS);

    numbers.indexOf(number) === -1 && numbers.push(number);
  }

  return numbers.slice(0, total);
}

export function getPath(number: number) {
  return `${CARDS_PATH}/image${number}.webp`;
}

export function getCards(totalCards: number) {
  return randomArray(totalCards).map((number) => ({
    path: getPath(number),
    matched: false,
    flipped: false,
  }));
}
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: any;
  }
}

export function disableReactDevTools() {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== "object") {
    return;
  }

  for (const prop in window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    if (prop === "renderers") {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] = new Map();
    } else {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] =
        typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__[prop] === "function"
          ? () => {}
          : null;
    }
  }
}

export function encrypt(str: string, key: string) {
  return CryptoJS.AES.encrypt(str, key).toString();
}

export function decrypt(encryptedStr: string, key: string) {
  return CryptoJS.AES.decrypt(encryptedStr, key).toString(CryptoJS.enc.Utf8);
}

export function getSecretKey(index: number) {
  return `${process.env.REACT_APP_CARD_PATH_SECRET_KEY}-${index + 1}`;
}
