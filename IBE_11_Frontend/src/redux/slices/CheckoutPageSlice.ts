import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IItinerary } from "../../utils/interface";
import { postBooking } from "../thunks/postBooking";

interface ITravelerForm {
  firstName: string;
  lastName?: string;
  phone: string;
  email: string;
}

export interface IBillingForm {
  firstName: string;
  lastName?: string;
  address1: string;
  address2?: string;
  country: { name: string; code: string };
  state: { name: string; code: string };
  city: string;
  zipcode: string;
  phone: string;
  email: string;
}

export interface IPaymentForm {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
}

interface IPrices {
  roomsTotal: number;
  promoDiscount: number;
  taxes: number;
  vat: number;
  subtotal: number;
}

interface InitialState {
  state: "fulfilled" | "pending" | "error";
  selectedItinerary: IItinerary | null;
  currentActiveForm: number;
  showTnc: boolean;
  travelerFields: ITravelerForm;
  billingFields: IBillingForm;
  paymentFields: IPaymentForm;
  minutes: number;
  seconds: number;
  prices: IPrices | null;
  bookingId: number;
}

const initialState: InitialState = {
  state: "fulfilled",
  selectedItinerary: null,
  currentActiveForm: 0,
  showTnc: false,
  travelerFields: {
    firstName: "Varshil",
    lastName: "Nayak",
    phone: "8200912917",
    email: "varshilshaileshbhai.nayak@kickdrumtech.com",
  },
  billingFields: {
    firstName: "Varshil",
    lastName: "Nayak",
    address1: "SBI Society",
    address2: "Girdharnagar",
    country: { name: "India", code: "IN" },
    state: { name: "Gujarat", code: "GJ" },
    city: "Ahmedabad",
    zipcode: "380061",
    phone: "8200912917",
    email: "varshilshaileshbhai.nayak@kickdrumtech.com",
  },
  paymentFields: {
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
  },
  minutes: 9,
  seconds: 59,
  prices: null,
  bookingId: 0,
};

const checkoutPageSlice = createSlice({
  name: "checkoutPageSlice",
  initialState,
  reducers: {
    setSelectedItinerary: (state, action: PayloadAction<IItinerary>) => {
      state.selectedItinerary = action.payload;
    },
    resetSelectedItinerary: (state) => {
      state.selectedItinerary = null;
    },
    setCurrentActiveForm: (state, action: PayloadAction<number>) => {
      state.currentActiveForm = action.payload;
    },
    setShowTnc: (state, action: PayloadAction<boolean>) => {
      state.showTnc = action.payload;
    },
    setTravelerFields: (state, action: PayloadAction<ITravelerForm>) => {
      state.travelerFields = action.payload;
    },
    setBillingFields: (state, action: PayloadAction<IBillingForm>) => {
      state.billingFields = action.payload;
    },
    setPaymentFields: (state, action: PayloadAction<IPaymentForm>) => {
      state.paymentFields = action.payload;
    },
    setMinutes: (state, action: PayloadAction<number>) => {
      state.minutes = action.payload;
    },
    setSeconds: (state, action: PayloadAction<number>) => {
      state.seconds = action.payload;
    },
    setPrices: (state, action: PayloadAction<IPrices>) => {
      state.prices = action.payload;
    },
    resetBookingId: (state) => {
      state.bookingId = 0;
    },
    setState: (
      state,
      action: PayloadAction<"fulfilled" | "error" | "pending">
    ) => {
      state.state = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(
        postBooking.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.state = "fulfilled";
          state.bookingId = action.payload;
        }
      )
      .addCase(postBooking.rejected, (state) => {
        state.state = "error";
      })
      .addCase(postBooking.pending, (state) => {
        state.state = "pending";
      });
  },
});

export const {
  setSelectedItinerary,
  resetSelectedItinerary,
  setCurrentActiveForm,
  setShowTnc,
  setTravelerFields,
  setBillingFields,
  setPaymentFields,
  setMinutes,
  setSeconds,
  setPrices,
  resetBookingId,
  setState,
} = checkoutPageSlice.actions;
export default checkoutPageSlice.reducer;
