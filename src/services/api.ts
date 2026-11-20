// Global configuration for API service layer
// When USE_MOCK_DATA is false, the service communicates with the live Python FastAPI backend.
// Graceful fallback to mock data is provided if the server is temporarily offline.
export const USE_MOCK_DATA = false;
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api';
export const REQUEST_LATENCY_MS = 500; // Simulated latency for fallback requests
