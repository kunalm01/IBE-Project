import * as Sentry from "@sentry/react";
import "./App.scss";
import { Footer } from "./components/Footer/Footer";
import { Header } from "./components/Header/Header";
import { FormattedMessage, IntlProvider } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import ClipLoader from "react-spinners/ClipLoader";
import { useEffect } from "react";
import { getCurrency } from "./redux/thunks/getCurrency";
import { AppDispatch, RootState } from "./redux/store/store";
import { LandingPage } from "./pages/LandingPage/LandingPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { getProperties } from "./redux/thunks/getProperties";
import { getTranslation } from "./redux/thunks/getTranslation";
import { getConfig } from "./redux/thunks/getConfig";
import RoomResults from "./pages/RoomResults/RoomResults";
import { CheckoutPage } from "./pages/CheckoutPage/CheckoutPage";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig/msalConfig.js";
import { MsalProvider } from "@azure/msal-react";
import { ReviewPage } from "./pages/ReviewPage/ReviewPage.js";
import { BookingPage } from "./pages/BookingPage/BookingPage.js";
import { getMinimumRates } from "./redux/thunks/getMinimumRates.js";
import { Timer } from "./components/Timer/Timer.js";
import { Alert, Snackbar } from "@mui/material";
import { hideSnackbar } from "./redux/slices/SnackbarSlice.js";
import { MyBookingsPage } from "./pages/MyBookingsPage/MyBookingsPage.js";
import { SubscriptionPage } from "./pages/SubscriptionPage/SubscriptionPage.js";
import { NotFoundPage } from "./pages/NotFoundPage/NotFoundPage.js";
import ReactGA from "react-ga4";
import { Chatbot } from "./components/Chatbot/Chatbot.jsx";

export function App() {
  const reduxDispatch: AppDispatch = useDispatch();
  const snackbar = useSelector((state: RootState) => state.snackbar);
  const msalInstance = new PublicClientApplication(msalConfig);
  const locale = useSelector((state: RootState) => state.app.locale);
  const translation = useSelector((state: RootState) => state.app.translation);
  const isLoading = useSelector(
    (state: RootState) => state.app.state === "pending"
  );
  const selectedItinerary = useSelector(
    (state: RootState) => state.checkoutPage.selectedItinerary
  );
  
  const handleHideSnackbar = () => {
    reduxDispatch(hideSnackbar());
  };

  useEffect(() => {
    reduxDispatch(getCurrency());
    reduxDispatch(getProperties());
    reduxDispatch(getTranslation());
    reduxDispatch(getConfig());
    reduxDispatch(getMinimumRates());
    ReactGA.initialize("G-Y022YY9FTK");
  }, [reduxDispatch]);

  return (
    <div>
      {isLoading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "100vh",
            alignItems: "center",
          }}
        >
          <ClipLoader
            color="black"
            loading={isLoading}
            size={150}
            aria-label="Loading Spinner"
            data-testid="loader"
            className="loader"
          />
        </div>
      ) : (
        <BrowserRouter>
          <MsalProvider instance={msalInstance}>
            <IntlProvider locale={locale} messages={translation?.[locale]}>
              <div className="app-container">
                <Header />
                {selectedItinerary && <Timer />}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "calc(100vh - 84px)",
                  }}
                >
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/rooms" element={<RoomResults />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/review" element={<ReviewPage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/my-bookings" element={<MyBookingsPage />} />
                    <Route
                      path="/subscription"
                      element={<SubscriptionPage />}
                    />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                  <Chatbot />
                  <Footer />
                </div>
              </div>
              <Snackbar
                open={snackbar.show}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                autoHideDuration={2000}
                onClose={handleHideSnackbar}
              >
                <Alert severity={snackbar.type} variant="filled">
                  <FormattedMessage
                    id={snackbar.message}
                    defaultMessage={snackbar.message}
                  />
                </Alert>
              </Snackbar>
            </IntlProvider>
          </MsalProvider>
        </BrowserRouter>
      )}
    </div>
  );
}
export default Sentry.withProfiler(App);
