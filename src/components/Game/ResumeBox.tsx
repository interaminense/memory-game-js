interface IResumeBoxProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
}

export const ResumeBox: React.FC<IResumeBoxProps> = ({ title, children }) => {
  return (
    <div className="game-modal__resume">
      <h3 className="game-modal__resume__title">{title}</h3>

      {children}
    </div>
  );
};
