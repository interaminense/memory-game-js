import { useEffect, useState } from "react";

import { cards } from "../../constants";
import {
  calculateScore,
  getSelectedLevel,
  mapAssetsByName,
  secondsToTimeFormat,
  shuffle,
} from "../../utils";
import classNames from "classnames";

import "./Game.css";
import { RankingBuilder } from "ranking-builder";

export interface Card {
  flipped: boolean;
  matched: boolean;
  path: string;
}

export interface CardWithId extends Card {
  id: string;
}

export enum Level {
  Easy = "EASY",
  Normal = "NORMAL",
  Hard = "HARD",
}

type TLevel = {
  cards: Card[];
  columns: number;
  size: number;
  total: number;
  value: Level;
};

type TLevels = {
  [key in Level]: TLevel;
};

const levels: TLevels = {
  [Level.Easy]: {
    cards: cards.slice(0, 6),
    columns: 4,
    size: 200,
    total: 6,
    value: Level.Easy,
  },
  [Level.Normal]: {
    cards: cards.slice(0, 10),
    columns: 5,
    size: 150,
    total: 10,
    value: Level.Normal,
  },
  [Level.Hard]: {
    cards: cards.slice(0, 18),
    columns: 6,
    size: 100,
    total: 18,
    value: Level.Hard,
  },
};

interface IGameContentProps {
  cards: { [key: string]: CardWithId };
  level: TLevel;
  rankingBuilder: RankingBuilder<{
    path: string;
  }>;
}

const GameContent: React.FC<IGameContentProps> = ({
  cards: initialCards,
  level: { columns, size, total, value },
  rankingBuilder,
}) => {
  const [lock, setLock] = useState(false);
  const [timer, setTimer] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const [remainingPairs, setRemainingPairs] = useState(total);
  const [firstCard, setFirstCard] = useState<CardWithId | null>(null);
  const [cards, setCards] = useState<{ [key: string]: CardWithId }>(
    initialCards
  );

  useEffect(() => {
    let timerInterval: any;

    if (startTimer) {
      timerInterval = setInterval(() => {
        setTimer((timer) => {
          if (remainingPairs === 0) {
            clearInterval(timerInterval);

            return timer;
          }

          return timer + 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [remainingPairs, startTimer]);

  useEffect(() => {
    if (remainingPairs === 0) {
      rankingBuilder.createUser({
        name: "Adriano2",
        score: calculateScore({
          level: value,
          timeTaken: timer,
          pairsMissed: flipCount,
        }),
        time: secondsToTimeFormat(timer),
      });
    }
  }, [flipCount, rankingBuilder, remainingPairs, timer, value]);

  return (
    <>
      <div className="header">
        <h1 className="header__title">Memory Game</h1>

        <div className="level">
          <div className="level__content">
            {Object.keys(levels).map((key) => (
              <button
                onClick={() => (window.location.search = `level=${key}`)}
                className={classNames("btn-level", {
                  selected: value === key,
                })}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="board"
        style={{ gridTemplateColumns: `repeat(${columns}, ${size}px)` }}
      >
        {Object.keys(cards).map((key) => {
          const { flipped, id, matched, path } = cards[key];

          return (
            <div
              key={key}
              className={classNames("card", {
                flip: flipped,
              })}
              onClick={
                firstCard?.id === id || matched || lock
                  ? () => {}
                  : () => {
                      const card = cards[key];

                      setLock(true);
                      setStartTimer(true);

                      if (!firstCard) {
                        const firstCard = {
                          ...card,
                          flipped: true,
                        };

                        setFirstCard(firstCard);

                        setCards({
                          ...cards,
                          [card.id]: firstCard,
                        });

                        setLock(false);

                        return;
                      }

                      setFlipCount((count) => count + 1);

                      setCards({
                        ...cards,
                        [card.id]: {
                          ...card,
                          flipped: true,
                        },
                      });

                      if (
                        firstCard.path === card.path &&
                        firstCard.id !== card.id
                      ) {
                        setCards({
                          ...cards,
                          [firstCard.id]: {
                            ...firstCard,
                            flipped: true,
                            matched: true,
                          },
                          [card.id]: {
                            ...card,
                            flipped: true,
                            matched: true,
                          },
                        });

                        setFirstCard(null);
                        setRemainingPairs(remainingPairs - 1);
                        setLock(false);

                        return;
                      }

                      setTimeout(() => {
                        setCards({
                          ...cards,
                          [firstCard.id]: {
                            ...firstCard,
                            flipped: false,
                          },
                          [card.id]: {
                            ...card,
                            flipped: false,
                          },
                        });

                        setFirstCard(null);
                        setLock(false);
                      }, 1000);
                    }
              }
              style={{ width: size, height: size }}
            >
              <div className="card__content">
                <div className="card__front-face">
                  <img src={path} alt={path} />
                </div>
                <div className="card__back-face" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="footer">
        <div className="count-flips">
          flip count <span className="count">{flipCount}</span>
        </div>
        <div className="time">{secondsToTimeFormat(timer)}</div>
      </div>
    </>
  );
};

export function Game({
  rankingBuilder,
}: {
  rankingBuilder: RankingBuilder<{
    path: string;
  }>;
}) {
  const level = levels[getSelectedLevel() as Level];
  const duplicatedCards: Card[] = shuffle([...level.cards, ...level.cards]);

  return (
    <GameContent
      cards={mapAssetsByName(duplicatedCards)}
      level={level}
      rankingBuilder={rankingBuilder}
    />
  );
}
