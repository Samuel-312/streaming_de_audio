import api from './axios'

export const playlistService = {
  // Trae todas las playlists públicas
  getAll() {
    return api.get('/playlists')
  },

  // Trae una playlist por ID con sus canciones
  getById(id) {
    return api.get(`/playlists/${id}`)
  },

  // Crea una nueva playlist
  create(playlistData) {
    return api.post('/playlists', playlistData)
  },

  // Actualiza una playlist
  update(id, playlistData) {
    return api.put(`/playlists/${id}`, playlistData)
  },

  // Elimina una playlist
  delete(id) {
    return api.delete(`/playlists/${id}`)
  },

  // Agrega una canción a una playlist
  addSong(playlistId, songId) {
    return api.post(`/playlists/${playlistId}/songs/${songId}`)
  },

  // Quita una canción de una playlist
  removeSong(playlistId, songId) {
    return api.delete(`/playlists/${playlistId}/songs/${songId}`)
  }
}