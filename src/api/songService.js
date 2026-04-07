import api from './axios'

export const songService = {
  getAll() {
    return api.get('/songs')
  },

  getById(id) {
    return api.get(`/songs/${id}`)
  },

  create(songData) {
    return api.post('/songs', songData)
  },

  delete(id) {
    return api.delete(`/songs/${id}`)
  }
}