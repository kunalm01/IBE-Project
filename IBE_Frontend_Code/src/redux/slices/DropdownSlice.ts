import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface InitialState {
  isLanguageActive: boolean;
  isCurrencyActive: boolean;
  isPropertyActive: boolean;
  isCalendarActive: boolean;
  isGuestActive: boolean;
  isRoomActive: boolean;
  isMenuActive: boolean;
  isSortActive: boolean;
  isFilterActive: boolean;
  isBedActive: boolean;
}

const initialState: InitialState = {
  isLanguageActive: false,
  isCurrencyActive: false,
  isPropertyActive: false,
  isCalendarActive: false,
  isGuestActive: false,
  isRoomActive: false,
  isMenuActive: false,
  isSortActive: false,
  isFilterActive: false,
  isBedActive: false,
};

const dropdownSlice = createSlice({
  name: "dropdownSlice",
  initialState,
  reducers: {
    setDropdown: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      if (key === "LanguageMenu") {
        state.isLanguageActive = !state.isLanguageActive;
      } else if (key === "CurrencyMenu") {
        state.isCurrencyActive = !state.isCurrencyActive;
      } else {
        state.isBedActive = key === "Bed" ? !state.isBedActive : false;
        state.isCalendarActive =
          key === "Calendar" ? !state.isCalendarActive : false;
        state.isCurrencyActive =
          key === "Currency" ? !state.isCurrencyActive : false;
        state.isFilterActive = key === "Filter" ? !state.isFilterActive : false;
        state.isGuestActive = key === "Guest" ? !state.isGuestActive : false;
        state.isLanguageActive =
          key === "Language" ? !state.isLanguageActive : false;
        state.isMenuActive = key === "Menu" ? !state.isMenuActive : false;
        state.isPropertyActive =
          key === "Property" ? !state.isPropertyActive : false;
        state.isRoomActive = key === "Room" ? !state.isRoomActive : false;
        state.isSortActive = key === "Sort" ? !state.isSortActive : false;
      }
    },
    closeDropdown: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      if (key === "LanguageMenu") {
        state.isLanguageActive = false;
      } else if (key === "CurrencyMenu") {
        state.isCurrencyActive = false;
      } else if (key === "Bed") {
        state.isBedActive = false;
      } else if (key === "Calendar") {
        state.isCalendarActive = false;
      } else if (key === "Currency") {
        state.isCurrencyActive = false;
      } else if (key === "Filter") {
        state.isFilterActive = false;
      } else if (key === "Guest") {
        state.isGuestActive = false;
      } else if (key === "Language") {
        state.isLanguageActive = false;
      } else if (key === "Menu") {
        state.isMenuActive = false;
      } else if (key === "Property") {
        state.isPropertyActive = false;
      } else if (key === "Room") {
        state.isRoomActive = false;
      } else if (key === "Sort") {
        state.isSortActive = false;
      }
    },
  },
});

export const { setDropdown, closeDropdown } = dropdownSlice.actions;
export default dropdownSlice.reducer;
