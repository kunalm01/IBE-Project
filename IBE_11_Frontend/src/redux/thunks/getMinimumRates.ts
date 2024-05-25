import { createAsyncThunk, isRejectedWithValue } from "@reduxjs/toolkit";
import { minimumRatesUrl } from "../../utils/constants";

export const getMinimumRates = createAsyncThunk(
    "getMinimumRates", async () => {
        try {
            const response = await fetch(minimumRatesUrl);
            const data = await response.json();
            return data;
        } catch {
            isRejectedWithValue("Error while fetching minimum rates data");
        }
    }
);