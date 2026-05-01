<template>
  <div class="home">

    
    <div class="home-header">
      <h1>Bienvenido, <span class="highlight">{{ authStore.user?.username }}</span></h1>
      <p>Descubre las mejores playlists</p>
    </div>

    
    <div v-if="loading" class="loading">
      Cargando playlists...
    </div>

    
    <div v-else-if="error" class="error-msg">
      {{ error }}
    </div>

    
    <div v-else>
      <div class="section-header">
        <h2>Tus Playlists</h2>
      </div>

      
      <div class="playlists-grid">
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="playlist-card"
          @click="goToPlaylist(playlist.id)"
        >
          <img
            :src="playlist.cover_url || 'https://picsum.photos/seed/' + playlist.id + '/200'"
            class="card-cover"
          />
          <div class="card-info">
            <h3>{{ playlist.title }}</h3>
            <p>{{ playlist.users?.username }}</p>
          </div>
        </div>
      </div>
      
      <div v-if="playlists.length === 0" class="empty">
        No hay playlists aún.
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { playlistService } from '../api/playlistService'
import { songService } from '../api/songService'

const router = useRouter()
const authStore = useAuthStore()

const playlists = ref([])
const loading = ref(true)
const error = ref('')



onMounted(async () => {
  try {
    const response = await playlistService.getAll()
    playlists.value = response.data
  } catch (err) {
    error.value = 'Error al cargar las playlists'
  } finally {
    
    loading.value = false
  }
})

function goToPlaylist(id) {
  router.push({ name: 'Playlist', params: { id } })
}
</script>

<style scoped>
.home {
  color: #ffffff;
}

.home-header {
  margin-bottom: 40px;
}

.home-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.highlight {
  color: #a855f7;
}

.home-header p {
  color: #888;
  font-size: 15px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.playlist-card {
  background-color: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
  background-color: #222222;
}

.card-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.card-info {
  padding: 12px;
}

.card-info h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-info p {
  color: #888;
  font-size: 12px;
}

.loading {
  color: #888;
  text-align: center;
  padding: 40px;
}

.error-msg {
  color: #ef4444;
  text-align: center;
  padding: 40px;
}

.empty {
  color: #888;
  text-align: center;
  padding: 40px;
}
</style>