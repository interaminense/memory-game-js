import "./BonusCard.css";

export function BonusCard({
  path,
  size = 80,
}: {
  path: string;
  size?: number;
}) {
  return (
    <div className="bonus-card" style={{ width: size, height: size }}>
      <div
        className="bonus-card__image"
        style={{ backgroundImage: `url(${path})` }}
      />
    </div>
  );
}
