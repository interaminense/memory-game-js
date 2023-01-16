import { RankingBuilder } from "ranking-builder";
import { RankingBuilderRenderer } from "ranking-builder-react-table-renderer-2";
import { TOP_RESULTS } from "../../constants";
import { Level } from "../Game/Game";

import "./Ranking.css";

export function Ranking({
  level,
  rankingBuilder,
}: {
  level: Level;
  rankingBuilder: RankingBuilder;
}) {
  return (
    <RankingBuilderRenderer
      rankingBuilder={rankingBuilder}
      title="Memory Game Ranking"
      topResults={TOP_RESULTS}
      description={`Top ${TOP_RESULTS} users with ${level.toLowerCase()} level`}
      customCells={[
        {
          header: "Flips",
          value: "flipCount",
        },
        {
          header: "Bonus",
          value: "bonus",
        },
      ]}
    />
  );
}
