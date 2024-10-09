import React from "react";
import ReactDOM from "react-dom";

import { AppView } from "./AppView.jsx";

export const mountApp = () => {
  const div = document.createElement("div");
  document.body.appendChild(div);

  ReactDOM.render(<AppView  />, div);

  document.getElementById("spinner").remove();
};
