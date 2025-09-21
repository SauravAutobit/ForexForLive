
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";

export interface Instrument {
  id: string;
  name: string;
  trading_name: string;
  feeding_name: string;
  icon: string;
  overnight_margin_time: string;
  static_category_id: string;
  static_data: Record<string, string | number>;
  timings: string;
  dinamic_category_ids?: { id: string; history_interval: number }[];
}

interface InstrumentsState {
  data: Record<string, Instrument[]>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
    selectedInstrumentId: string | null; 

}
const INSTRUMENT_STORAGE_KEY = 'selectedInstrument';
// Helper to load the ID from sessionStorage
const loadSelectedInstrumentId = (): string | null => {
  try {
    const storedId = sessionStorage.getItem(INSTRUMENT_STORAGE_KEY);
    return storedId;
  } catch (e) {
    console.error("Failed to load selected instrument ID from sessionStorage", e);
    return null;
  }
};

const loadState = (): Record<string, Instrument[]> => {
  try {
    const serializedState = sessionStorage.getItem('instrumentsData');
    if (serializedState === null) {
      return {};
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load state from local storage", err);
    return {};
  }
};

const initialState: InstrumentsState = {
  data: loadState(), 
  status: "idle",
  error: null,
    selectedInstrumentId: loadSelectedInstrumentId(), 
};

export const fetchInstrumentsByCategory = createAsyncThunk(
  "instruments/fetchByCategory",
  async (categoryName: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.send<Instrument[]>("fetch", {
        query: `fintrabit.instruments[category[0].name="${categoryName}"]`,
      });

      if (response.status === "success" && response.data) {
        // Save to local storage after successful fetch
        const existingData = JSON.parse(sessionStorage.getItem('instrumentsData') || '{}');
        const newData = { ...existingData, [categoryName]: response.data };
        sessionStorage.setItem('instrumentsData', JSON.stringify(newData));
        return { categoryName, instruments: response.data };
      }

      return rejectWithValue(
        response.message || "Failed to fetch instruments for this category."
      );
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

const instrumentsSlice = createSlice({
  name: "instruments",
  initialState,
  reducers: {
    setSelectedInstrument: (state, action: PayloadAction<string>) => {
      state.selectedInstrumentId = action.payload;
      // Persist the ID to session storage
      sessionStorage.setItem(INSTRUMENT_STORAGE_KEY, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstrumentsByCategory.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchInstrumentsByCategory.fulfilled,
        (
          state,
          action: PayloadAction<{
            categoryName: string;
            instruments: Instrument[];
          }>
        ) => {
          state.status = "succeeded";
          const { categoryName, instruments } = action.payload;
          state.data[categoryName] = instruments;
        }
      )
      .addCase(fetchInstrumentsByCategory.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedInstrument } = instrumentsSlice.actions;


export default instrumentsSlice.reducer;