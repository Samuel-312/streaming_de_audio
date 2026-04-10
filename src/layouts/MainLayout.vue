<template>
  <div class="layout">

    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span>🎵</span>
        <h2>Sonic 🎵</h2>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/home" class="nav-item">
          🏠 <span>Home</span>
        </RouterLink>
        <RouterLink to="/playlists" class="nav-item">
          🎵 <span> My Playlists</span>
        </RouterLink>
        <RouterLink v-if="authStore.isAdmin" to="/admin" class="nav-item">
          ⚙️ <span>Admin</span>
        </RouterLink>
      </nav>

      <!-- Info del usuario y logout -->
      <div class="sidebar-footer">
        <div class="user-info">
          <span class="user-name">{{ authStore.user?.username }}</span>
          <span class="user-role">{{ authStore.user?.role }}</span>
        </div>
        <button @click="handleLogout" class="logout-btn">Salir</button>
      </div>
    </aside>

    <!-- Contenido principal -->
    <!-- pb-20 deja espacio para el reproductor fijo abajo -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- Reproductor persistente -->
    <AudioPlayer />


  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import AudioPlayer from '../components/AudioPlayer.vue'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.clearSession()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background-color: #0f0f0f;
}

.sidebar {
  width: 220px;
  background-color: #111111;
  border-right: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 80px;
  /* Altura del reproductor */
  z-index: 50;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 32px;
  padding: 0 8px;
}

.sidebar-logo h2 {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #888;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: #1a1a1a;
  color: #ffffff;
}

.nav-item.router-link-active {
  background-color: #1a1a1a;
  color: #a855f7;
}

.sidebar-footer {
  border-top: 1px solid #2a2a2a;
  padding-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
}

.user-role {
  color: #a855f7;
  font-size: 11px;
  text-transform: uppercase;
}

.logout-btn {
  background: none;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  color: #888;
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.main-content {
  margin-left: 220px;
  padding: 32px;
  padding-bottom: 100px;
  /* Espacio para el reproductor */
  flex: 1;
}
</style>