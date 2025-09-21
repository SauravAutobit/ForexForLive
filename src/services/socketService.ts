// src/services/socketService.ts
import type { Store } from '@reduxjs/toolkit';
import { WebSocketClient } from './WebSocketClient';
import { setApiStatus, setStreamStatus } from '../store/slices/webSocketSlice';
import { WEBSOCKET_API_URL, WEBSOCKET_STREAM_URL } from '../utils/constants/app.constants';

// MOCK: In a real app, get this from your authentication flow (e.g., sessionStorage)
// const getAuthToken = (): string | null => {
//   // Replace 'authToken' with the key you use to store the user's token
//   return sessionStorage.getItem('authToken');
// };

// Base URLs from .env file
const API_BASE_URL = WEBSOCKET_API_URL;           // Should be e.g., "ws://192.46.213.87:5858"
const STREAM_BASE_URL = WEBSOCKET_STREAM_URL      //import.meta.env.VITE_STREAM_URL; 

let apiClient: WebSocketClient;
let streamClient: WebSocketClient;

export const initializeSockets = (store: Store) => {
  // const token = getAuthToken();
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uIjoiQUNDLThkNWNmMDJhNjIwZTQ5NGNiZjQzNTY5ODc5OTI3OTMzIn0.Ig8-ZbGjNH1JbrkYLNeT7dWhDo9zz27GgZGHbnRfEfA"

  // If there's no token, don't attempt to connect.
  if (!token) {
    console.error("❌ No auth token found. WebSocket connections will not be initialized.");
    return;
  }

  // --- API Client Initialization ---
  if (!API_BASE_URL) {
    console.error("❌ VITE_API_WS_URL is not defined. API WebSocket connection will fail.");
  } else if (!apiClient) {
    // CHANGED: Construct the new URL with the endpoint and token
    const apiUrlWithToken = `${API_BASE_URL}?t=${token}`;
    apiClient = new WebSocketClient(apiUrlWithToken, store, setApiStatus);
    console.log("API WebSocket Client Initialized.");
  }
  
  // --- Stream Client Initialization ---
  if (!STREAM_BASE_URL) {
    console.error("❌ VITE_STREAM_URL is not defined. Stream WebSocket connection will fail.");
  } else if (!streamClient) {
    // CHANGED: Apply the same token logic for the stream URL
    const streamUrlWithToken = `${STREAM_BASE_URL}`;
    streamClient = new WebSocketClient(streamUrlWithToken, store, setStreamStatus);
    console.log("Stream WebSocket Client Initialized.");
  }
};

// Export the instances to be used throughout the app
export { apiClient, streamClient };