import { z } from 'zod'

export const createPlaylistSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'Máximo 100 caracteres'),

  description: z
    .string()
    .max(500, 'Máximo 500 caracteres')
    .optional(), 

  is_public: z
    .boolean()
    .optional()
    .default(true) 
})

export const updatePlaylistSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(100)
    .optional(),

  description: z
    .string()
    .max(500)
    .optional(),

  is_public: z
    .boolean()
    .optional()
})