import { 
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";

// Define the shape of a single OHLCV data point
export interface OHLVCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Define the shape of the API response data
export interface ChartApiResponseData {
  data: {
    data: OHLVCData;
    time: number;
    id: string;
    instrument_id: string;
    type: string;
  }[];
  message: string;
  status: string;
}

// Define the state for the chart slice
interface ChartState {
  data: OHLVCData[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ChartState = {
  data: [],
  status: "idle",
  error: null,
};

/**
 * Async thunk to fetch historical chart data for a given instrument.
 * It fetches a specific range of data using the `startIndex` and `endIndex`.
 *
 * @param {string} instrumentId - The unique identifier of the financial instrument.
 * @param {number} startIndex - The starting index for the data slice.
 * @param {number} endIndex - The ending index for the data slice.
 */
export const fetchChartData = createAsyncThunk(
  "chart/fetchData",
  async (
    {
      instrumentId,
      startIndex,
      endIndex,
    }: {
      instrumentId: string;
      startIndex: number;
      endIndex: number;
    },
    { rejectWithValue }
  ) => {
    try {
      // const query = `fintrabit.instruments[id="${instrumentId}"].history._desc(time)[${startIndex}:${endIndex}]`;

const query = `fintrabit.chart_history[instrument_id="${instrumentId}"]._desc(time)[${startIndex}:${endIndex}]`;

      const response = await apiClient.send<ChartApiResponseData>("fetch", {
        query,
      });


      if (response.status === "success" && response.data) {
        // Map the raw API response to the desired OHLVCData format.
        // The `_desc(time)` query means data comes in descending order,
        // so we reverse it to get a chronological order for the chart.
        const chartData: OHLVCData[] = response.data
          .map((item) => ({
            time: item.time, // Unix timestamp is ideal for charting libraries
            open: item.data.open,
            high: item.data.high,
            low: item.data.low,
            close: item.data.close,
            volume: item.data.volume,
          }))
        //   .reverse(); // Reverse to get chronological order
        console.log("chartData slice", chartData);

        // Filter out any data points with the same time as the previous one
        const uniqueData = chartData.filter(
          (item, index, self) =>
            index === 0 || item.time !== self[index - 1].time
        );
console.log('fetchChartData -> returned points:', chartData.length, chartData[0]?.time, chartData[chartData.length-1]?.time);

        return uniqueData;
      }

      return rejectWithValue(
        response.payload.message || "Failed to fetch chart data."
      );
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

const chartSlice = createSlice({
  name: "chart",
  initialState,
  reducers: {
    // A reducer to add new data to the beginning of the existing data array.
    // This is useful for "lazy loading" more historical data.
    prependChartData: (state, action: PayloadAction<OHLVCData[]>) => {
      // Prepend new data and keep the state immutable
      state.data = [...action.payload, ...state.data];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChartData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchChartData.fulfilled,
        (state, action: PayloadAction<OHLVCData[]>) => {
          state.status = "succeeded";
          // If the data array is empty, this is the initial load.
          if (state.data.length === 0) {
            state.data = action.payload;
          } else {
            // Otherwise, we are lazy loading, so we prepend the new data.
            // We also need to handle potential duplicates at the boundary.
            const newData = action.payload;
            const existingData = state.data;

            // Find the index where the new data starts in the existing data
            const lastExistingTime = existingData[0].time;
            const newUniqueData = newData.filter(
              (item) => item.time < lastExistingTime
            );

            // Prepend the new unique data
            state.data = [...newUniqueData, ...existingData];
          }
        }
      )
      .addCase(fetchChartData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { prependChartData } = chartSlice.actions;

export default chartSlice.reducer;
