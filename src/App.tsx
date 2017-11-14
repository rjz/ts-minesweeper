import * as React from 'react';
import * as redux from 'redux';
import './App.css';
import { connect } from 'react-redux';

import * as minesweeper from './minesweeper';
import * as store from './store';

import Status from './Status';
import Cell from './Cell';

const DEFAULT_OPTIONS = {
  mineCount: 10,
  width: 10,
  height: 10,
};

type StateProps = minesweeper.Game & {
  grid: string[][]
};

type DispatchProps = {
  flagLocation: typeof store.actions.flagLocation,
  revealLocation: typeof store.actions.revealLocation,
  resetGame: typeof store.actions.resetGame,
};

type Props = StateProps & DispatchProps;

class App extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.resetGame = this.resetGame.bind(this);
  }

  componentDidMount() {
    this.resetGame();
  }

  resetGame() {
    this.props.resetGame(DEFAULT_OPTIONS);
  }

  renderBoard() {
    const { grid, cellsByXy } = this.props;
    return (
      <div className="board">
        {grid.map((row, y) => (
          <div key={y} className="row">
            {row.map(xy => (
              <Cell
                {...cellsByXy[xy]}
                key={xy}
                onClick={() => this.props.revealLocation({ xy })}
                onCtrlClick={() => this.props.flagLocation({ xy })}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  render() {
    return (
      <div className="root">
        <h1>ts-minesweeper</h1>
        <p>
          <code>click</code>: reveal; &nbsp;
          <code>ctrl + click</code>: flag / reveal
          <button onClick={this.resetGame}>restart</button>
        </p>
        {this.renderBoard()}
        <Status {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = (state: minesweeper.Game): StateProps => {
  const { width, height } = state;
  const grid: string[][] = [];
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = [x, y].toString();
    }
  }

  return { ...state, grid };
};

const mapDispatchToProps = (dispatch: redux.Dispatch<store.Action>): DispatchProps =>
  redux.bindActionCreators(store.actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(App);
