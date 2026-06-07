import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import UserContext from "./context/UserContext.jsx";
import DriverContext from "./context/DriverContext.jsx";
import SocketProvider from "./context/SocketContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

createRoot(document.getElementById("root")).render(
  <DriverContext>
    <UserContext>
      <SocketProvider>
        <ToastProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ToastProvider>
      </SocketProvider>
    </UserContext>
  </DriverContext>
);
