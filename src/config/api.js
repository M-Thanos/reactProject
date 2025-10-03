// API Configuration
// استخدام متغيرات البيئة من Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://buttons-api-production.up.railway.app/api';

export const API_ENDPOINTS = {
  // Base URL
  BASE_URL: API_BASE_URL,
  
  // Pages endpoints
  PAGES: `${API_BASE_URL}/pages`,
  PAGE_BY_ID: (id) => `${API_BASE_URL}/pages/${id}`,
  
  // Buttons endpoints
  BUTTONS: `${API_BASE_URL}/buttons`,
  BUTTON_BY_ID: (id) => `${API_BASE_URL}/buttons/${id}`,
  
  // Button positions endpoints
  BUTTON_POSITIONS: `${API_BASE_URL}/button-positions`,
  BUTTON_POSITION_BY_ID: (id) => `${API_BASE_URL}/button-positions/${id}`,
};

export default API_ENDPOINTS;

