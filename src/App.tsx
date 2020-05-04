import * as React from "react";
import "./App.css";

import {
  minesweeper,
  Game,
  Options,
  Cell,
  CellStatus,
  GameStatus
} from "./minesweeper";

import { default as CellSvg, Button } from "./Cell";
import { Border, Stroke } from "./CellBorder";
import root, { Action } from "./reducer";

type Props = Options;

const progressLine = {
  stroke: "#231f20",
  strokeWidth: 2
};

function isKnownAndEmpty(cell: Cell) {
  return cell.status === CellStatus.Revealed && cell.revealedCount === 0;
}

function BorderGroups({ game }: { game: Game }) {
  let pathCoords = new Set();
  for (const entry of game.cellsByXy.entries()) {
    const [xy, cell] = entry;
    // ...
  }

  return (
    <g>
      <path d={`m 0 0 l 10 10`} style={progressLine} />
    </g>
  );
}

function calcBorder(game: Game, xy: string): Border {
  const cell = game.cellsByXy.get(xy)!;

  const [x, y] = xy.split(",").map(n => parseInt(n, 10));

  const border: Border = [Stroke.NONE, Stroke.NONE, Stroke.NONE, Stroke.NONE];
  if (!isKnownAndEmpty(cell)) {
    // Special-case the top border
    if (y === 0) {
      border[0] = Stroke.SOLID;
    }
    return border;
  }

  const neighborXY = [
    `${x},${y - 1}`,
    `${x + 1},${y}`,
    `${x},${y + 1}`,
    `${x - 1},${y}`
  ];

  return neighborXY.map(xy => {
    const neighbor = game.cellsByXy.get(xy);
    if (neighbor && !isKnownAndEmpty(neighbor)) {
      return Stroke.SOLID;
    }

    return Stroke.NONE;
  }) as Border;
}

const clockStyle = {
  stroke: "#231f20",
  strokeWidth: 0.2,
  strokeLinecap: "round" as const
};

export function Clock(props: { r: number; time: number }) {
  const { r, time } = props;
  const secondR1 = r * 0.7;
  const secondR2 = r * 0.2;
  const secs = time % 60;
  const rads = Math.PI * (secs / 30 - 1 / 2);

  const tx = Math.cos(rads);
  const ty = Math.sin(rads);

  return (
    <>
      <circle cx={0} cy={0} r={r} fill="none" style={clockStyle} />
      <path
        d={`m ${-secondR2 * tx} ${-secondR2 * ty} L ${secondR1 * tx} ${
          secondR1 * ty
        }`}
        style={clockStyle}
      />

      <circle
        cx={0}
        cy={0}
        r={0.12 * r}
        fill="#fff"
        style={{ ...clockStyle, stroke: "none" }}
      />
      <circle cx={0} cy={0} r={0.07 * r} fill="#231f20" style={clockStyle} />
    </>
  );
}

export function Gauge(props: { r: number; value: number }) {
  const { r, value } = props;
  const secondR1 = r * 1;
  const rads = (Math.PI * (2 * value - 1 / 2)) % (2 * Math.PI);

  const tx = Math.cos(rads);
  const ty = Math.sin(rads);

  // const arc = "m 0 -8 A 8 8 0 0 1 8 0 L 0 0";

  let flags = `0 1`;
  if (rads > Math.PI / 2) {
    flags = `1 1`;
  }

  return (
    <>
      <circle cx={0} cy={0} r={r} fill="none" style={clockStyle} />
      <path
        d={`m 0 ${-secondR1} A ${r} ${r} 0 ${flags} ${secondR1 * tx} ${
          secondR1 * ty
        } L 0 0`}
        style={{ ...clockStyle, stroke: "#f00" }}
      />

      <circle
        cx={0}
        cy={0}
        r={0.12 * r}
        fill="#fff"
        style={{ ...clockStyle, stroke: "none" }}
      />
      <circle cx={0} cy={0} r={0.07 * r} fill="#231f20" style={clockStyle} />
    </>
  );
}

export default function App(props: Props) {
  const [game, dispatch] = React.useReducer(root, minesweeper.create(props));

  const [dt, setDt] = React.useState(0);
  const [t0] = React.useState(Date.now());

  // TODO: move to clock component, use context for game status
  React.useEffect(
    function () {
      if (game.status !== GameStatus.Started) {
        // Don't update if game has ended
        return;
      }

      const handle = setInterval(function () {
        setDt((Date.now() - t0) / 1000);
      }, 100);

      return function () {
        clearInterval(handle);
      };
    },
    [game.status]
  );

  /**
   * Since the `grid` we use to lay out the game's cells won't change, we only
   * need to compute it the first time this component is rendered. React's
   * `useMemo` hook will subsequently return the (memoized) result, saving a
   * bit of unnecessary computation as the game's state changes.
   */
  const grid = React.useMemo(
    function () {
      const g: string[][] = [];
      for (let y = 0; y < props.height; y++) {
        g[y] = [];
        for (let x = 0; x < props.width; x++) {
          g[y][x] = [x, y].toString();
        }
      }
      return g;
    },

    /**
     * Passing in the `grid` parameters will let `React.useMemo` determine
     * whether the (memoized) value needs to be reset. This shouldn't happen
     * during a game, but a user tweaking settings and pressing "restart" may
     * cause a restart on a new game `grid`.
     */
    [props.width, props.height]
  );

  const dim = 20;
  const rows = props.height;
  const cols = props.width;

  let titleComponent = <h1>Minesweeper</h1>;
  if (game.status === GameStatus.Won) {
    titleComponent = (
      <h1 className="settled">
        <del>Mine</del>sweeper
      </h1>
    );
  } else if (game.status === GameStatus.Lost) {
    titleComponent = (
      <h1 className="settled">
        Mine<del>sweeper</del>
      </h1>
    );
  }

  return (
    <div className="root">
      <div className="header">{titleComponent}</div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: `${rows / cols}%` }}
        viewBox={`-30 0 ${cols * dim + 34} ${rows * dim + 4}`}
      >
        {...grid.map((col, j) =>
          col.map((xy, i) => {
            const cell = game.cellsByXy.get(xy)!;
            let label = "";
            if (cell.status === CellStatus.Revealed && cell.revealedCount > 0) {
              label = cell.revealedCount.toString();
            }

            const x = i * dim;
            const y = j * dim;
            return (
              <g transform={`translate(${dim * (i + 0.5)},${dim * (j + 0.5)})`}>
                <CellSvg
                  key={xy}
                  xy={xy}
                  dim={dim}
                  dispatch={dispatch}
                  border={calcBorder(game, xy).join("")}
                  label={label}
                  status={cell.status}
                  isReadonly={game.status !== GameStatus.Started}
                />
              </g>
            );
          })
        )}
        {/* Progress bar */}
        <path
          d={`m 0,${rows * dim} h ${
            cols * dim * Math.min(game.flaggedCount / game.mineCount, 1)
          }`}
          style={progressLine}
        />
        {/* 100% completion mark */}
        <path
          d={`m ${cols * dim},${rows * dim - 1} V ${rows * dim + 1}`}
          style={progressLine}
        />

        <BorderGroups game={game} />

        {/* Progress gauge */}
        <g transform={`translate(-15,${rows * dim - 38})`}>
          <Gauge value={game.flaggedCount / game.mineCount} r={8} />
        </g>

        {/* Game clock */}
        <g transform={`translate(-15,${rows * dim - 15})`}>
          <Clock time={dt} r={8} />
        </g>
      </svg>
      <footer className="footer">
        another unrepentant production from{" "}
        <a href="https://rjzaworski.com">rjzaworski.com</a>
        &nbsp; &middot; &nbsp;
        <a href="https://twitter.com/rjzaworski">twitter</a>
      </footer>
    </div>
  );
}
