import { RankingBuilder, RankingBuilderRenderer } from "ranking-builder";
import { useEffect, useRef } from "react";
import { Level } from "../Game/Game";

import "./Ranking.css";

export function Ranking({
  level,
  rankingBuilder,
}: {
  level: Level;
  rankingBuilder: RankingBuilder<{
    path: string;
  }>;
}) {
  const _rankingRef = useRef<HTMLDivElement>(null);
  const topResults = 10;

  useEffect(() => {
    if (_rankingRef.current) {
      new RankingBuilderRenderer({
        app: _rankingRef.current,
        rankingBuilder,
        title: `Top ${topResults} users with ${level.toLowerCase()} level`,
        topResults,
      });
    }
  });

  return <div id="ranking" ref={_rankingRef} />;
}
