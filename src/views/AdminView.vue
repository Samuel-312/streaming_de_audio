<template>
  <div class="admin-view">

    <div class="view-header">
      <div>
        <h1>Panel Admin</h1>
        <p>Gestiona las canciones del sistema</p>
      </div>
      <button @click="openCreateModal" class="btn-create">
        + Nueva Canción
      </button>
    </div>

    
    <div v-if="loading" class="loading">Cargando canciones :)</div>

    
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    
    <div v-else class="songs-table">
      <div class="table-header">
        <span class="col-title">Titulo</span>
        <span class="col-artist">Artista</span>
        <span class="col-duration">Duración</span>
        <span class="col-actions">Eliminar</span>
      </div>

      <div class="table-divider"></div>

      <div
        v-for="song in songs"
        :key="song.id"
        class="table-row"
      >
        <div class="col-title">
          <img
            :src="song.cover_url || 'https://picsum.photos/seed/' + song.id + '/40'"
            class="song-cover"
          />
          <span>{{ song.title }}</span>
        </div>
        <span class="col-artist">{{ song.artist }}</span>
        <span class="col-duration">{{ formatDuration(song.duration) }}</span>
        <div class="col-actions">
          <button @click="confirmDelete(song)" class="btn-delete">
            🗑 Eliminar
          </button>
        </div>
      </div>

      <div v-if="songs.length === 0" class="empty">
        No hay canciones en el sistema.
      </div>
    </div>

    
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>Nueva Canción</h2>

        <div class="form-group">
          <label>TÍTULO</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Nombre de la canción"
            :class="{ error: formErrors.title }"
          />
          <span v-if="formErrors.title" class="error-small">{{ formErrors.title }}</span>
        </div>

        <div class="form-group">
          <label>ARTISTA</label>
          <input
            v-model="form.artist"
            type="text"
            placeholder="Nombre del artista"
            :class="{ error: formErrors.artist }"
          />
          <span v-if="formErrors.artist" class="error-small">{{ formErrors.artist }}</span>
        </div>

        <div class="form-group">
          <label>URL DEL AUDIO</label>
          <input
            v-model="form.audio_url"
            type="text"
            placeholder="https://..."
            :class="{ error: formErrors.audio_url }"
          />
          <span v-if="formErrors.audio_url" class="error-small">{{ formErrors.audio_url }}</span>
        </div>

        <div class="form-group">
          <label>URL DE LA PORTADA (opcional)</label>
          <input
            v-model="form.cover_url"
            type="text"
            placeholder="https://..."
          />
        </div>

        <div class="form-group">
          <label>DURACIÓN (segundos)</label>
          <input
            v-model.number="form.duration"
            type="number"
            placeholder="222"
          />
        </div>

        <div v-if="modalError" class="server-error">{{ modalError }}</div>

        <div class="modal-buttons">
          <button @click="closeModal" class="btn-cancel">Cancelar</button>
          <button @click="handleCreate" :disabled="creating" class="btn-confirm">
            {{ creating ? 'Creando...' : 'Crear Canción' }}
          </button>
        </div>
      </div>
    </div>

    
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal">
        <h2>Eliminar Canción</h2>
        <p class="delete-warning">
          ¿Eliminar <strong>{{ songToDelete?.title }}</strong>?
          Esto la quitará de todas las playlists donde esté.
        </p>
        <div class="modal-buttons">
          <button @click="showDeleteModal = false" class="btn-cancel">Cancelar</button>
          <button @click="handleDelete" :disabled="deleting" class="btn-danger">
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { songService } from '../api/songService'

const router = useRouter()
const authStore = useAuthStore()


if (!authStore.isAdmin) {
  router.push({ name: 'Home' })
}

const songs = ref([])
const loading = ref(true)
const error = ref('')

const showModal = ref(false)
const creating = ref(false)
const modalError = ref('')
const formErrors = ref({})
const form = ref({
  title: '',
  artist: '',
  audio_url: '',
  cover_url: '',
  duration: null
})

const showDeleteModal = ref(false)
const deleting = ref(false)
const songToDelete = ref(null)

onMounted(async () => {
  await loadSongs()
})

async function loadSongs() {
  try {
    loading.value = true
    const response = await songService.getAll()
    songs.value = response.data
  } catch (err) {
    error.value = 'Error al cargar las canciones'
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  form.value = { title: '', artist: '', audio_url: '', cover_url: '', duration: null }
  formErrors.value = {}
  modalError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function validate() {
  formErrors.value = {}

  if (!form.value.title) formErrors.value.title = 'El título es requerido'
  if (!form.value.artist) formErrors.value.artist = 'El artista es requerido'
  if (!form.value.audio_url) {
    formErrors.value.audio_url = 'La URL del audio es requerida'
  } else if (!form.value.audio_url.startsWith('http')) {
    formErrors.value.audio_url = 'Debe ser una URL válida'
  }

  return Object.keys(formErrors.value).length === 0
}

async function handleCreate() {
  if (!validate()) return

  creating.value = true
  modalError.value = ''

  try {
    
    const payload = { ...form.value }
    if (!payload.cover_url) delete payload.cover_url
    if (!payload.duration) delete payload.duration

    await songService.create(payload)
    closeModal()
    await loadSongs()
  } catch (err) {
    modalError.value = err.response?.data?.error || 'Error al crear la canción'
  } finally {
    creating.value = false
  }
}

function confirmDelete(song) {
  songToDelete.value = song
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!songToDelete.value) return

  deleting.value = true

  try {
    await songService.delete(songToDelete.value.id)
    showDeleteModal.value = false
    songToDelete.value = null
    await loadSongs()
  } catch (err) {
    console.error('Error al eliminar:', err)
  } finally {
    deleting.value = false
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
.admin-view {
  color: #ffffff;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.view-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.view-header p {
  color: #888;
  font-size: 14px;
}

.btn-create {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-create:hover { opacity: 0.9; }

.songs-table {
  background-color: #111111;
  border-radius: 12px;
  padding: 16px;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 100px 120px;
  padding: 8px 12px;
  color: #888;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
}

.table-divider {
  border-bottom: 1px solid #2a2a2a;
  margin-bottom: 8px;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 100px 120px;
  padding: 10px 12px;
  border-radius: 8px;
  align-items: center;
  transition: background-color 0.15s;
}

.table-row:hover { background-color: #1a1a1a; }

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

.col-artist {
  color: #888;
  font-size: 14px;
}

.col-duration {
  color: #888;
  font-size: 14px;
}

.col-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-delete {
  background: none;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  color: #888;
  font-size: 12px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.loading, .empty, .error-msg {
  text-align: center;
  padding: 60px;
  color: #888;
}

.error-msg { color: #ef4444; }


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
  max-width: 480px;
}

.modal h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
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
  padding: 10px 14px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #a855f7;
}

.form-group input.error { border-color: #ef4444; }

.error-small {
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
}

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

.btn-cancel:hover {
  border-color: #888;
  color: #ffffff;
}

.btn-confirm {
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-warning {
  color: #aaa;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.delete-warning strong { color: #ffffff; }

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