// src/store/slices/quotesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Instrument } from './instrumentsSlice';
import { streamClient } from '../../services/socketService';
import type { Store } from '@reduxjs/toolkit';

export interface QuoteData {
  id: string; // The instrument ID
  name: string;
  feeding_name: string;
  trading_name: string;
  bid: number;
  ask: number;
  low: number;
  high: number;
  close: number;
  open: number;
  timestamp: number;
    ltp: number; // ✅ Add Last Traded Price
    
  static_data: Record<string, string | number>;

}


// ✅ NEW: Type for the incoming stream data payload for better type safety
type StreamDataPayload = {
  ask?: number[];
  askq?: number[];
  bid?: number[];
  bidq?: number[];
  close?: number[];
  high?: number[];
  low?: number[];
  ltp?: number[];
  ltpq?: number[];
  ltpt?: number[];
  open?: number[];
};

interface QuotesState {
  quotes: QuoteData[];
}

const QUOTES_STORAGE_KEY = 'subscribedQuotes';

const loadQuotesFromStorage = (): QuoteData[] => {
  try {
    const storedQuotes = sessionStorage.getItem(QUOTES_STORAGE_KEY);
    if (storedQuotes) {
      return JSON.parse(storedQuotes);
    }
  } catch (e) {
    console.error("Failed to parse quotes from sessionStorage", e);
  }
  return [];
};

const initialState: QuotesState = {
  quotes: loadQuotesFromStorage(),
};


// --- Helper function to send subscription message ---
const subscribeToInstrument = (instrumentId: string) => {
  if (streamClient) {
    const message = {
      action: "subscribe",
      payload: [{
        id: instrumentId,
        data: ["quotes"]
      }]
    };
    // ✅ Use the new dedicated method for stream messages
    streamClient.sendStreamMessage(message);
  } else {
      console.warn("Stream client not ready, cannot subscribe to", instrumentId);
  }
};


// const unsubscribeFromInstrument = (instrumentId: string) => {
//   if (streamClient) {
//     const message = {
//       action: "unsubscribe",
//       payload: [{
//         id: instrumentId,
//         data: ["quotes"]
//       }]
//     };
//     streamClient.sendStreamMessage(message);
//     console.log(`Unsubscribed from ${instrumentId}`);
//   }
// };



export const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
  addInstrumentToQuotes: (state, action: PayloadAction<Instrument>) => {
      const newInstrument = action.payload;
      const isAlreadyAdded = state.quotes.some(q => q.id === newInstrument.id);
      if (!isAlreadyAdded) {
        const newQuote: QuoteData = {
          id: newInstrument.id,
          name: newInstrument.name,
          feeding_name: newInstrument.feeding_name,
          trading_name: newInstrument.trading_name,
          bid: 0, ask: 0, low: 0, high: 0, close: 0, open: 0, timestamp: 0, ltp: 0,
          static_data: newInstrument.static_data,
        };
        state.quotes.push(newQuote);
        subscribeToInstrument(newInstrument.id);
        sessionStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(state.quotes));
      }
    },
     // ✅ REWRITTEN REDUCER
    updateQuoteData: (state, action: PayloadAction<{ instrumentId: string; data: StreamDataPayload }>) => {
      const { instrumentId, data } = action.payload;
      // Using .map() creates a new array, which guarantees a re-render.
      state.quotes = state.quotes.map(quote => {
        // If this isn't the quote we're looking for, return it as is
        if (quote.id !== instrumentId) {
          return quote;
        }

        // Otherwise, return a new object with the updated data
        return {
          ...quote,
          bid: data.bid?.[0] ?? quote.bid,
          ask: data.ask?.[0] ?? quote.ask,
          low: data.low?.[0] ?? quote.low,
          high: data.high?.[0] ?? quote.high,
          close: data.close?.[0] ?? quote.close,
          open: data.open?.[0] ?? quote.open,
          ltp: data.ltp?.[0] ?? quote.ltp,
          timestamp: data.ltpt?.[0] ?? quote.timestamp,
        };
      });
    },  

    removeInstrumentsFromQuotes: (state, action: PayloadAction<string[]>) => {
      const idsToRemove = new Set(action.payload);

      // ℹ️ SERVER CALL COMMENTED OUT AS REQUESTED
      // action.payload.forEach(id => unsubscribeFromInstrument(id));

      // Filter out the quotes that are marked for deletion
      state.quotes = state.quotes.filter(quote => !idsToRemove.has(quote.id));
      
      // Update session storage to persist the changes
      sessionStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(state.quotes));
    },
    reorderQuotes: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const { activeId, overId } = action.payload;
      const oldIndex = state.quotes.findIndex((q) => q.id === activeId);
      const newIndex = state.quotes.findIndex((q) => q.id === overId);
//object save and sme coditoon overrideoverride.

      if (oldIndex !== -1 && newIndex !== -1) {
        const [movedItem] = state.quotes.splice(oldIndex, 1);
        state.quotes.splice(newIndex, 0, movedItem);
        // Persist the new order to sessionStorage
        sessionStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(state.quotes));
      }
    },
  },
});



export const { addInstrumentToQuotes, updateQuoteData, reorderQuotes, removeInstrumentsFromQuotes } = quotesSlice.actions;

// --- Type guard remains the same ---
function isQuoteStreamMessage(msg: unknown): msg is { component: 'quotes'; instrument: { id: string }; data: StreamDataPayload } {
    return (
        typeof msg === 'object' && msg !== null &&
        'component' in msg && (msg as { component: string }).component === 'quotes' &&
        'instrument' in msg && typeof (msg as { instrument: unknown }).instrument === 'object' && (msg as { instrument: object })?.instrument !== null && 'id' in (msg as { instrument: { id: string } }).instrument &&
        'data' in msg && typeof (msg as { data: unknown }).data === 'object' && (msg as { data: object })?.data !== null
    );
}


// ✅ REWRITTEN to use the new onConnected method
export const initializeStreamListener = (store: Store) => {
  if (streamClient) {
    // 1. Set the handler for incoming messages (this can be done immediately)
    streamClient.setMessageHandler((msg: unknown) => {
      // This part remains the same
      if (isQuoteStreamMessage(msg)) {
        store.dispatch(updateQuoteData({
          instrumentId: msg.instrument.id,
          data: msg.data,
        }));
      }
    });

    // 2. Queue the re-subscription logic to run ONLY after the connection is open
    streamClient.onConnected(() => {
      const initialQuotes = (store.getState() as RootState).quotes.quotes;
      if (initialQuotes.length > 0) {
        console.log(`🔄 Re-subscribing to ${initialQuotes.length} instruments from last session...`);
        initialQuotes.forEach(quote => {
          subscribeToInstrument(quote.id);
        });
      }
    });
  }
};

export const selectQuotes = (state: RootState) => state.quotes.quotes;
export default quotesSlice.reducer;