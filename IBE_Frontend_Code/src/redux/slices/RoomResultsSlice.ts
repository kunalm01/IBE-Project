import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { getRooms } from "../thunks/getRooms";
import { IRoom, IRoomResponse } from "../../utils/interface";

interface IRoomCompare {
  roomTypeId: number;
  imageUrl: string;
  ratings: number;
}
interface InitialState {
  state: "fulfilled" | "pending" | "error";
  stepperState: number;
  allowedBedCounts: number[];
  selectedBeds: number;
  roomsList: IRoom[];
  totalRecords: number;
  selectedBedTypes: string[];
  selectedRoomTypes: string[];
  selectedPriceFilter: string;
  selectedCapacityFilter: string;
  selectedAreaFilter: string;
  selectedModal: string;
  selectedRoomsToCompare: IRoomCompare[];
}

const initialState: InitialState = {
  state: "pending",
  stepperState: 0,
  allowedBedCounts: [1, 2, 3, 4, 5],
  selectedBeds: 1,
  roomsList: [],
  totalRecords: 0,
  selectedBedTypes: [],
  selectedRoomTypes: [],
  selectedPriceFilter: "",
  selectedCapacityFilter: "",
  selectedAreaFilter: "",
  selectedModal: "",
  selectedRoomsToCompare: [],
};

const roomResultsSlice = createSlice({
  name: "roomResultsSlice",
  initialState,
  reducers: {
    setStepperState: (state, action: PayloadAction<number>) => {
      state.stepperState = action.payload;
    },
    setAllowedBedCounts: (state, action: PayloadAction<number[]>) => {
      state.allowedBedCounts = action.payload;
    },
    setRoomsList: (state, action: PayloadAction<IRoom[]>) => {
      state.roomsList = action.payload;
    },
    setSelectedBeds: (state, action: PayloadAction<number>) => {
      state.selectedBeds = action.payload;
    },
    setSelectedBedTypes: (state, action: PayloadAction<string[]>) => {
      state.selectedBedTypes = action.payload;
    },
    setSelectedRoomTypes: (state, action: PayloadAction<string[]>) => {
      state.selectedRoomTypes = action.payload;
    },
    setSelectedPriceFilter: (state, action: PayloadAction<string>) => {
      state.selectedPriceFilter = action.payload;
    },
    setSelectedCapacityFilter: (state, action: PayloadAction<string>) => {
      state.selectedCapacityFilter = action.payload;
    },
    setSelectedAreaFilter: (state, action: PayloadAction<string>) => {
      state.selectedAreaFilter = action.payload;
    },
    setSelectedModal: (state, action: PayloadAction<string>) => {
      state.selectedModal = action.payload;
    },
    setSelectedRoomsToCompare: (state, action: PayloadAction<IRoomCompare[]>) => {
      state.selectedRoomsToCompare = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getRooms.pending, (state) => {
        state.state = "pending";
      })
      .addCase(
        getRooms.fulfilled,
        (state, action: PayloadAction<IRoomResponse>) => {
          state.roomsList = action.payload.listRooms;
          state.totalRecords = action.payload.totalRecords;
          state.state = "fulfilled";
        }
      )
      .addCase(getRooms.rejected, (state) => {
        state.state = "error";
      });
  },
});

export const {
  setStepperState,
  setAllowedBedCounts,
  setSelectedBeds,
  setRoomsList,
  setSelectedBedTypes,
  setSelectedRoomTypes,
  setSelectedPriceFilter,
  setSelectedCapacityFilter,
  setSelectedAreaFilter,
  setSelectedModal,
  setSelectedRoomsToCompare,
} = roomResultsSlice.actions;
export default roomResultsSlice.reducer;
