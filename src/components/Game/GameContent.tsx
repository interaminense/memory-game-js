import confetti from "canvas-confetti";
import classNames from "classnames";
import { useState, useEffect, useRef } from "react";
import { decrypt, getSecretKey, secondsToTimeFormat } from "../../utils";
import { BonusCard } from "../BonusCard/BonusCard";
import { FormattedCard, levels, TLevel, UserData } from "./Game";

interface IGameContentProps extends React.HTMLAttributes<HTMLElement> {
  activeCheat: boolean;
  bonusCardPath: string;
  cards: { [key: string]: FormattedCard };
  level: TLevel;
  onFinish: (userData: UserData) => void;
}

export const GameContent: React.FC<IGameContentProps> = ({
  activeCheat,
  bonusCardPath,
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
  const [firstCard, setFirstCard] = useState<FormattedCard | null>(null);
  const [cards, setCards] = useState<{ [key: string]: FormattedCard }>(
    initialCards
  );
  const [bonus, setbonus] = useState(false);
  const timerInterval = useRef<any>(null);

  useEffect(() => {
    if (startTimer) {
      timerInterval.current = setInterval(() => {
        setTimer((timer) => {
          return timer + 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval.current);
  }, [startTimer]);

  useEffect(() => {
    if (remainingPairs === 0) {
      clearInterval(timerInterval.current);

      setTimeout(() => onFinish({ timer, flipCount, bonus }), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipCount, remainingPairs, timer]);

  const onCardClick = (
    card: FormattedCard,
    secretKey: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    setLock(true);
    setStartTimer(true);

    if (!firstCard) {
      const firstCard = {
        ...card,
        flipped: true,
        secretKey,
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

    const cardPath = decrypt(card.id, secretKey);
    const firstCardPath = decrypt(firstCard.id, firstCard.secretKey as string);

    if (firstCardPath === cardPath && firstCard.id !== card.id) {
      let confettiParticles = {
        gravity: 3,
        decay: 0.95,
        particleCount: 150,
        origin: {
          x: event.clientX / window.innerWidth,
          y: event.clientY / window.innerHeight,
        },
        spread: 100,
      };

      if (cardPath === bonusCardPath) {
        setbonus(true);

        confettiParticles = {
          ...confettiParticles,
          particleCount: 300,
          // @ts-ignore
          colors: ["#cdcdcd", "#ffeb3b"],
          // @ts-ignore
          shapes: ["star"],
        };
      }

      confetti(confettiParticles);

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
        <div className="board__bonus-card">
          <h4 className="board__bonus-card__title">Bonus Card</h4>

          <BonusCard path={bonusCardPath} />
        </div>
        {Object.keys(cards).map((key, index) => {
          const { flipped, id, matched } = cards[key];
          const secretKey = getSecretKey(index);

          return (
            <div
              key={key}
              className={classNames("card", {
                flip: flipped,
              })}
              onClick={
                firstCard?.id === id || matched || lock
                  ? () => {}
                  : (event) => onCardClick(cards[key], secretKey, event)
              }
              style={{ width: size, height: size }}
            >
              <div className="card__content">
                {(flipped || activeCheat) && (
                  <div
                    className="card__front-face"
                    style={{
                      backgroundImage: `url(${decrypt(id, secretKey)})`,
                      backgroundSize: size,
                    }}
                  />
                )}
                <div
                  className="card__back-face"
                  style={{
                    backgroundImage: `url(${bonusCardPath})`,
                    backgroundSize: size,
                  }}
                />
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
