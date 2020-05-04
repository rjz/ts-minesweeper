import * as React from "react";
import "./App.css";

import { CellStatus } from "./minesweeper";
import Explosion from "./Explosion";
import Flag from "./Flag";

const fillBlack = { fill: "#231f20" };
const fillWhite = { fill: "#fff" };

export const BORDER_WIDTH = 0.5;

const solidLine = {
  stroke: "#231f20",
  strokeWidth: 0.25
};

const dashedLine = {
  stroke: "#231f20",
  strokeWidth: BORDER_WIDTH,
  strokeDasharray: "0.25,2"
};

export enum Stroke {
  NONE = 0,
  DASHED = 1,
  SOLID = 2
}

export type Border = [Stroke, Stroke, Stroke, Stroke];

const borderStyles = {
  [Stroke.NONE]: { opacity: 0 },
  [Stroke.DASHED]: dashedLine,
  [Stroke.SOLID]: solidLine
};

export default function CellBorder(props: {
  dim: number;
  border: string;
  cornerRadius: number;
}) {
  const { dim, cornerRadius: r } = props;
  const finalBorder = (props.border.split("") as unknown) as Border;

  const x1 = -dim / 2;
  const y1 = -dim / 2;

  const x2 = +dim / 2;
  const y2 = +dim / 2;

  const tl = `${x1},${y1}`;
  const br = `${x2},${y2}`;

  return (
    <>
      <circle r={r} cy={y1} cx={x1} style={fillBlack} />
      <path d={`m ${tl} h ${dim}`} style={borderStyles[finalBorder[0]]} />

      <circle r={r} cx={x2} cy={y1} style={fillBlack} />
      <path d={`m ${br} v -${dim}`} style={borderStyles[finalBorder[1]]} />

      <circle r={r} cx={x2} cy={y2} style={fillBlack} />
      <path d={`m ${br} h -${dim}`} style={borderStyles[finalBorder[2]]} />

      <circle r={r} cx={x1} cy={y2} style={fillBlack} />
      <path d={`m ${tl} v ${dim}`} style={borderStyles[finalBorder[3]]} />
    </>
  );
}
