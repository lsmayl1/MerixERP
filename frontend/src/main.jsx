import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { App } from "./App.jsx";
import "./i18n.js";
import { Provider } from "react-redux";
import { store } from "./redux/store.jsx";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </HashRouter>
  </StrictMode>
);
