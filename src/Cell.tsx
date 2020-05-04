import * as React from "react";
import "./App.css";

import { CellStatus } from "./minesweeper";
import { Action } from "./reducer";
import Explosion from "./Explosion";
import Flag from "./Flag";
import CellBorder, { BORDER_WIDTH } from "./CellBorder";

const fillBlack = { fill: "#231f20" };
const fillWhite = { fill: "#fff" };

const label = {
  fontSize: "20%",
  fontWeight: "bold"
};

export enum Button {
  NONE = 0,
  LEFT = 1,
  RIGHT = 2,
  BOTH = 4
}

export default function Cell(props: {
  xy: string;
  dim: number;
  isReadonly: boolean;
  status: CellStatus;
  dispatch: React.Dispatch<Action>;
  border: string;
  label?: string;
}) {
  const { xy, dim, status, dispatch } = props;

  const isExploded = status === CellStatus.Exploded;
  const isFlagged = status === CellStatus.Flagged;

  const [buttonState, setButtonState] = React.useState({
    right: false,
    left: false,
    both: false
  });

  const [isHover, setHover] = React.useState(false);

  const isReadonly =
    props.isReadonly ||
    (status !== CellStatus.Flagged && status !== CellStatus.Unknown);

  const handlers = React.useMemo(
    function () {
      return {
        onContextMenu(e: React.MouseEvent<SVGGElement>) {
          // Cancel right click
          e.preventDefault();
        },
        onMouseDown(e: React.MouseEvent<SVGGElement>) {
          e.preventDefault();
          if (e.button === 0) {
            return setButtonState({
              ...buttonState,
              left: true,
              both: buttonState.right
            });
          } else if (e.button === 2) {
            return setButtonState({
              ...buttonState,
              right: true,
              both: buttonState.left
            });
          }
        },
        onMouseUp(e: React.MouseEvent<SVGGElement>) {
          e.preventDefault();

          let newButtonState = { ...buttonState };
          if (e.button === 0) {
            newButtonState.left = false;
            if (!buttonState.both) {
              dispatch({
                type: "REVEAL_LOCATION",
                xy
              });
            } else if (!buttonState.right) {
              newButtonState.both = false;
              dispatch({
                type: "REVEAL_NEIGHBORS",
                xy
              });
            }
          } else if (e.button === 2) {
            newButtonState.right = false;
            if (!buttonState.both) {
              dispatch({
                type: "FLAG_LOCATION",
                xy
              });
            } else if (!buttonState.left) {
              newButtonState.both = false;
              dispatch({
                type: "REVEAL_NEIGHBORS",
                xy
              });
            }
          }

          setButtonState(newButtonState);
        }
      };
    },
    [buttonState.left, buttonState.right, buttonState.both]
  );

  return (
    <>
      <g
        style={{ cursor: isReadonly ? "default" : "pointer" }}
        {...handlers}
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
      >
        <rect
          style={
            isExploded ? fillBlack : isReadonly ? { opacity: 0 } : fillWhite
          }
          x={BORDER_WIDTH - dim / 2}
          y={BORDER_WIDTH - dim / 2}
          width={dim - BORDER_WIDTH}
          height={dim - BORDER_WIDTH}
        />

        {/* (optional) text label */}
        {!isFlagged && props.label && (
          <text
            style={{
              userSelect: "none",
              fill: isExploded ? "#fff" : "#231f20",
              fontWeight: isExploded ? "bold" : "normal"
            }}
            fontSize={5}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {props.label}
          </text>
        )}
        {isExploded && <Explosion />}

        {isFlagged && <Flag r={dim * 0.15} />}
      </g>

      <CellBorder
        dim={dim}
        border={props.border}
        cornerRadius={status === CellStatus.Unknown ? 0.2 : 0}
      />
      {isHover && !isReadonly && (
        <CellBorder dim={dim} border={"1111"} cornerRadius={0} />
      )}
    </>
  );
}
