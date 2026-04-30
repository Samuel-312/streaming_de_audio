<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-icon">🎵</div>
        <h1>~Sonic~</h1>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Nombre</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="Ingrese su nombre"
            :class="{ error: errors.username }"
          />
          <span v-if="errors.username" class="error-msg">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="Ingrese su Email"
            :class="{ error: errors.email }"
          />
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            :class="{ error: errors.password }"
          />
          <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label>Confirmar Contraseña</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="••••••••"
            :class="{ error: errors.confirmPassword }"
          />
          <span v-if="errors.confirmPassword" class="error-msg">{{ errors.confirmPassword }}</span>
        </div>

        <div v-if="serverError" class="server-error">
          {{ serverError }}
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Cargando...' : 'Crear Cuenta' }}
        </button>
      </form>

      <p class="auth-link">
        ¿Ya tiene una cuenta?
        <RouterLink to="/login">Login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({})
const serverError = ref('')
const loading = ref(false)

function validate() {
  errors.value = {}

  if (!form.value.username || form.value.username.length < 3) {
    errors.value.username = 'Mínimo 3 caracteres'
  }

  if (!form.value.email) {
    errors.value.email = 'El email es requerido'
  }

  if (!form.value.password || form.value.password.length < 6) {
    errors.value.password = 'Mínimo 6 caracteres'
  }

  
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Las contraseñas no coinciden'
  }

  return Object.keys(errors.value).length === 0
}

async function handleRegister() {
  if (!validate()) return

  loading.value = true
  serverError.value = ''

  
  const result = await authStore.register({
    username: form.value.username,
    email: form.value.email,
    password: form.value.password
  })

  if (result.success) {
    router.push({ name: 'Home' })
  } else {
    serverError.value = result.message
  }

  loading.value = false
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background-color: #0f0f0f;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.auth-header h1 {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
  margin: 0;
}

.auth-header p {
  color: #888;
  font-size: 14px;
  margin-top: 4px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #888;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  background-color: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  padding: 12px 16px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #a855f7;
}

.form-group input.error {
  border-color: #ef4444;
}

.error-msg {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.server-error {
  background-color: #2a1a1a;
  border: 1px solid #ef4444;
  border-radius: 8px;
  color: #ef4444;
  font-size: 14px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
}

.btn-primary {
  width: 100%;
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  padding: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  color: #888;
  font-size: 14px;
  margin-top: 24px;
}

.auth-link a {
  color: #a855f7;
  text-decoration: none;
  font-weight: 600;
}
</style>