import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { installGlobalAuthInterceptors } from "./helper/api";
import "./index.css";

installGlobalAuthInterceptors();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
