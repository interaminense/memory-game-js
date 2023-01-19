import { useMemo, useState } from "react";

import {
  getCards,
  getPath,
  mapAssetsByName,
  randomNumber,
  shuffle,
  useCheat,
} from "../../utils";
import classNames from "classnames";

import "./Game.css";
import { RankingBuilder } from "ranking-builder";
import { Modal } from "../Modal/Modal";
import { MAX_CARDS } from "../../constants";
import { ActiveCheatModalContent } from "./ActiveCheatModalContent";
import { StartModalContent } from "./StartModalContent";
import { FinishModalContent } from "./FinishModalContent";
import { GameContent } from "./GameContent";

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

export type UserData = {
  timer: number;
  flipCount: number;
  bonus: boolean;
};

export type TLevel = {
  cards: Card[];
  columns: number;
  size: number;
  total: number;
  value: Level;
};

type TLevels = {
  [key in Level]: TLevel;
};

export const levels: TLevels = {
  [Level.Easy]: {
    cards: getCards(6),
    columns: 4,
    size: 200,
    total: 6,
    value: Level.Easy,
  },
  [Level.Normal]: {
    cards: getCards(10),
    columns: 5,
    size: 150,
    total: 10,
    value: Level.Normal,
  },
  [Level.Hard]: {
    cards: getCards(18),
    columns: 6,
    size: 100,
    total: 18,
    value: Level.Hard,
  },
};

export function Game({
  level: selectedLevel,
  rankingBuilder,
}: {
  level: Level;
  rankingBuilder: RankingBuilder;
}) {
  const [showModal, setShowModal] = useState(true);
  const [view, setView] = useState<"start" | "finish" | "activeCheat">("start");

  const [userData, setUserData] = useState<UserData>({
    timer: 0,
    flipCount: 0,
    bonus: false,
  });

  const level = levels[selectedLevel];

  const activeCheat = useCheat();

  const bonusCardPath = useMemo(() => getPath(randomNumber(MAX_CARDS)), []);

  return (
    <>
      <GameContent
        activeCheat={activeCheat}
        bonusCardPath={bonusCardPath}
        className={classNames({ showCards: activeCheat })}
        cards={mapAssetsByName(shuffle([...level.cards, ...level.cards]))}
        level={level}
        onFinish={(userData) => {
          setShowModal(true);

          if (!activeCheat) {
            setUserData(userData);
            setView("finish");

            return;
          } else {
            setView("activeCheat");

            return;
          }
        }}
      />

      {showModal && (
        <Modal className="game-modal">
          <h1 className="game-modal__title">Memory Game</h1>

          {view === "activeCheat" && <ActiveCheatModalContent />}

          {view === "start" && (
            <StartModalContent
              bonusCardPath={bonusCardPath}
              onClick={() => setShowModal((showModal) => !showModal)}
            />
          )}

          {view === "finish" && (
            <FinishModalContent
              onSubmit={() => setShowModal((showModal) => !showModal)}
              rankingBuilder={rankingBuilder}
              userData={userData}
            />
          )}
        </Modal>
      )}
    </>
  );
}
