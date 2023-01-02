import { RankingBuilder, RankingBuilderRenderer } from "ranking-builder";
import { useEffect, useRef } from "react";

import "./Ranking.css";

export function Ranking({
  rankingBuilder,
}: {
  rankingBuilder: RankingBuilder<{
    path: string;
  }>;
}) {
  const _rankingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (_rankingRef.current) {
      new RankingBuilderRenderer({ app: _rankingRef.current, rankingBuilder });
    }
  });

  return <div id="ranking" ref={_rankingRef} />;
}
