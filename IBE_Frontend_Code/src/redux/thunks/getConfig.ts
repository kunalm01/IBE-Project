import { createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { configUrl } from "../../utils/constants";

export const getConfig = createAsyncThunk(
    "getConfig", async () => {
        try {
            const response = await fetch(configUrl);
            const data = await response.json();                     
            return data;
        } catch {
            isRejectedWithValue("Error while fetching config data");
        }
    }
); 