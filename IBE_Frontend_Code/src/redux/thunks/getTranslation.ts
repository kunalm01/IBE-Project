import { createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { translationUrl } from "../../utils/constants";

export const getTranslation = createAsyncThunk("getTranslation", async () => {
  try {
    const response = await fetch(translationUrl);
    const data = await response.json();
    return data;
  } catch {
    isRejectedWithValue("Error while fetching translation data");
  }
});
