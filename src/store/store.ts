import { configureStore } from "@reduxjs/toolkit";
import webSocketReducer from "../store/slices/webSocketSlice";
import categoriesReducer from "../store/slices/categoriesSlice";
import loadingReducer from "../store/slices/loadingSlice";
import instrumentsReducer from "./slices/instrumentsSlice";
import quotesReducer, { initializeStreamListener } from "./slices/quotesSlice";
import chartReducer from "./slices/chartSlice";
import ordersReducer from "./slices/ordersSlice";
import orderStatusReducer from "./slices/orderStatusSlice";

export const store = configureStore({
  reducer: {
    websockets: webSocketReducer,
    categories: categoriesReducer,
    loading: loadingReducer,
    instruments: instrumentsReducer,
    quotes: quotesReducer,
    chart: chartReducer,
    orders: ordersReducer,
    orderStatus: orderStatusReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

initializeStreamListener(store);
