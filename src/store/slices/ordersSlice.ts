
import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import { apiClient } from "../../services/socketService";
import { setOrderStatus } from "./orderStatusSlice"; 

export interface PlaceOrderPayload {
  instrument_id: string;
  qty: number;
  price: number;
  order_type: "market" | "limit" | "stop";
  side: "buy" | "sell";
  stoploss: number;
  target: number;
}

export interface OrderResponse {
  data: string; 
  message: string;
  status: "success" | "failure";
}

interface OrdersState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastPlacedOrderId: string | null;
}

const initialState: OrdersState = {
  status: "idle",
  error: null,
  lastPlacedOrderId: null,
};

export const placeNewOrder = createAsyncThunk(
  "orders/placeNewOrder",
  async (orderPayload: PlaceOrderPayload, { rejectWithValue, dispatch }) => {
    dispatch(
      setOrderStatus({ status: "loading", message: "Placing order..." })
    );
    try {
      console.log("orderPayload", orderPayload)
      const response = await apiClient.send<OrderResponse>(
        "account/order/place",
        orderPayload
      );

      if (response.status === "success") {
        dispatch(
          setOrderStatus({
            status: "succeeded",
            message: "Order placed successfully!",
          })
        );
        return response.data;
      }

      const errorMessage = response.message || "Failed to place order.";
      dispatch(setOrderStatus({ status: "failed", message: errorMessage }));
      return rejectWithValue(errorMessage);
    } catch (error) {
      const errorMessage =
        (error as { message?: string }).message || "An unknown error occurred";
      dispatch(setOrderStatus({ status: "failed", message: errorMessage }));
      return rejectWithValue(errorMessage);
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.status = "idle";
      state.error = null;
      state.lastPlacedOrderId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeNewOrder.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        placeNewOrder.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          if (action.payload) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            state.lastPlacedOrderId = action.payload;
          }
        }
      )
      .addCase(placeNewOrder.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { resetOrderState } = ordersSlice.actions;

export default ordersSlice.reducer;