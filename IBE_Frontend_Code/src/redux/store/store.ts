import { configureStore } from "@reduxjs/toolkit";
import appReducer from "../slices/AppSlice";
import landingPageReducer from "../slices/LandingPageSlice";
import snackbarReducer from "../slices/SnackbarSlice";
import dropdownReducer from "../slices/DropdownSlice";
import roomResultsReducer from "../slices/RoomResultsSlice";
import checkoutPageReducer from '../slices/CheckoutPageSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    checkoutPage: checkoutPageReducer,
    landingPage: landingPageReducer,
    snackbar: snackbarReducer,
    dropdown: dropdownReducer,
    roomResults: roomResultsReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
