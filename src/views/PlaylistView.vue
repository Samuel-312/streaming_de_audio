<template>
  <div class="playlist-view">

    <div v-if="loading" class="loading">Cargando playlist...</div>
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <div v-else-if="playlist">

      <div class="playlist-header">
        <img
          :src="playlist.cover_url || 'https://picsum.photos/seed/' + playlist.id + '/200'"
          class="playlist-cover"
        />
        <div class="playlist-info">
          <span class="playlist-type">PUBLIC PLAYLIST</span>
          <h1>{{ playlist.title }}</h1>
          <p class="playlist-desc">{{ playlist.description }}</p>
          <div class="playlist-meta">
            <span>{{ playlist.users?.username }}</span>
            <span>·</span>
            <span>{{ songs.length }} canciones</span>
          </div>
          <div class="header-buttons">
            <button v-if="songs.length > 0" @click="playAll" class="btn-play-all">
              ▶ Play
            </button>
            <button
              v-if="isOwner"
              @click="openAddSongsModal"
              class="btn-add-songs"
            >
              + Agregar canciones
            </button>
          </div>
        </div>
      </div>

      <div class="songs-list">
        <div class="songs-header">
          <span class="col-num">#</span>
          <span class="col-title">TÍTULO</span>
          <span class="col-artist">ARTISTA</span>
          <span class="col-duration">DURACIÓN</span>
          <span class="col-remove"></span>
        </div>

        <div class="songs-divider"></div>

        <div
          v-for="(item, index) in songs"
          :key="item.songs.id"
          class="song-row"
          :class="{ active: playerStore.currentSong?.id === item.songs.id }"
          @click="playSong(item.songs)"
        >
          <span class="col-num">
            <span v-if="playerStore.currentSong?.id === item.songs.id" class="playing-icon">♪</span>
            <span v-else>{{ index + 1 }}</span>
          </span>

          <div class="col-title">
            <img
              :src="item.songs.cover_url || 'https://picsum.photos/seed/' + item.songs.id + '/40'"
              class="song-cover"
            />
            <span>{{ item.songs.title }}</span>
          </div>

          <span class="col-artist">{{ item.songs.artist }}</span>
          <span class="col-duration">{{ formatDuration(item.songs.duration) }}</span>

          <div class="col-remove">
            <button
              v-if="isOwner"
              @click.stop="confirmRemove(item.songs)"
              class="btn-remove"
              title="Quitar de la playlist"
            >
              ✕
            </button>
          </div>
        </div>

        <div v-if="songs.length === 0" class="empty">
          <p>Esta playlist no tiene canciones.</p>
          <button v-if="isOwner" @click="openAddSongsModal" class="btn-add-songs">
            + Agregar canciones
          </button>
        </div>
      </div>
    </div>

    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal modal-large">
        <div class="modal-header">
          <h2>Agregar canciones</h2>
          <button @click="showAddModal = false" class="btn-close">✕</button>
        </div>

        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar canciones..."
          class="search-input"
        />

        <div class="available-songs">
          <div v-if="loadingAllSongs" class="loading">Cargando canciones...</div>

          <div
            v-for="song in filteredSongs"
            :key="song.id"
            class="available-song-row"
            :class="{ 'already-added': isSongInPlaylist(song.id) }"
          >
            <div class="available-song-info">
              <img
                :src="song.cover_url || 'https://picsum.photos/seed/' + song.id + '/40'"
                class="song-cover"
              />
              <div>
                <p class="song-name">{{ song.title }}</p>
                <p class="song-artist">{{ song.artist }}</p>
              </div>
            </div>

            <div class="available-song-duration">
              {{ formatDuration(song.duration) }}
            </div>

            <button
              v-if="!isSongInPlaylist(song.id)"
              @click="handleAddSong(song)"
              :disabled="addingSongId === song.id"
              class="btn-add"
            >
              {{ addingSongId === song.id ? '...' : '+ Agregar' }}
            </button>
            <span v-else class="already-added-label">✓ Agregada</span>
          </div>

          <div v-if="filteredSongs.length === 0 && !loadingAllSongs" class="empty">
            No se encontraron canciones.
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRemoveModal" class="modal-overlay" @click.self="showRemoveModal = false">
      <div class="modal">
        <h2>Quitar canción</h2>
        <p class="delete-warning">
          ¿Quitar <strong>{{ songToRemove?.title }}</strong> de esta playlist?
        </p>
        <div class="modal-buttons">
          <button @click="showRemoveModal = false" class="btn-cancel">Cancelar</button>
          <button @click="handleRemoveSong" :disabled="removing" class="btn-danger">
            {{ removing ? 'Quitando...' : 'Quitar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { usePlayerStore } from '../stores/playerStore'
import { playlistService } from '../api/playlistService'
import { songService } from '../api/songService'

const route = useRoute()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const playlist = ref(null)
const loading = ref(true)
const error = ref('')

const songs = computed(() => {
  if (!playlist.value?.playlist_songs) return []
  return [...playlist.value.playlist_songs].sort((a, b) => a.position - b.position)
})

const isOwner = computed(() => {
  return playlist.value?.owner_id === authStore.user?.id
})

const showAddModal = ref(false)
const allSongs = ref([])      
const loadingAllSongs = ref(false)
const searchQuery = ref('')
const addingSongId = ref(null)  

const filteredSongs = computed(() => {
  if (!searchQuery.value) return allSongs.value
  const q = searchQuery.value.toLowerCase()
  return allSongs.value.filter(
    s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
  )
})

function isSongInPlaylist(songId) {
  return songs.value.some(item => item.songs.id === songId)
}

const showRemoveModal = ref(false)
const songToRemove = ref(null)
const removing = ref(false)

onMounted(async () => {
  await loadPlaylist()
})

async function loadPlaylist() {
  try {
    loading.value = true
    const response = await playlistService.getById(route.params.id)
    playlist.value = response.data
  } catch (err) {
    error.value = 'Error al cargar la playlist'
  } finally {
    loading.value = false
  }
}

async function openAddSongsModal() {
  showAddModal.value = true
  searchQuery.value = ''

  if (allSongs.value.length === 0) {
    loadingAllSongs.value = true
    try {
      const response = await songService.getAll()
      allSongs.value = response.data
    } catch (err) {
      console.error('Error al cargar canciones')
    } finally {
      loadingAllSongs.value = false
    }
  }
}

async function handleAddSong(song) {
  addingSongId.value = song.id

  try {
    await playlistService.addSong(playlist.value.id, song.id)
    // Recargamos la playlist para que aparezca la canción nueva
    await loadPlaylist()
  } catch (err) {
    console.error('Error al agregar canción:', err)
  } finally {
    addingSongId.value = null
  }
}

function confirmRemove(song) {
  songToRemove.value = song
  showRemoveModal.value = true
}

async function handleRemoveSong() {
  if (!songToRemove.value) return

  removing.value = true

  try {
    await playlistService.removeSong(playlist.value.id, songToRemove.value.id)
    showRemoveModal.value = false
    songToRemove.value = null
    await loadPlaylist()
  } catch (err) {
    console.error('Error al quitar canción:', err)
  } finally {
    removing.value = false
  }
}

function playSong(song) {
  const queue = songs.value.map(item => item.songs)
  playerStore.playSong(song, queue)
}

function playAll() {
  if (songs.value.length > 0) {
    playSong(songs.value[0].songs)
  }
}

function formatDuration(seconds) {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.playlist-view { color: #ffffff; }

.playlist-header {
  display: flex;
  gap: 32px;
  margin-bottom: 40px;
  align-items: flex-end;
}

.playlist-cover {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.playlist-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-type {
  color: #888;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
}

.playlist-info h1 {
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  margin: 4px 0;
}

.playlist-desc { color: #aaa; font-size: 14px; }

.playlist-meta {
  display: flex;
  gap: 8px;
  color: #888;
  font-size: 14px;
}

.header-buttons {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.btn-play-all {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  border: none;
  border-radius: 30px;
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  padding: 12px 32px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-play-all:hover { opacity: 0.9; }

.btn-add-songs {
  background: none;
  border: 1px solid #a855f7;
  border-radius: 30px;
  color: #a855f7;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-songs:hover {
  background-color: #a855f7;
  color: #ffffff;
}

.songs-list {
  background-color: #111111;
  border-radius: 12px;
  padding: 16px;
}

.songs-header {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 80px 40px;
  padding: 8px 12px;
  color: #888;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
}

.songs-divider {
  border-bottom: 1px solid #2a2a2a;
  margin-bottom: 8px;
}

.song-row {
  display: grid;
  grid-template-columns: 40px 1fr 1fr 80px 40px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  align-items: center;
  transition: background-color 0.15s;
}

.song-row:hover { background-color: #1a1a1a; }

.song-row.active { background-color: #1e1030; }

.song-row.active .col-title span,
.song-row.active .playing-icon { color: #a855f7; }

.col-num { color: #888; font-size: 14px; text-align: center; }
.playing-icon { color: #a855f7; font-size: 16px; }

.col-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.song-cover {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  object-fit: cover;
}

.col-artist { color: #888; font-size: 14px; }
.col-duration { color: #888; font-size: 14px; }

.col-remove {
  display: flex;
  justify-content: center;
}

.btn-remove {
  background: none;
  border: none;
  color: #444;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-remove:hover { color: #ef4444; }

.loading, .empty, .error-msg {
  text-align: center;
  padding: 60px;
  color: #888;
}

.error-msg { color: #ef4444; }
.empty button { margin-top: 16px; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal {
  background-color: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 440px;
}

.modal-large {
  max-width: 580px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover { color: #ffffff; }

.search-input {
  width: 100%;
  background-color: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  padding: 10px 14px;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #a855f7;
}

.available-songs {
  overflow-y: auto;
  flex: 1;
  max-height: 400px;
}

.available-song-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 8px;
  transition: background-color 0.15s;
}

.available-song-row:hover { background-color: #222; }

.available-song-row.already-added { opacity: 0.5; }

.available-song-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.song-name {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.song-artist {
  color: #888;
  font-size: 12px;
  margin-top: 2px;
}

.available-song-duration {
  color: #888;
  font-size: 13px;
  min-width: 40px;
  text-align: right;
}

.btn-add {
  background: none;
  border: 1px solid #a855f7;
  border-radius: 6px;
  color: #a855f7;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-add:hover {
  background-color: #a855f7;
  color: #ffffff;
}

.btn-add:disabled { opacity: 0.5; cursor: not-allowed; }

.already-added-label {
  color: #a855f7;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.modal h2 { font-size: 20px; font-weight: 700; margin-bottom: 24px; }

.delete-warning {
  color: #aaa;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.delete-warning strong { color: #ffffff; }

.modal-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel {
  background: none;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #888;
  font-size: 14px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover { border-color: #888; color: #ffffff; }

.btn-danger {
  background-color: #ef4444;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-danger:hover { opacity: 0.9; }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
</style>