import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { TripBuilderProvider } from "./context/TripBuilderContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TripBuilderProvider>
          <App />
        </TripBuilderProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);