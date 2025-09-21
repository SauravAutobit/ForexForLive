import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/socketService';

export type Category = string; 

interface CategoriesState {
  data: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoriesState = {
  data: [],
  status: 'idle',
  error: null,
};

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.send<Category[]>("fetch", {
        // query: "fintrabit.instruments.category.name._unique",
      query: "fintrabit.instrument_categories[type=\"static\"].name"
      });
      console.log("categories/fetchCategories",response)

      if (response.status === 'success' && response.data) {
        return response.data;
      }
      
      return rejectWithValue(response.message || "Failed to fetch categories.");
    } catch (error) {
      const errorMessage = (error as { message?: string }).message || "An unknown error occurred";
      return rejectWithValue(errorMessage);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.data = [];
      });
  },
});

export default categoriesSlice.reducer;