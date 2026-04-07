import api from './axios'

export const authService = {
  // Llama a POST /api/auth/register con los datos del formulario
  register(userData) {
    return api.post('/auth/register', userData)
  },

  // Llama a POST /api/auth/login
  login(credentials) {
    return api.post('/auth/login', credentials)
  }
}