import * as React from 'react';

import { Options, GameStatus } from './minesweeper';

type StatusProps = Options & {
  status: GameStatus,
  moveCount: number,
};

const Status: React.SFC<StatusProps> = (props) => {
  let resolution = <span>In progress</span>;
  if (props.status === GameStatus.Won) {
    resolution = <code>Victory!</code>;
  } else if (props.status === GameStatus.Lost) {
    resolution = <code>Disaster!</code>;
  }

  const facts: { [k: string]: any } = {
    status: resolution,
    moveCount: props.moveCount,
    mineCount: props.mineCount,
    grid: `${props.width} x ${props.height}`
  };

  return (
    <table>
      {Object.keys(facts).map(key => (
        <tr>
          <td><code>{key}</code></td>
          <td><code>{facts[key]}</code></td>
        </tr>
      ))}
    </table>
  );
};

export default Status;
