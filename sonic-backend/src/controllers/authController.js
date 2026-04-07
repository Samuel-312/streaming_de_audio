import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase.js'
import { registerSchema, loginSchema } from '../schemas/authSchema.js'

// REGISTRO
export const register = async (req, res) => {
  try {
    // req.body contiene los datos que mandó el usuario (username, email, password)
    // safeParse valida esos datos contra el schema sin lanzar errores
    // si algo falla, success será false y error tendrá los detalles
    const validation = registerSchema.safeParse(req.body)

    if (!validation.success) {
      // Extraemos los mensajes de error de Zod y los devolvemos
      return res.status(400).json({
        error: validation.error.errors.map(e => e.message)
      })
    }

    // Si la validación pasó, extraemos los datos limpios
    const { username, email, password } = validation.data

    // Verificamos si ya existe un usuario con ese email en la base de datos
    // .from('users') → selecciona la tabla users
    // .select('id') → solo necesitamos saber si existe, no todos sus datos
    // .eq('email', email) → donde email sea igual al que nos mandaron
    // .single() → esperamos un solo resultado
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    // bcrypt.hash convierte la contraseña en un hash irreversible
    // el 10 es el "salt rounds": cuántas veces procesa el hash
    // más alto = más seguro pero más lento. 10 es el estándar
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insertamos el nuevo usuario en la base de datos
    // .insert() recibe un objeto con los datos a insertar
    // .select().single() nos devuelve el registro recién creado
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({ username, email, password: hashedPassword })
      .select()
      .single()

    if (error) throw error

    // Creamos el token JWT
    // jwt.sign recibe: el payload (datos que guarda el token),
    // la clave secreta, y opciones como la expiración
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role }, // Datos dentro del token
      process.env.JWT_SECRET,                  // Clave para firmarlo
      { expiresIn: '7d' }                      // Expira en 7 días
    )

    // Respondemos con el token y los datos del usuario (sin la contraseña)
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
    // Si algo falla inesperadamente, respondemos con error 500
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// LOGIN
export const login = async (req, res) => {
  try {
    // Validamos los datos de entrada igual que en register
    const validation = loginSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        error: validation.error.errors.map(e => e.message)
      })
    }

    const { email, password } = validation.data

    // Buscamos el usuario por email
    // Esta vez sí necesitamos todos los datos, incluido el password hasheado
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    // Si no existe el usuario, devolvemos el mismo mensaje que si la contraseña
    // es incorrecta. Esto es seguridad: no revelamos si el email existe o no
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    // bcrypt.compare compara la contraseña en texto plano con el hash guardado
    // devuelve true si coinciden, false si no
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