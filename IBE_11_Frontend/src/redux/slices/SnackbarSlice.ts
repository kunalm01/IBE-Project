import { createSlice } from "@reduxjs/toolkit";

interface InitialState{
    message: string;
    show: boolean;
    type: "success" | "info" | "error";
}

const initialState: InitialState = {
  message: "",
  show: false,
  type: "success",
};

const snackbarSlice = createSlice({
  name: "snackbarSlice",
  initialState,
  reducers: {
    showSnackbar(state, action) {
      state.show = true;
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
    hideSnackbar(state) {
      state.show = false;
    },
  },
});

export const {showSnackbar, hideSnackbar} = snackbarSlice.actions;
export default snackbarSlice.reducer;
