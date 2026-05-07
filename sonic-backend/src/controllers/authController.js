import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'
import { registerSchema, loginSchema } from '../schemas/authSchema.js'

export const register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.errors.map(e => e.message)
      })
    }

    const { username, email, password } = validation.data


    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)


    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ username, email, password: hashedPassword })
      .select()
      .single()

    if (error) throw error


    const token = jwt.sign(
      { id: newUser.id, role: newUser.role }, 
      process.env.JWT_SECRET,                 
      { expiresIn: '7d' }                     
    )

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    })

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.errors.map(e => e.message)
      })
    }

    const { email, password } = validation.data


    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }


    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}