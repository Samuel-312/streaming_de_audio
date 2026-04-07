// Este middleware especial recibe 4 parámetros (err, req, res, next)
// Express lo identifica automáticamente como manejador de errores
// por eso SIEMPRE debe tener los 4 parámetros aunque no uses next
export const errorHandler = (err, req, res, next) => {
  // Imprimimos el error en consola para debugging
  console.error('Error:', err.message)

  // Si el error tiene un statusCode definido lo usamos,
  // si no, usamos 500 (error interno del servidor)
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
    // Solo mostramos el stack trace en desarrollo, nunca en producción
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
} 