import { Router } from 'express'
import {
  getSongs,
  getSongById,
  createSong,
  deleteSong,
  addSongToPlaylist,
  removeSongFromPlaylist
} from '../controllers/songController.js'
import { verifyToken, verifyRole } from '../middlewares/authMiddleware.js'

const router = Router()

// Públicas
router.get('/', getSongs)
router.get('/:id', getSongById)

// Solo admin puede crear o eliminar canciones
// verifyToken verifica que esté logueado
// verifyRole('admin') verifica que sea admin
router.post('/', verifyToken, verifyRole('admin'), createSong)
router.delete('/:id', verifyToken, verifyRole('admin'), deleteSong)


export default router