// Global configuration for API service layer
// When USE_MOCK_DATA is true, all calls simulate latency and return mock responses.
// When USE_MOCK_DATA is false, the service makes real HTTP requests to the python backend.
export const USE_MOCK_DATA = true;
export const API_BASE_URL = 'http://127.0.0.1:8000/api';
export const REQUEST_LATENCY_MS = 500; // Simulated latency for mock requests
