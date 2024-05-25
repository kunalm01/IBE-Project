import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getCurrency } from "../thunks/getCurrency";
import { getProperties } from "../thunks/getProperties";
import { getTranslation } from "../thunks/getTranslation";
import {
  IConfig,
  IConfigProperty,
  IDateRange,
  IProperty,
  IRate,
  ITranslation,
} from "../../utils/interface";
import { getConfig } from "../thunks/getConfig";

interface InitialState {
  locale: string;
  currency: string;
  rate: IRate;
  idToken: string | null;
  loggedInEmail: string | null;
  loggedInUserName: string | null;
  state: "fulfilled" | "pending" | "error";
  configData: IConfig;
  currentConfig: IConfigProperty;
  propertiesList: string[];
  translation: { [key: string]: { [key: string]: string } };
  dateRange: IDateRange[];
  subscription: number;
  bookings: number;
}

const initialState: InitialState = {
  locale: "en",
  currency: "USD",
  rate: { USD: 1 },
  idToken: null,
  loggedInEmail: null,
  loggedInUserName: null,
  state: "pending",
  configData: {
    tenant_id: 1,
    tenant_header_logo_url: "",
    tenant_footer_logo_url: "",
    tenant_mini_logo_url: "",
    tenant_name: "",
    tenant_full_name: "",
    application_title: "",
    background_image_url: "",
    banner_image_url: "",
    supported_languages: [],
    supported_currencies: [],
    language_wise_currency: {},
    properties: {},
  },
  currentConfig: {
    property_id: 11,
    filters: [],
    sort: [],
    allowed_options: [],
    allowed_guests: [],
    maximum_rooms_allowed: 1,
    maximum_guests_in_a_room: 4,
    maximum_beds_in_a_room: 5,
    maximum_length_of_stay: 14,
    page_size: 3,
    tax_percentage: 0.12,
    vat_percentage: 0.05,
    due_now_percentage: 0.4,
    last_name_required: true,
  },
  propertiesList: [],
  translation: {},
  dateRange: [
    {
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 86400000 * 2),
      key: "selection",
    },
  ],
  subscription: 0,
  bookings: 0,
};

const appSlice = createSlice({
  name: "appSlice",
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<string>) => {
      state.locale = action.payload;
    },
    setCurrency: (state, action: PayloadAction<string>) => {
      state.currency = action.payload;
    },
    setIdToken: (state, action: PayloadAction<string | null>) => {
      state.idToken = action.payload;
    },
    setLoggedInEmail: (state, action: PayloadAction<string | null>) => {
      state.loggedInEmail = action.payload;
    },
    setLoggedInUserName: (state, action: PayloadAction<string | null>) => {
      state.loggedInUserName = action.payload;
    },
    setCurrentConfig: (state, action: PayloadAction<IConfigProperty>) => {
      state.currentConfig = action.payload;
    },
    resetCurrentConfig: (state) => {
      state.currentConfig = {
        property_id: 11,
        filters: [],
        sort: [],
        allowed_options: [],
        allowed_guests: [],
        maximum_rooms_allowed: 1,
        maximum_guests_in_a_room: 3,
        maximum_beds_in_a_room: 5,
        maximum_length_of_stay: 14,
        page_size: 3,
        tax_percentage: 0.12,
        vat_percentage: 0.05,
        due_now_percentage: 0.4,
        last_name_required: true,
      };
    },
    setDateRange: (state, action: PayloadAction<IDateRange[]>) => {
      state.dateRange = action.payload;
    },
    setSubscription: (state, action: PayloadAction<number>) => {
      state.subscription = action.payload;
    },
    setBookings: (state, action: PayloadAction<number>) => {
      state.bookings = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getCurrency.pending, (state) => {
        state.state = "pending";
      })
      .addCase(getCurrency.fulfilled, (state, action: PayloadAction<IRate>) => {
        state.state = "fulfilled";
        state.rate = action.payload;
      })
      .addCase(getCurrency.rejected, (state) => {
        state.state = "error";
      })
      .addCase(getProperties.pending, (state) => {
        state.state = "pending";
      })
      .addCase(
        getProperties.fulfilled,
        (state, action: PayloadAction<IProperty[]>) => {
          state.state = "fulfilled";
          state.propertiesList = action.payload
            .filter((property) => property.property_name === "Team 11 Hotel")
            .map((property) => property.property_name);
        }
      )
      .addCase(getProperties.rejected, (state) => {
        state.state = "error";
      })
      .addCase(getTranslation.pending, (state) => {
        state.state = "pending";
      })
      .addCase(
        getTranslation.fulfilled,
        (state, action: PayloadAction<ITranslation>) => {
          state.state = "fulfilled";
          state.translation = action.payload;
        }
      )
      .addCase(getTranslation.rejected, (state) => {
        state.state = "error";
      })
      .addCase(getConfig.pending, (state) => {
        state.state = "pending";
      })
      .addCase(getConfig.fulfilled, (state, action: PayloadAction<IConfig>) => {
        state.configData = action.payload;
      })
      .addCase(getConfig.rejected, (state) => {
        state.state = "error";
      });
  },
});

export const {
  setLocale,
  setCurrency,
  setIdToken,
  setLoggedInEmail,
  setLoggedInUserName,
  setCurrentConfig,
  resetCurrentConfig,
  setDateRange,
  setSubscription,
  setBookings,
} = appSlice.actions;
export default appSlice.reducer;
