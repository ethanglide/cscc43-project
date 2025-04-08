import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router";
import router from "./router";
import { UserContextProvider } from "./context/user-context";
import { createTheme, ThemeProvider } from "@mui/material";
import { CookiesProvider } from "react-cookie";

const muiTheme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CookiesProvider>
      <ThemeProvider theme={muiTheme}>
        <UserContextProvider>
          <RouterProvider router={router} />
        </UserContextProvider>
      </ThemeProvider>
    </CookiesProvider>
  </StrictMode>,
);
