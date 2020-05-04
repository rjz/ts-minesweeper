import * as React from "react";

export default function Flag(props: { r: number }) {
  const { r } = props;
  const flagW = r * Math.cos(Math.PI / 4);
  const flagH = flagW;

  return (
    <g fill="#231f20f" >
      <circle r={r} cx={0} cy={0} />
      <path d={`M 0,${r / 3} v ${-flagH} h ${flagW} Z`} fill="#fff" />
    </g>
  );
}
