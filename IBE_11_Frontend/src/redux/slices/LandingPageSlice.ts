import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getMinimumRates } from "../thunks/getMinimumRates";

interface InitialState {
  state: "fulfilled" | "pending" | "error";
  counts: { [key: string]: number };
  selectedRooms: number;
  allowedRoomCounts: number[];
  startDate: string | null;
  endDate: string | null;
  selectedProperty: string;
  selectedGuests: string;
  minimumNightlyRates: { [key: string]: number };
  isWheelchairSelected: boolean;
  isMilitaryPersonnel: boolean;
}

const initialState: InitialState = {
  state: "pending",
  counts: {},
  selectedRooms: 1,
  allowedRoomCounts: [1, 2, 3, 4],
  startDate: null,
  endDate: null,
  selectedProperty: "",
  selectedGuests: "Guests",
  minimumNightlyRates: {},
  isWheelchairSelected: false,
  isMilitaryPersonnel: false,
};

const landingPageSlice = createSlice({
  name: "landingPageSlice",
  initialState,
  reducers: {
    setCounts: (state, action: PayloadAction<{ [key: string]: number }>) => {
      state.counts = action.payload;
    },
    setSelectedRooms: (state, action: PayloadAction<number>) => {
      state.selectedRooms = action.payload;
    },
    setStartDate: (state, action: PayloadAction<string>) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action: PayloadAction<string>) => {
      state.endDate = action.payload;
    },
    setSelectedProperty: (state, action: PayloadAction<string>) => {
      state.selectedProperty = action.payload;
    },
    setSelectedGuests: (state, action: PayloadAction<string>) => {
      state.selectedGuests = action.payload;
    },
    setIsWheelchairSelected: (state, action: PayloadAction<boolean>) => {
      state.isWheelchairSelected = action.payload;
    },
    setIsMilitaryPersonnel: (state, action: PayloadAction<boolean>) => {
      state.isMilitaryPersonnel = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getMinimumRates.pending, (state) => {
        state.state = "pending";
      })
      .addCase(
        getMinimumRates.fulfilled,
        (state, action: PayloadAction<{ [key: string]: number }>) => {
          state.state = "fulfilled";
          state.minimumNightlyRates = action.payload;
        }
      )
      .addCase(getMinimumRates.rejected, (state) => {
        state.state = "error";
      });
  },
});

export const {
  setCounts,
  setSelectedRooms,
  setStartDate,
  setEndDate,
  setSelectedProperty,
  setSelectedGuests,
  setIsWheelchairSelected,
  setIsMilitaryPersonnel,
} = landingPageSlice.actions;
export default landingPageSlice.reducer;
