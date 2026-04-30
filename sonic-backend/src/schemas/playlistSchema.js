import { z } from 'zod'

export const createPlaylistSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'Máximo 100 caracteres'),

  description: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional(), // Este campo no es obligatorio

  is_public: z
    .boolean()
    .optional()
    .default(true) // Si no lo mandan, por defecto es pública
})

export const updatePlaylistSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(100)
    .optional(), // En el update todos los campos son opcionales

  description: z
    .string()
    .max(500)
    .optional(),

  is_public: z
    .boolean()
    .optional()
})