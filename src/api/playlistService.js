import api from './axios'

export const playlistService = {
  getAll() {
    return api.get('/playlists')
  },

  getById(id) {
    return api.get(`/playlists/${id}`)
  },

  create(playlistData) {
    return api.post('/playlists', playlistData)
  },

  update(id, playlistData) {
    return api.put(`/playlists/${id}`, playlistData)
  },

  delete(id) {
    return api.delete(`/playlists/${id}`)
  },

  addSong(playlistId, songId) {
    return api.post(`/playlists/${playlistId}/songs/${songId}`)
  },

  removeSong(playlistId, songId) {
    return api.delete(`/playlists/${playlistId}/songs/${songId}`)
  }
}