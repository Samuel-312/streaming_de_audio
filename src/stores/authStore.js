import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../api/authService'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(credentials) {
    try {
      const response = await authService.login(credentials)
      setSession(response.data.user, response.data.token)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Error al iniciar sesión' }
    }
  }

  async function register(userData) {
    try {
      const response = await authService.register(userData)
      setSession(response.data.user, response.data.token)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Error al registrarse' }
    }
  }

  function setSession(userData, tokenData) {
    user.value = userData
    token.value = tokenData
    localStorage.setItem('token', tokenData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function clearSession() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isAuthenticated, isAdmin, login, register, clearSession }
})