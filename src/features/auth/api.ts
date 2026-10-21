import { z } from 'zod'

export const userRoleSchema = z.enum(['ADMIN', 'USER'])
export const userStatusSchema = z.enum(['INVITED', 'ACTIVE', 'BLOCKED'])

export const sessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: userRoleSchema,
  status: userStatusSchema,
  passwordChangedAt: z.string().nullable(),
  createdAt: z.string(),
})

export const loginResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.string(),
  user: sessionUserSchema,
})

export const meResponseSchema = z.object({ user: sessionUserSchema })

export const activateResponseSchema = z.object({ user: sessionUserSchema })

export const loginFormSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe a senha.'),
})

export const activateFormSchema = z
  .object({
    password: z.string().min(12, 'A senha precisa ter ao menos 12 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export type SessionUser = z.infer<typeof sessionUserSchema>
export type LoginFormValues = z.infer<typeof loginFormSchema>
export type ActivateFormValues = z.infer<typeof activateFormSchema>
