import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { answerReview, fetchReviewDue } from '../features/training/api';

export function ReviewPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['review-due'], queryFn: fetchReviewDue });

  const mutation = useMutation({
    mutationFn: ({ id, quality }: { id: string; quality: number }) => answerReview(id, quality),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-due'] });
    },
  });

  if (isLoading) return <div className="p-6">Carregando...</div>;

  const items = data?.items ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Revisão</h1>
        <p className="text-sm text-slate-400">Itens vencidos ({data?.count ?? 0})</p>
      </header>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">Nada para revisar agora.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-200">
                  {item.spot?.spotKey ?? item.spotId} · {item.spot?.street ?? '-'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      onClick={() => mutation.mutate({ id: item.id, quality: q })}
                      disabled={mutation.isPending}
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
