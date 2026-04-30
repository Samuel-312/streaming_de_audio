import { z } from 'zod'

export const createSongSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .max(100, 'Máximo 100 caracteres'),

  artist: z
    .string()
    .min(1, 'El artista es requerido')
    .max(100, 'Máximo 100 caracteres'),

  duration: z
    .number()
    .int()          // Debe ser entero
    .positive()     // Debe ser positivo
    .optional(),    // No obligatorio por ahora

  audio_url: z
    .string()
    .url('Debe ser una URL válida'), // Debe ser una URL válida

  cover_url: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
})