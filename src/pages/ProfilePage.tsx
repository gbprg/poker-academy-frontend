import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchProfile, updateProfile } from '../features/training/api';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: fetchProfile });
  const [theme, setTheme] = useState<string>('');

  const mutation = useMutation({
    mutationFn: (settings: Record<string, unknown>) => updateProfile(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  if (isLoading) return <div className="p-6">Carregando...</div>;

  const settings = data?.settings ?? {};
  const currentTheme = (theme || (settings.theme as string) || 'dark') as string;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Perfil</h1>
        <p className="text-sm text-slate-400">Preferências da conta.</p>
      </header>
      <section className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-col gap-3">
          <label className="text-sm text-slate-300">Tema</label>
          <select
            value={currentTheme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            <option value="dark">Escuro</option>
            <option value="light">Claro</option>
          </select>
          <button
            onClick={() => mutation.mutate({ ...(settings as Record<string, unknown>), theme: currentTheme })}
            disabled={mutation.isPending}
            className="self-start rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            Salvar
          </button>
        </div>
      </section>
    </div>
  );
}
