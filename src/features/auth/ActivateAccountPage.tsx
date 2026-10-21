import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Button } from '../../components/ui/button'
import { FieldError, Input } from '../../components/ui/input'
import { ApiError } from '../../lib/api/client'
import { activateFormSchema, type ActivateFormValues } from './api'
import { activate } from './auth-api'

export function ActivateAccountPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (token) window.history.replaceState(null, '', window.location.pathname)
  }, [token])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivateFormValues>({
    resolver: zodResolver(activateFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  if (!token) {
    return (
      <main className="auth-page" aria-labelledby="activate-title">
        <section className="auth-card">
          <h1 id="activate-title">Convite inválido</h1>
          <p className="auth-copy">O link de ativação está incompleto ou expirou.</p>
          <Link className="auth-link" to="/entrar">
            Ir para o login
          </Link>
        </section>
      </main>
    )
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await activate(token, values.password)
      navigate('/entrar', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof ApiError && error.status === 429
          ? 'Muitas tentativas. Aguarde um instante e tente novamente.'
          : 'Convite inválido ou expirado.',
      )
    }
  })

  return (
    <main className="auth-page" aria-labelledby="activate-title">
      <form className="auth-card" onSubmit={onSubmit} noValidate>
        <p className="eyebrow">Ativação de conta</p>
        <h1 id="activate-title">Defina sua senha</h1>
        <p className="auth-copy">
          Crie uma senha privada com pelo menos 12 caracteres. Este link só pode
          ser usado uma vez.
        </p>

        <label className="auth-field" htmlFor="password">
          <span>Nova senha</span>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          <FieldError message={errors.password?.message} />
        </label>

        <label className="auth-field" htmlFor="confirmPassword">
          <span>Confirmar senha</span>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
          <FieldError message={errors.confirmPassword?.message} />
        </label>

        {formError ? (
          <p role="alert" className="auth-form-error">
            {formError}
          </p>
        ) : null}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Ativando…' : 'Ativar conta'}
        </Button>
      </form>
    </main>
  )
}
