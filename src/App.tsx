import { RankingBuilder } from "ranking-builder";
import { Game } from "./components/Game/Game";
import { Ranking } from "./components/Ranking/Ranking";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGIN_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

function App() {
  const rankingBuilder = new RankingBuilder({ path: "memory-game-js" }, config);

  // @ts-ignore
  window.rankingBuilder = rankingBuilder;

  return (
    <div className="App">
      <Game rankingBuilder={rankingBuilder} />
      <Ranking rankingBuilder={rankingBuilder} />
    </div>
  );
}

export default App;
