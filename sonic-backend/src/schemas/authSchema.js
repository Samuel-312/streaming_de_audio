import { z } from 'zod'

export const registerSchema = z.object({
  username: z
    .string()                         
    .min(3, 'Mínimo 3 caracteres')     
    .max(50, 'Máximo 50 caracteres'),  

  email: z
    .string()
    .email('Email inválido'),          

  password: z
    .string()
    .min(6, 'Mínimo 6 caracteres'),   
})

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido'),

  password: z
    .string()
    .min(1, 'La contraseña es requerida'), 
})