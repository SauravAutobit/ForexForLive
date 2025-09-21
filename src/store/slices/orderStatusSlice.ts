
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface OrderStatusState {
  status: "idle" | "loading" | "succeeded" | "failed";
  message: string | null;
}

const initialState: OrderStatusState = {
  status: "idle",
  message: null,
};

const orderStatusSlice = createSlice({
  name: "orderStatus",
  initialState,
  reducers: {
    setOrderStatus: (
      state,
      action: PayloadAction<{
        status: "idle" | "loading" | "succeeded" | "failed";
        message: string | null;
      }>
    ) => {
      state.status = action.payload.status;
      state.message = action.payload.message;
    },
    resetOrderStatus: (state) => {
      state.status = "idle";
      state.message = null;
    },
  },
});

export const { setOrderStatus, resetOrderStatus } = orderStatusSlice.actions;

export default orderStatusSlice.reducer;
