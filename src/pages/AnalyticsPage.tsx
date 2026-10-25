import { useQuery } from '@tanstack/react-query';
import { fetchAnalyticsOverview } from '../features/training/api';

export function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-overview'],
    queryFn: fetchAnalyticsOverview,
  });

  if (isLoading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Análises</h1>
        <p className="text-sm text-slate-400">Visão geral do treino.</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Sessões</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{data?.sessions ?? 0}</p>
        </article>
        <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Concluídas</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{data?.completedSessions ?? 0}</p>
        </article>
        <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Tentativas</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">{data?.attempts ?? 0}</p>
        </article>
        <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Acurácia (>=0.8)</p>
          <p className="mt-2 text-2xl font-semibold text-slate-100">
            {((data?.accuracy ?? 0) * 100).toFixed(1)}%
          </p>
        </article>
      </section>
    </div>
  );
}
