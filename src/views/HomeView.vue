<template>
  <div class="home">

    <div class="home-header">
      <h1>Bienvenido, <span class="highlight">{{ authStore.user?.username }}</span></h1>
      <p>Descubre las mejores playlists</p>
    </div>

    <div class="search-section">
      <div class="search-box" :class="{ focused: searchFocused }">
        <span class="search-icon"></span>
        <input
          v-model="searchQuery"
          @input="onSearchInput"
          @focus="searchFocused = true"
          @blur="searchFocused = false"
          type="text"
          placeholder="Buscar canción por título o artista..."
          class="search-input"
        />
        <button v-if="searchQuery" @click="clearSearch" class="clear-btn">✕</button>
      </div>

      <div v-if="searchLoading" class="search-loading">Buscando...</div>

      <div v-else-if="searchQuery" class="search-results">
        <div v-if="filteredSongs.length > 0">
          <p class="search-count">{{ filteredSongs.length }} resultado(s)</p>
          <div
            v-for="song in filteredSongs"
            :key="song.id"
            class="song-result"
            :class="{ playing: playerStore.currentSong?.id === song.id }"
            @click="playSong(song)"
          >
            <div class="song-icon">
              <span v-if="playerStore.currentSong?.id === song.id && playerStore.isPlaying">🎵</span>
              <span v-else>🎶</span>
            </div>
            <div class="song-details">
              <span class="song-title">{{ song.title }}</span>
              <span class="song-artist">{{ song.artist }}</span>
            </div>
            <button class="play-btn">
              {{ playerStore.currentSong?.id === song.id && playerStore.isPlaying ? '⏸' : '▶' }}
            </button>
          </div>
        </div>
        <div v-else class="no-results">
          No se encontraron canciones para "{{ searchQuery }}"
        </div>
      </div>
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
import { usePlayerStore } from '../stores/playerStore'
import { playlistService } from '../api/playlistService'
import { songService } from '../api/songService'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const playlists = ref([])
const loading = ref(true)
const error = ref('')

const searchQuery = ref('')
const allSongs = ref([])
const filteredSongs = ref([])
const searchLoading = ref(false)
const searchFocused = ref(false)
let searchTimeout = null

onMounted(async () => {
  try {
    const [playlistsRes, songsRes] = await Promise.all([
      playlistService.getAll(),
      songService.getAll()
    ])
    playlists.value = playlistsRes.data
    allSongs.value = songsRes.data
  } catch (err) {
    error.value = 'Error al cargar los datos'
  } finally {
    loading.value = false
  }
})

function onSearchInput() {
  clearTimeout(searchTimeout)
  if (!searchQuery.value.trim()) {
    filteredSongs.value = []
    searchLoading.value = false
    return
  }
  searchLoading.value = true
  searchTimeout = setTimeout(() => {
    const q = searchQuery.value.toLowerCase().trim()
    filteredSongs.value = allSongs.value.filter(
      s =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.artist && s.artist.toLowerCase().includes(q))
    )
    searchLoading.value = false
  }, 300)
}

function clearSearch() {
  searchQuery.value = ''
  filteredSongs.value = []
}

function playSong(song) {
  if (playerStore.currentSong?.id === song.id) {
    playerStore.togglePlay()
  } else {
    playerStore.playSong(song, filteredSongs.value)
  }
}

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

.search-section {
  margin-bottom: 40px;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 10px 16px;
  gap: 10px;
  transition: border-color 0.2s;
}

.search-box.focused {
  border-color: #a855f7;
}

.search-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 15px;
}

.search-input::placeholder {
  color: #555;
}

.clear-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #ffffff;
}

.search-results {
  margin-top: 10px;
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 12px;
  overflow: hidden;
}

.search-count {
  font-size: 12px;
  color: #666;
  padding: 10px 16px 4px;
  margin: 0;
}

.song-result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.song-result:hover {
  background-color: #242424;
}

.song-result.playing {
  background-color: #1e1230;
}

.song-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.song-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.song-title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-result.playing .song-title {
  color: #a855f7;
}

.song-artist {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-btn {
  background: none;
  border: none;
  color: #a855f7;
  font-size: 16px;
  cursor: pointer;
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.play-btn:hover {
  background-color: #2a1a3e;
}

.no-results {
  padding: 20px 16px;
  color: #666;
  font-size: 14px;
  text-align: center;
}

.search-loading {
  margin-top: 10px;
  color: #666;
  font-size: 13px;
  padding-left: 4px;
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