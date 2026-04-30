import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import playlistRoutes from './routes/playlistRoutes.js'
import songRoutes from './routes/songRoutes.js'
import { errorHandler } from './middlewares/errorMiddleware.js'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/playlists', playlistRoutes)
app.use('/api/songs', songRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sonic API funcionando' })
})

app.use(errorHandler)

export default app