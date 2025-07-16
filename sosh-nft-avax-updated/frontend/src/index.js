import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "animate.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import Store from "store";
import { BrowserRouter as Router } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { GlobalStyles } from "styles/globalStyles";
import CustomThemeProvider from "theme/customThemeProvider";

ReactDOM.render(
  <React.StrictMode>
    <ToastContainer closeButton={false} position="top-right" />
    <Router>
      <Provider store={Store}>
        <CustomThemeProvider>
          <GlobalStyles />
          <App />
        </CustomThemeProvider>
      </Provider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

reportWebVitals();
