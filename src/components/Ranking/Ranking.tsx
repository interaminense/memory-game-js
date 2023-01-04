import { RankingBuilder, RankingBuilderRenderer } from "ranking-builder";
import { useEffect, useRef } from "react";
import { TOP_RESULTS } from "../../constants";
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
  const _rankingBuilderRenderer = useRef<any>(null);

  useEffect(() => {
    if (_rankingRef.current) {
      if (!_rankingBuilderRenderer.current) {
        _rankingBuilderRenderer.current = new RankingBuilderRenderer({
          app: _rankingRef.current,
          rankingBuilder,
          title: `Top ${TOP_RESULTS} users with ${level.toLowerCase()} level`,
          topResults: TOP_RESULTS,
        });
      }
    }
  }, [level, rankingBuilder]);

  return <div id="ranking" ref={_rankingRef} />;
}
