import { createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { currencyUrl } from "../../utils/constants";

export const getCurrency = createAsyncThunk(
    "getCurrency", async () => {
        try {
            const response = await fetch(currencyUrl);
            const data = await response.json();
            return data.data;
        } catch {
            isRejectedWithValue("Error while fetching currency data");
        }
    }
); 