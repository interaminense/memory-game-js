import { useEffect, useState } from "react";

import { cards } from "../../constants";
import {
  calculateScore,
  mapAssetsByName,
  secondsToTimeFormat,
  shuffle,
  useCheat,
} from "../../utils";
import classNames from "classnames";

import "./Game.css";
import { RankingBuilder } from "ranking-builder";
import confetti from "canvas-confetti";
import { Modal } from "../Modal/Modal";

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

interface IGameContentProps extends React.HTMLAttributes<HTMLElement> {
  cards: { [key: string]: CardWithId };
  level: TLevel;
  onFinish: (userData: { timer: number; flipCount: number }) => void;
}

const GameContent: React.FC<IGameContentProps> = ({
  cards: initialCards,
  className,
  level: { columns, size, total, value },
  onFinish,
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
      setTimeout(() => onFinish({ timer, flipCount }), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipCount, remainingPairs, timer]);

  const onCardClick = (
    card: CardWithId,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
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

    if (firstCard.path === card.path && firstCard.id !== card.id) {
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

      confetti({
        gravity: 3,
        decay: 0.95,
        particleCount: 150,
        origin: {
          x: event.clientX / window.innerWidth,
          y: event.clientY / window.innerHeight,
        },
        spread: 60,
      });

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
  };

  return (
    <>
      <div className="header">
        <h1 className="header__title">Memory Game</h1>

        <div className="level">
          <div className="level__content">
            {Object.keys(levels).map((key) => (
              <button
                key={key}
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
        className={classNames("board", className)}
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
                  : (event) => onCardClick(cards[key], event)
              }
              style={{ width: size, height: size }}
            >
              <div className="card__content">
                <div
                  className="card__front-face"
                  style={{
                    backgroundImage: `url(${path})`,
                    backgroundSize: size,
                  }}
                />
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
  level,
  rankingBuilder,
}: {
  level: Level;
  rankingBuilder: RankingBuilder;
}) {
  const objectLevel = levels[level];
  const duplicatedCards: Card[] = shuffle([
    ...objectLevel.cards,
    ...objectLevel.cards,
  ]);
  const [showModal, setShowModal] = useState(true);
  const [view, setView] = useState<"start" | "finish" | "cheatActive">("start");
  const [name, setName] = useState("");
  const [userData, setUserData] = useState<{
    timer: number;
    flipCount: number;
  }>({ timer: 0, flipCount: 0 });
  const [nameValid, setNameValid] = useState(true);

  const cheatActive = useCheat();

  return (
    <>
      <GameContent
        className={classNames({ showCards: cheatActive })}
        cards={mapAssetsByName(duplicatedCards)}
        level={objectLevel}
        onFinish={(userData) => {
          setShowModal(true);

          if (!cheatActive) {
            setUserData(userData);
            setView("finish");

            return;
          } else {
            setView("cheatActive");

            return;
          }
        }}
      />

      {showModal && (
        <Modal className="game-modal">
          <h1 className="game-modal__title">Memory Game</h1>

          {view === "cheatActive" && (
            <>
              <p className="game-modal__resume">
                The sorcery has turned against the sorcerer and you cannot save
                your data because of it!
              </p>

              <div className="text-center">
                <button
                  className="game-modal__btn btn-level selected"
                  onClick={() => window.location.reload()}
                >
                  Try again!
                </button>
              </div>
            </>
          )}

          {view === "start" && (
            <>
              <p className="game-modal__resume">
                It is an online memory game. It uses a ranking system to display
                the top 10 users for each level. The score is initially
                calculated with 1000 points and is reduced by one point per
                second. When the game is finished, points are also subtracted
                based on the number of times a pair of cards was turned over.
                The game only starts after the user clicks on the first card to
                flip it.
              </p>

              <div className="text-center">
                <button
                  className="game-modal__btn btn-level selected"
                  onClick={() => setShowModal((showModal) => !showModal)}
                >
                  Got it!
                </button>
              </div>
            </>
          )}

          {view === "finish" && (
            <>
              <p className="game-modal__resume">
                <div>
                  Your time:{" "}
                  <strong>{secondsToTimeFormat(userData.timer)}</strong>
                </div>

                <div>
                  Flip count: <strong>{userData.flipCount}</strong>
                </div>

                <div>
                  Your score:{" "}
                  <strong>
                    {calculateScore({
                      timeTaken: userData.timer,
                      pairsMissed: userData.flipCount,
                    })}
                  </strong>
                </div>

                <form
                  className="form-save-data"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const { timer, flipCount } = userData;

                    if (name && name.length > 3 && timer && flipCount) {
                      rankingBuilder.createUser({
                        name: name.trim(),
                        score: calculateScore({
                          timeTaken: timer,
                          pairsMissed: flipCount,
                        }),
                        time: secondsToTimeFormat(timer),
                        flipCount,
                      });

                      setNameValid(true);
                      setShowModal((showModal) => !showModal);
                    } else {
                      setNameValid(false);
                    }
                  }}
                >
                  <input
                    className={classNames("input-text", { valid: nameValid })}
                    type="text"
                    value={name}
                    onChange={({ target: { value } }) => setName(value)}
                    placeholder="Insert your name to save on ranking"
                    required
                    maxLength={30}
                  />

                  <button className="btn-level" type="submit">
                    save
                  </button>
                </form>

                <div className="text-center">
                  <button
                    className="game-modal__btn btn-level selected"
                    onClick={() => window.location.reload()}
                  >
                    Try again!
                  </button>
                </div>
              </p>
            </>
          )}
        </Modal>
      )}
    </>
  );
}
