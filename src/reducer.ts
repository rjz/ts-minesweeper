import {
  minesweeper,
  Game,
  Options,
  GameStatus
} from "./minesweeper";


export type Action =
  | { type: "RESET_GAME"; options: Options }
  | { type: "REVEAL_LOCATION"; xy: string }
  | { type: "REVEAL_NEIGHBORS"; xy: string }
  | { type: "FLAG_LOCATION"; xy: string };

export default function(prev: Game, action: Action): Game {
  if (action.type === "RESET_GAME") {
    return minesweeper.create(action.options);
  } else if (prev.status !== GameStatus.Started) {
    return prev;
  } else if (action.type === "REVEAL_LOCATION") {
    return minesweeper.reveal(prev, action.xy);
  } else if (action.type === "REVEAL_NEIGHBORS") {
    return minesweeper.revealNeighbors(prev, action.xy);
  } else if (action.type === "FLAG_LOCATION") {
    return minesweeper.flag(prev, action.xy);
  }
  return prev;
}
