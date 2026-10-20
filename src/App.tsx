import { Activity, BookOpen, ShieldCheck, Spade } from 'lucide-react'
import { Link, Route, Routes } from 'react-router'
import { Badge } from './components/ui/badge'
import { SystemStatus } from './features/system/SystemStatus'

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
          <Link className="primary-action" to="/dashboard">
            Abrir área de estudo
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
  return (
    <main className="placeholder-page">
      <p className="eyebrow">Área autenticada em construção</p>
      <h1>Dashboard</h1>
      <p>Este endereço já suporta acesso direto. O conteúdo virá na P02.</p>
      <Link to="/">Voltar ao início</Link>
    </main>
  )
}

function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="Poker Academy — início">
          <span className="brand-mark" aria-hidden="true">PA</span>
          <span>Poker Academy</span>
        </Link>
        <Badge className="environment-badge">Foundation</Badge>
      </header>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  )
}

export default App
