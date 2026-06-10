import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeLangProvider } from "./context/ThemeLangContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import ToastStack from "./components/Toast.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeLangProvider>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
        <ToastStack />
      </ToastProvider>
    </ThemeLangProvider>
  </StrictMode>
);
