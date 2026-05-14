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

router.get('/', getSongs)
router.get('/:id', getSongById)

router.post('/', verifyToken, verifyRole('admin'), createSong)
router.delete('/:id', verifyToken, verifyRole('admin'), deleteSong)


export default router