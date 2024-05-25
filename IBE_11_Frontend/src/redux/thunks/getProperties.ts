import { createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { propertyUrl } from "../../utils/constants";

export const getProperties = createAsyncThunk("getProperties", async () => {
  try {
    const response = await fetch(propertyUrl);
    const data = await response.json();
    return data.data.listProperties;
  } catch {
    isRejectedWithValue("Error while fetching property data");
  }
});
