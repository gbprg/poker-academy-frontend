import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from './auth-context.js';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isRestoring } = useAuth();
  const location = useLocation();

  if (isRestoring) {
    return (
      <main className="placeholder-page" aria-busy="true">
        <p className="eyebrow">Verificando sessão…</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/entrar?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  if (user?.role !== 'ADMIN') {
    return (
      <main className="placeholder-page">
        <p className="eyebrow">Acesso negado</p>
        <p className="privacy-note">Você não tem permissão para esta ação.</p>
      </main>
    );
  }

  return <>{children}</>;
}
