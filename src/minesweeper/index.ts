export enum CellStatus {
  Unknown = 0,
  Revealed,
  Flagged,
  Exploded
}

export type Cell = {
  status: CellStatus;
  revealedCount: number;
};

export type Options = {
  mineCount: number;
  width: number;
  height: number;
};

type XY = string;

type Board = {
  cellsByXy: Map<XY, Cell>;
  neighborsByXy: Map<XY, Set<XY>>;
  minesByXy: Set<XY>;
};

export enum GameStatus {
  Started = 0,
  Won,
  Lost
}

export type Game = Options &
  Board & {
    status: GameStatus;
    moveCount: number;
    flaggedCount: number;
  };

const NEIGHBORS = Object.freeze([
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  /* :^) */ [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1]
]);

const neighborXys = (
  { width, height }: Options,
  x: number,
  y: number
): Set<XY> =>
  NEIGHBORS.reduce((xys: Set<XY>, [dx, dy]) => {
    const xf = x + dx;
    const yf = y + dy;
    if (xf > -1 && xf < width && yf > -1 && yf < height) {
      xys.add([xf, yf].toString());
    }
    return xys;
  }, new Set<XY>());

function mineBoard(board: Board, count: number): void {
  const available = Array.from(board.cellsByXy.keys());
  for (let i = 0; i < count && available.length > 0; i++) {
    const index = Math.floor(Math.random() * available.length);
    const [xy] = available.splice(index, 1);
    board.minesByXy.add(xy);
  }
}

function createBoard(options: Options): Board {
  const { height, width, mineCount } = options;
  const board: Board = {
    cellsByXy: new Map(),
    neighborsByXy: new Map(),
    minesByXy: new Set()
  };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const xy = [x, y].toString();
      board.cellsByXy.set(xy, {
        revealedCount: -1,
        status: CellStatus.Unknown
      });
      board.neighborsByXy.set(xy, neighborXys(options, x, y));
    }
  }

  mineBoard(board, mineCount);

  return board;
}

function replaceCell(game: Game, xy: XY, cell: Cell): Game {
  const cellsByXy = new Map(game.cellsByXy);
  cellsByXy.set(xy, cell);

  return {
    ...game,
    cellsByXy: cellsByXy
  };
}

const isCellKnown = ({ status }: Cell): boolean =>
  status === CellStatus.Revealed || status === CellStatus.Exploded;

function isVictorious(game: Game): boolean {
  for (const cell of game.cellsByXy.values()) {
    if (!isCellKnown(cell)) {
      return false;
    }
  }
  return true;
}

function countMines(game: Game, xys: Set<XY>): number {
  let count = 0;
  for (const xy of xys) {
    if (game.minesByXy.has(xy)) {
      count = count + 1;
    }
  }

  return count;
}

function testLocations(prev: Game, xys: Set<XY>): Game {
  return Array.from(xys).reduce((game, xy) => {
    const cell = game.cellsByXy.get(xy)!;
    if (cell && cell.status === CellStatus.Unknown) {
      return testLocation(game, xy);
    }
    return game;
  }, prev);
}

function testLocation(game: Game, xy: string): Game {
  const cell = game.cellsByXy.get(xy)!;
  if (cell.status === CellStatus.Revealed) {
    return game;
  } else if (game.minesByXy.has(xy)) {
    return {
      ...replaceCell(game, xy, { ...cell, status: CellStatus.Exploded }),
      status: GameStatus.Lost
    };
  } else {
    const neighbors = game.neighborsByXy.get(xy)!;
    const revealedCount = countMines(game, neighbors);
    const nextGame = replaceCell(game, xy, {
      status: CellStatus.Revealed,
      revealedCount
    });

    if (isVictorious(nextGame)) {
      return { ...nextGame, status: GameStatus.Won };
    } else if (revealedCount === 0) {
      return testLocations(nextGame, neighbors);
    }

    return nextGame;
  }
}

// Flood-fill from `xy`
function revealNeighbors(game: Game, xy: XY): Game {
  const cell = game.cellsByXy.get(xy)!;
  if (cell.status !== CellStatus.Revealed) {
    return game;
  }

  const neighbors = game.neighborsByXy.get(xy)!;
  return testLocations(game, neighbors);
}

const create = (options: Options): Game => ({
  ...options,
  ...createBoard(options),
  status: GameStatus.Started,
  moveCount: 0,
  flaggedCount: 0
});

const reveal = (game: Game, xy: string): Game => ({
  ...testLocation(game, xy),
  moveCount: game.moveCount + 1
});

function flag(game: Game, xy: XY): Game {
  const cell = game.cellsByXy.get(xy)!;
  if (cell.status === CellStatus.Unknown) {
    return replaceCell({ ...game, flaggedCount: game.flaggedCount + 1 }, xy, {
      ...cell,
      status: CellStatus.Flagged
    });
  } else if (cell.status === CellStatus.Flagged) {
    return replaceCell({ ...game, flaggedCount: game.flaggedCount - 1 }, xy, {
      ...cell,
      status: CellStatus.Unknown
    });
  }
  return game;
}

type MinesweeperAPI = {
  create(options: Options): Game;
  reveal(prev: Game, xy: string): Game;
  revealNeighbors(prev: Game, xy: string): Game;
  flag(prev: Game, xy: string): Game;
};

export const minesweeper: MinesweeperAPI = {
  create,
  reveal,
  revealNeighbors,
  flag
};
