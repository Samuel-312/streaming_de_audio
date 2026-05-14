import api from './axios'

export const authService = {
  register(userData) {
    return api.post('/auth/register', userData)
  },

  login(credentials) {
    return api.post('/auth/login', credentials)
  }
}