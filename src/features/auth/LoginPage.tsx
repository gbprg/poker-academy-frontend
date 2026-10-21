import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { Button } from '../../components/ui/button'
import { FieldError, Input } from '../../components/ui/input'
import { ApiError } from '../../lib/api/client'
import { loginFormSchema, type LoginFormValues } from './api'
import { useAuth } from './auth-context'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const redirect = params.get('redirect') ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isAuthenticated) return <Navigate to={redirect} replace />

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values.email, values.password)
      navigate(redirect, { replace: true })
    } catch (error) {
      setFormError(
        error instanceof ApiError && error.status === 429
          ? 'Muitas tentativas. Aguarde um instante e tente novamente.'
          : 'Credenciais inválidas.',
      )
    }
  })

  return (
    <main className="auth-page" aria-labelledby="login-title">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <p className="eyebrow">Acesso restrito</p>
        <h1 id="login-title">Entrar</h1>
        <p className="auth-copy">
          O acesso é privado. As contas são criadas por um administrador e
          ativadas por convite.
        </p>

        <label className="auth-field" htmlFor="email">
          <span>E-mail</span>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </label>

        <label className="auth-field" htmlFor="password">
          <span>Senha</span>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </label>

        {formError ? (
          <p role="alert" className="auth-form-error">
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>

        <Link className="auth-link" to="/">
          Voltar ao início
        </Link>
      </form>
    </main>
  )
}
