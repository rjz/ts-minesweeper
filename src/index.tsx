import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import "./index.css";

ReactDOM.render(
  <App mineCount={20} width={20} height={10} />,
  document.getElementById("root") as HTMLElement
);
