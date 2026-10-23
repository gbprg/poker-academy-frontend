import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../lib/api/client.js';
import { fetchTrainingHistory } from './api.js';

export function TrainingHistoryPage() {
  const historyQuery = useQuery({
    queryKey: ['training', 'history'],
    queryFn: fetchTrainingHistory,
    retry: false,
  });

  const errorMessage = historyQuery.error instanceof ApiError ? historyQuery.error.message : null;

  return (
    <main className="training-page">
      <header className="range-header">
        <p className="eyebrow">Seu progresso</p>
        <h1 className="range-title">Histórico de treinos</h1>
        <p className="range-subtitle">Somente suas sessões. Dados privados por usuário.</p>
      </header>

      <section className="range-card">
        {historyQuery.isPending ? <p className="privacy-note">Carregando histórico...</p> : null}
        {errorMessage ? <p className="auth-form-error">{errorMessage}</p> : null}
        {historyQuery.data && historyQuery.data.sessions.length === 0 ? (
          <p className="privacy-note">Nenhuma sessão registrada ainda.</p>
        ) : null}
        {historyQuery.data && historyQuery.data.sessions.length > 0 ? (
          <ul className="training-history">
            {historyQuery.data.sessions.map((session) => (
              <li key={session.id}>
                <span>{new Date(session.createdAt).toLocaleString('pt-BR')}</span>
                <span>{session.status === 'COMPLETED' ? 'Concluída' : 'Em andamento'}</span>
                <span>
                  {session.answeredQuestions}/{session.totalQuestions}
                </span>
                <span>
                  {session.averageScore === null
                    ? 'Sem score'
                    : `${(session.averageScore * 100).toFixed(1)}%`}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </main>
  );
}
