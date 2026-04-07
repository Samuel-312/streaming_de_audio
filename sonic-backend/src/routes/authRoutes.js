import { Router } from 'express'
import { register, login } from '../controllers/authController.js'

// Router es como una mini-app de Express para agrupar rutas relacionadas
const router = Router()

// POST /api/auth/register → llama al controller register
router.post('/register', register)

// POST /api/auth/login → llama al controller login
router.post('/login', login)

export default router