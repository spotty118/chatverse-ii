export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  endpoints: {
    chatgpt: '/api/chat/chatgpt',
    anthropic: '/api/chat/anthropic',
    gemini: '/api/chat/gemini'
  }
}