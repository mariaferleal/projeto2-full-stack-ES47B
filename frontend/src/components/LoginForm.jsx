import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { useAuth } from '../contexts/AuthContext'

const schema = yup.object({
  email: yup.string().email('Informe um e-mail valido.').required('E-mail obrigatorio.'),
  password: yup.string().required('Senha obrigatoria.'),
})

function LoginForm() {
  const { login, authError, authLoading } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: 'rick@citadel.com',
      password: 'portal123',
    },
  })

  async function onSubmit(values) {
    await login(values).catch(() => {})
  }

  return (
    <section className="panel login-panel">
      <div>
        <p className="eyebrow">Acesso restrito</p>
        <h2>Entre para buscar e inserir personagens</h2>
        <p className="muted">
          Usuario de teste: <strong>rick@citadel.com</strong> / <strong>portal123</strong>
        </p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        <label>
          E-mail
          <input type="email" {...register('email')} />
          {errors.email && <small>{errors.email.message}</small>}
        </label>

        <label>
          Senha
          <input type="password" {...register('password')} />
          {errors.password && <small>{errors.password.message}</small>}
        </label>

        {authError && <p className="form-error">{authError}</p>}

        <button type="submit" disabled={authLoading}>
          {authLoading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </section>
  )
}

export default LoginForm
