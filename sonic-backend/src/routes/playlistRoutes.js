import { Router } from 'express'
import {
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist
} from '../controllers/playlistController.js'
import { addSongToPlaylist, removeSongFromPlaylist } from '../controllers/songController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = Router()

// Rutas públicas
router.get('/', getPlaylists)
router.get('/:id', getPlaylistById)

// Rutas protegidas
router.post('/', verifyToken, createPlaylist)
router.put('/:id', verifyToken, updatePlaylist)
router.delete('/:id', verifyToken, deletePlaylist)

// Canciones dentro de playlist
router.post('/:playlistId/songs/:songId', verifyToken, addSongToPlaylist)
router.delete('/:playlistId/songs/:songId', verifyToken, removeSongFromPlaylist)

export default router