import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { startQuickQuiz } from '../features/training/api';

export function QuickQuizPage() {
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: startQuickQuiz,
    onSuccess: (data) => {
      if (data.question) {
        navigate(`/treinar/${data.session.id}/pergunta/${data.question.position}`);
      }
    },
  });

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Quiz rápido</h1>
        <p className="text-sm text-slate-400">1 pergunta aleatória de spot publicado.</p>
      </header>
      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {mutation.isPending ? 'Gerando...' : 'Iniciar quiz rápido'}
      </button>
      {mutation.isError ? <p className="text-sm text-rose-400">Não foi possível iniciar o quiz.</p> : null}
    </div>
  );
}
