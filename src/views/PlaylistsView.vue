<template>
  <div class="playlists-view">

    <!-- Header -->
    <div class="view-header">
      <div>
        <h1>Mis Playlists</h1>
        <p>Gestiona tus playlists personales</p>
      </div>
      <button @click="openCreateModal" class="btn-create">
        + Nueva Playlist
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Cargando...</div>

    <!-- Error -->
    <div v-else-if="error" class="error-msg">{{ error }}</div>

    <!-- Grid de playlists -->
    <div v-else>
      <div class="playlists-grid">
        <div
          v-for="playlist in myPlaylists"
          :key="playlist.id"
          class="playlist-card"
        >
          <!-- Imagen clickeable para ir al detalle -->
          <img
            :src="playlist.cover_url || 'https://picsum.photos/seed/' + playlist.id + '/200'"
            class="card-cover"
            @click="goToPlaylist(playlist.id)"
          />

          <div class="card-info">
            <div class="card-text" @click="goToPlaylist(playlist.id)">
              <h3>{{ playlist.title }}</h3>
              <p>{{ playlist.is_public ? 'Pública' : 'Privada' }}</p>
            </div>

            <!-- Botón eliminar -->
            <button
              @click="confirmDelete(playlist)"
              class="btn-delete"
              title="Eliminar playlist"
            > 
              🗑
            </button>
          </div>
        </div>
      </div>

      <!-- Sin playlists -->
      <div v-if="myPlaylists.length === 0" class="empty">
        <p>No tienes playlists aún.</p>
        <button @click="openCreateModal" class="btn-create">
          Crea tu primera playlist
        </button>
      </div>
    </div>

    <!-- Modal para crear playlist -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h2>Nueva Playlist</h2>

        <div class="form-group">
          <label>TÍTULO</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="Mi playlist..."
            :class="{ error: formErrors.title }"
          />
          <span v-if="formErrors.title" class="error-msg-small">{{ formErrors.title }}</span>
        </div>

        <div class="form-group">
          <label>DESCRIPCIÓN</label>
          <textarea
            v-model="form.description"
            placeholder="Describe tu playlist..."
            rows="3"
          ></textarea>
        </div>

        <div class="form-group checkbox-group">
          <input
            type="checkbox"
            id="is_public"
            v-model="form.is_public"
          />
          <label for="is_public">Playlist pública</label>
        </div>

        <div v-if="modalError" class="server-error">{{ modalError }}</div>

        <div class="modal-buttons">
          <button @click="closeModal" class="btn-cancel">Cancelar</button>
          <button @click="handleCreate" :disabled="creating" class="btn-confirm">
            {{ creating ? 'Creando...' : 'Crear Playlist' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal">
        <h2>Eliminar Playlist</h2>
        <p class="delete-warning">
          ¿Estás seguro de que quieres eliminar
          <strong>{{ playlistToDelete?.title }}</strong>?
          Esta acción no se puede deshacer.
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
import { playlistService } from '../api/playlistService'

const router = useRouter()
const authStore = useAuthStore()

const myPlaylists = ref([])
const loading = ref(true)
const error = ref('')

// Estado del modal de creación
const showModal = ref(false)
const creating = ref(false)
const modalError = ref('')
const formErrors = ref({})
const form = ref({
  title: '',
  description: '',
  is_public: true
})

// Estado del modal de eliminación
const showDeleteModal = ref(false)
const deleting = ref(false)
const playlistToDelete = ref(null)

onMounted(async () => {
  await loadPlaylists()
})

async function loadPlaylists() {
  try {
    loading.value = true
    const response = await playlistService.getAll()

    // Filtramos solo las playlists del usuario logueado
    myPlaylists.value = response.data.filter(
      p => p.owner_id === authStore.user.id
    )
  } catch (err) {
    error.value = 'Error al cargar las playlists'
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  // Reseteamos el formulario cada vez que abrimos el modal
  form.value = { title: '', description: '', is_public: true }
  formErrors.value = {}
  modalError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function validate() {
  formErrors.value = {}
  if (!form.value.title || form.value.title.trim().length < 1) {
    formErrors.value.title = 'El título es requerido'
  }
  return Object.keys(formErrors.value).length === 0
}

async function handleCreate() {
  if (!validate()) return

  creating.value = true
  modalError.value = ''

  try {
    await playlistService.create(form.value)

    // Cerramos el modal y recargamos la lista
    closeModal()
    await loadPlaylists()
  } catch (err) {
    modalError.value = err.response?.data?.error || 'Error al crear la playlist'
  } finally {
    creating.value = false
  }
}

function confirmDelete(playlist) {
  // Guardamos cuál playlist vamos a borrar y mostramos el modal
  playlistToDelete.value = playlist
  showDeleteModal.value = true
}

async function handleDelete() {
  if (!playlistToDelete.value) return

  deleting.value = true

  try {
    await playlistService.delete(playlistToDelete.value.id)
    showDeleteModal.value = false
    playlistToDelete.value = null

    // Recargamos la lista
    await loadPlaylists()
  } catch (err) {
    console.error('Error al eliminar:', err)
  } finally {
    deleting.value = false
  }
}

function goToPlaylist(id) {
  router.push({ name: 'Playlist', params: { id } })
}
</script>

<style scoped>
.playlists-view {
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

.btn-create:hover {
  opacity: 0.9;
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
  transition: transform 0.2s;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.card-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  cursor: pointer;
}

.card-info {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-text {
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.card-text h3 {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-text p {
  color: #888;
  font-size: 12px;
  margin-top: 2px;
}

.btn-delete {
  background: red;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
  flex-shrink: 0;
}

.btn-delete:hover {
  background-color: #2a2a2a;
}

.loading, .empty {
  text-align: center;
  padding: 60px;
  color: #888;
}

.empty button {
  margin-top: 16px;
}

.error-msg {
  color: #ef4444;
  text-align: center;
  padding: 40px;
}

/* Modales */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
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

.modal h2 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
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

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  background-color: #0f0f0f;
  border: 1px solid #2a2a2a;
  border-radius: 8px;
  color: #ffffff;
  padding: 12px 16px;
  font-size: 14px;
  box-sizing: border-box;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #a855f7;
}

.form-group input[type="text"].error {
  border-color: #ef4444;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-group label {
  margin-bottom: 0;
  color: #ffffff;
  font-size: 14px;
  letter-spacing: 0;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  accent-color: #a855f7;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.error-msg-small {
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

.delete-warning strong {
  color: #ffffff;
}

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

.btn-danger:hover {
  opacity: 0.9;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>