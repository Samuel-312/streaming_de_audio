import jwt from 'jsonwebtoken'

// Un middleware es una función que se ejecuta ENTRE que llega la petición
// y que el controller la procesa. Recibe (req, res, next)
// next() significa "continúa al siguiente paso"

export const verifyToken = (req, res, next) => {
  // El token viene en el header Authorization con formato: "Bearer eltoken123"
  const authHeader = req.headers['authorization']

  // Si no hay header de autorización, rechazamos la petición
  if (!authHeader) {
    return res.status(401).json({ error: 'Token requerido' })
  }

  // Separamos "Bearer" del token real con split(' ')[1]
  const token = authHeader.split(' ')[1]

  try {
    // jwt.verify valida el token con la clave secreta
    // Si el token es válido, devuelve el payload que guardamos al crearlo
    // Si es inválido o expiró, lanza un error
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Guardamos los datos del usuario en req para usarlos en el controller
    req.user = decoded

    // Continuamos al controller
    next()

  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

// Middleware para verificar roles
// Recibe los roles permitidos y devuelve una función middleware
export const verifyRole = (...roles) => {
  return (req, res, next) => {
    // req.user viene del middleware verifyToken que se ejecutó antes
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tienes permisos' })
    }
    next()
  }
}