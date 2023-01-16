import { EXTRA_POINT, TOP_RESULTS } from "../../constants";
import { BonusCard } from "../BonusCard/BonusCard";
import { ResumeBox } from "./ResumeBox";

interface IStartModalContentProps {
  bonusCardPath: string;
  onClick: () => void;
}

export const StartModalContent: React.FC<IStartModalContentProps> = ({
  bonusCardPath,
  onClick,
}) => {
  return (
    <>
      <ResumeBox title="Game">
        It is an online memory game that uses a ranking system to display the
        top {TOP_RESULTS} users for each level.
      </ResumeBox>

      <ResumeBox title="Score">
        The score is initially calculated with 1000 points and is reduced by one
        point per second. When the game is finished, points are also subtracted
        based on the number of times a pair of cards was turned over. The game
        only starts after the user clicks on the first card to flip it.
      </ResumeBox>

      <ResumeBox title="Bonus Card">
        Hey there! If you find this BONUS CARD on the board, your score will
        increase by {EXTRA_POINT} points! That's right, you'll earn an extra{" "}
        {EXTRA_POINT} points just by finding the bonus card. See{" "}
        <a href="/memory-game-js/cards/" target="_blank">
          list of cards
        </a>
        <div className="game-modal__resume__bonus-card">
          <BonusCard path={bonusCardPath} />
        </div>
      </ResumeBox>

      <div className="text-center">
        <button
          className="game-modal__btn btn-level selected"
          onClick={onClick}
        >
          Got it!
        </button>
      </div>
    </>
  );
};
