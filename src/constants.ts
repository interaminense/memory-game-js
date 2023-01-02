import { Card } from "./components/Game/Game";

import bat from "./cards/bat.png";
import bee from "./cards/bee.png";
import burger from "./cards/burger.png";
import butterfly from "./cards/butterfly.png";
import cat from "./cards/cat.png";
import frog from "./cards/frog.png";
import monkey from "./cards/monkey.png";
import penguin from "./cards/penguin.png";
import robot from "./cards/robot.png";
import seal from "./cards/seal.png";
import shark from "./cards/shark.png";
import sheep from "./cards/sheep.png";
import snail from "./cards/snail.png";
import turtle from "./cards/turtle.png";
import vegetables from "./cards/vegetables.png";
import shark2 from "./cards/shark2.png";
import dream from "./cards/dream.png";
import cat2 from "./cards/cat2.png";

export const cards: Card[] = [
  bat,
  bee,
  burger,
  butterfly,
  cat,
  frog,
  monkey,
  penguin,
  robot,
  seal,
  shark,
  sheep,
  snail,
  turtle,
  vegetables,
  shark2,
  dream,
  cat2,
].map((path) => ({ path, matched: false, flipped: false }));
