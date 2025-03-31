import { Provider } from "react-redux";
import { store } from "./store/store";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { LandingPage } from "./pages/landingPage";
import { ToastProvider } from "./components/toast";

const App = () => {
  return (
    <Provider store={store}>
      <ToastProvider>
        <ThemeProvider theme={theme}>
          <LandingPage />
        </ThemeProvider>
      </ToastProvider>
    </Provider>
  );
};

export default App;
