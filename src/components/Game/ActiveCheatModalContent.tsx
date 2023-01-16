import { ResumeBox } from "./ResumeBox";

export function ActiveCheatModalContent() {
  return (
    <>
      <div className="text-center">
        <ResumeBox title="Oops, you cheated!">
          The magic has turned against the wizard
          <br />
          and you cannot save your data because of it!
          <br />
          <br />
          <div>
            <img
              src="https://i.giphy.com/media/wLBS2GlPDALS0/giphy.webp"
              alt="giphy"
            />
          </div>
        </ResumeBox>
      </div>

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
}
