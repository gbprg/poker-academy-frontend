import { Activity, BookOpen, LogOut, ShieldCheck, Spade } from 'lucide-react'
import { Link, Route, Routes } from 'react-router'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { StrategySourcesAdminPage } from './features/admin/strategy-sources/StrategySourcesAdminPage'
import { ActivateAccountPage } from './features/auth/ActivateAccountPage'
import { useAuth } from './features/auth/auth-context'
import { LoginPage } from './features/auth/LoginPage'
import { RequireAdmin } from './features/auth/RequireAdmin'
import { RequireAuth } from './features/auth/RequireAuth'
import { PostflopStreetExplorerPage } from './features/situations/postflop/PostflopStreetExplorerPage'
import { RangesPreflopPage } from './features/ranges/RangesPreflopPage'
import { SystemStatus } from './features/system/SystemStatus'
import { TrainingHistoryPage } from './features/training/TrainingHistoryPage'
import { TrainingPlayerPage } from './features/training/TrainingPlayerPage'

function LandingPage() {
  return (
    <main className="page-grid">
      <section className="hero-panel" aria-labelledby="hero-title">
        <p className="eyebrow">Estudo estruturado de No-Limit Hold'em</p>
        <h1 id="hero-title">Poker Academy</h1>
        <p className="hero-copy">
          Uma plataforma de treino em português, construída para explicar cada
          decisão sem atalhos e sem prometer resultados.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" to="/entrar">
            Entrar
          </Link>
          <span className="privacy-note">
            <ShieldCheck size={16} aria-hidden="true" /> Privacidade desde a base
          </span>
        </div>
      </section>

      <aside className="status-card" aria-label="Estado da plataforma">
        <div className="status-card__icon">
          <Activity size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="card-label">Infraestrutura</p>
          <SystemStatus />
        </div>
      </aside>

      <section className="principles" aria-label="Princípios do produto">
        <article>
          <BookOpen aria-hidden="true" />
          <h2>Aprender antes de decorar</h2>
          <p>Conceitos, prática deliberada e revisão do próprio processo.</p>
        </article>
        <article>
          <Spade aria-hidden="true" />
          <h2>Dados com procedência</h2>
          <p>Nenhum range, EV ou recomendação entra sem fonte validada.</p>
        </article>
      </section>
    </main>
  )
}

function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <main className="placeholder-page">
      <p className="eyebrow">Área autenticada</p>
      <h1>Olá, {user?.name}</h1>
      <p>
        Seu painel de treino está pronto para receber a jornada. Ainda não há
        conteúdo estratégico publicado, então nada aqui é apresentado como
        gabarito.
      </p>
      <Button variant="ghost" onClick={() => void logout()}>
        <LogOut size={16} aria-hidden="true" /> Sair
      </Button>
    </main>
  )
}
export { DashboardPage }

function App() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Poker Academy — início">
          <span className="brand-mark" aria-hidden="true">PA</span>
          <span>Poker Academy</span>
        </Link>
        <div className="topbar-actions">
          <Badge className="environment-badge">Foundation</Badge>
          {isAuthenticated ? (
            <>
              <Link className="primary-action" to="/ranges/preflop">
                Ranges
              </Link>
              <Link className="primary-action" to="/situacoes/postflop">
                Post-flop
              </Link>
              <Link className="primary-action" to="/historico">
                Histórico
              </Link>
              <Link
                to="/analises"
                className="rounded-md px-2 py-1 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-slate-100"
              >
                Análises
              </Link>
              <Link className="primary-action" to="/admin/fontes">
                Fontes estratégicas
              </Link>
              <Button variant="ghost" onClick={() => void logout()}>
                <LogOut size={16} aria-hidden="true" /> Sair
              </Button>
            </>
          ) : (
            <Link className="primary-action" to="/entrar">
              Entrar
            </Link>
          )}
        </div>
      </header>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/entrar" element={<LoginPage />} />
        <Route path="/ativar-conta" element={<ActivateAccountPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/ranges/preflop"
          element={
            <RequireAuth>
              <RangesPreflopPage />
            </RequireAuth>
          }
        />
        <Route
          path="/situacoes/postflop"
          element={
            <RequireAuth>
              <PostflopStreetExplorerPage />
            </RequireAuth>
          }
        />
        <Route
          path="/treinar"
          element={
            <RequireAuth>
              <TrainingPlayerPage />
            </RequireAuth>
          }
        />
        <Route
          path="/historico"
          element={
            <RequireAuth>
              <TrainingHistoryPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin/fontes"
          element={
            <RequireAuth>
              <RequireAdmin>
                <StrategySourcesAdminPage />
              </RequireAdmin>
            </RequireAuth>
          }
        />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  )
}

export default App
