import { Card, CardWithId, Level } from "./components/Game/Game";
import { v4 as uuid } from "uuid";
import { useEffect, useState } from "react";

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

export function mapAssetsByName(cards: Card[]): { [key: string]: CardWithId } {
  return cards.reduce((acc: { [key: string]: CardWithId }, card) => {
    const id = uuid();

    acc[id] = {
      ...card,
      id,
    };

    return acc;
  }, {});
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
}: {
  timeTaken: number;
  pairsMissed: number;
}) {
  return 1000 - pairsMissed - timeTaken || 0;
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
  const spell = "revelio";
  const [cheat, setCheat] = useState<string>("");

  useEffect(() => {
    function downHandler({ key }: KeyboardEvent) {
      if (canBecomeWord(key, spell)) {
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

  return cheat === spell;
}
