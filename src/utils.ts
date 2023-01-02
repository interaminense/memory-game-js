import { Card, CardWithId, Level } from "./components/Game/Game";
import { v4 as uuid } from "uuid";

export function shuffle<T>(array: T[]): T[] {
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
  level,
  timeTaken,
  pairsMissed,
}: {
  level: Level;
  timeTaken: number;
  pairsMissed: number;
}) {
  let score = 0;

  if (level === Level.Easy) {
    score = 1000 - pairsMissed;
  } else if (level === Level.Normal) {
    score = 2000 - pairsMissed;
  } else {
    score = 3000 - pairsMissed;
  }

  score -= timeTaken;

  return score || 0;
}
