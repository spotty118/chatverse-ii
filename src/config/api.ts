// API configuration
export const API_CONFIG = {
  // Set this to true to use the local development backend
  useLocalBackend: true,
  
  // Original production backend
  productionBaseUrl: 'https://chathub.gg/api',
  
  // Local development backend
  localBaseUrl: 'http://localhost:3000/api',
  
  // Get the current base URL based on configuration
  get baseUrl() {
    return this.useLocalBackend ? this.localBaseUrl : this.productionBaseUrl
  },
  
  // API endpoints
  endpoints: {
    // AI model endpoints
    chatgpt: '/proxy/chatgpt',
    anthropic: '/proxy/anthropic',
    gemini: '/proxy/google/gemini',
    poe: '/proxy/poe',
    poeFormkey: '/proxy/poe/formkey',

    // License endpoints
    activateLicense: '/license/activate',
    deactivateLicense: '/license/deactivate',
    licenseStatus: '/license/status',
    premiumStatus: '/license/premium/status',
    premiumProduct: '/license/premium/product',
    createDiscount: '/license/premium/discount/create',
    checkDiscount: '/license/premium/discount/check',
  },
}
