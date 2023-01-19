import classNames from "classnames";
import { RankingBuilder } from "ranking-builder";
import { useState } from "react";
import { EXTRA_POINT } from "../../constants";
import { calculateScore, secondsToTimeFormat } from "../../utils";
import { UserData } from "./Game";
import { ResumeBox } from "./ResumeBox";

interface IFinishModalContentProps {
  onSubmit: () => void;
  rankingBuilder: RankingBuilder;
  userData: UserData;
}

export const FinishModalContent: React.FC<IFinishModalContentProps> = ({
  onSubmit,
  rankingBuilder,
  userData,
}) => {
  const [name, setName] = useState("");
  const [validName, setValidName] = useState(true);

  return (
    <>
      <ResumeBox title="Game Over">
        <div>
          Your time: <strong>{secondsToTimeFormat(userData.timer)}</strong>
        </div>

        <div>
          Flips: <strong>{userData.flipCount}</strong>
        </div>

        <div>
          Your score:{" "}
          <strong>
            {calculateScore({
              timeTaken: userData.timer,
              pairsMissed: userData.flipCount,
              bonus: userData.bonus,
            })}
          </strong>
        </div>

        <div>
          <strong>
            {userData.bonus
              ? "You found the bonus card!"
              : "You didn't find the bonus card!"}
          </strong>
        </div>

        <form
          className="form-save-data"
          onSubmit={(event) => {
            event.preventDefault();

            const { timer, flipCount, bonus } = userData;

            if (name && name.length > 3 && timer && flipCount) {
              rankingBuilder.createUser({
                name: name.trim(),
                score: calculateScore({
                  timeTaken: timer,
                  pairsMissed: flipCount,
                  bonus,
                }),
                time: timer,
                flipCount,
                bonus: bonus ? EXTRA_POINT : 0,
              });

              setValidName(true);

              onSubmit();
            } else {
              setValidName(false);
            }
          }}
        >
          <input
            className={classNames("input-text", { valid: validName })}
            type="text"
            value={name}
            onChange={({ target: { value } }) => setName(value)}
            placeholder="Insert your name to save on ranking"
            required
            maxLength={30}
          />

          <button className="btn-level selected" type="submit">
            save
          </button>
        </form>
      </ResumeBox>

      <ResumeBox title="More about ti">
        If you're a developer, come check out{" "}
        <a
          href="https://github.com/interaminense/memory-game-js"
          target="_blank"
          rel="noreferrer"
        >
          the open source game on Github
        </a>{" "}
        and give the repository a star! I'm always looking for developers to
        help improve and evolve it. Join us and be part of the community of
        development!
        <br />
        <br />
        <div>
          Developed by{" "}
          <a href="https://interaminense.dev/" target="_blank" rel="noreferrer">
            @interaminense
          </a>
        </div>
      </ResumeBox>

      <div className="text-center">
        <button
          className="game-modal__btn btn-level selected"
          onClick={() => window.location.reload()}
        >
          Try again!
        </button>
      </div>
    </>
  );
};
