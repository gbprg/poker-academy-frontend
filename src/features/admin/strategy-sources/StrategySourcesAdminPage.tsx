import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../../components/ui/button.js';
import { FieldError, Input } from '../../../components/ui/input.js';
import { ApiError } from '../../../lib/api/client.js';
import {
  addLicenseSchema,
  createSourceSchema,
  type AddLicenseValues,
  type CreateSourceValues,
  type ImportIssue,
  type ImportReport,
  type StrategySource,
} from './api.js';
import { addLicense, commitImport, createSource, listSources, previewImport, verifyRights } from './strategy-sources-api.js';

const methodOptions: Array<{ value: StrategySource['method']; label: string }> = [
  { value: 'LICENSED', label: 'Licenciado' },
  { value: 'SOLVER_VERIFIED', label: 'Solver verificado' },
  { value: 'EDITORIAL', label: 'Editorial' },
  { value: 'DEMO_NOT_GTO', label: 'DEMO_NOT_GTO' },
];

function formatMethod(method: StrategySource['method']) {
  return methodOptions.find((option) => option.value === method)?.label ?? method;
}

export function StrategySourcesAdminPage() {
  const queryClient = useQueryClient();
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [bundleText, setBundleText] = useState('');
  const [previewReport, setPreviewReport] = useState<ImportReport | null>(null);
  const [commitMessage, setCommitMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const sourcesQuery = useQuery({
    queryKey: ['admin', 'strategy-sources'],
    queryFn: () => listSources({ page: 1, pageSize: 50 }),
  });

  const createForm = useForm<CreateSourceValues>({
    resolver: zodResolver(createSourceSchema),
    defaultValues: {
      slug: '',
      title: '',
      author: '',
      originUrl: '',
      method: 'LICENSED',
    },
  });

  const licenseForm = useForm<AddLicenseValues>({
    resolver: zodResolver(addLicenseSchema),
    defaultValues: {
      licenseName: '',
      licenseUrl: '',
      terms: '',
      authorizationId: '',
      checksum: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: createSource,
    onSuccess: async () => {
      setFormError(null);
      createForm.reset();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'strategy-sources'] });
    },
    onError: (error) => {
      if (error instanceof ApiError) setFormError(error.message);
      else setFormError('Não foi possível criar a fonte.');
    },
  });

  const licenseMutation = useMutation({
    mutationFn: ({ sourceId, input }: { sourceId: string; input: AddLicenseValues }) => addLicense(sourceId, input),
    onSuccess: async () => {
      setFormError(null);
      licenseForm.reset();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'strategy-sources'] });
    },
    onError: (error) => {
      if (error instanceof ApiError) setFormError(error.message);
      else setFormError('Não foi possível adicionar a licença.');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: verifyRights,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'strategy-sources'] });
    },
    onError: (error) => {
      if (error instanceof ApiError) setFormError(error.message);
      else setFormError('Não foi possível verificar os direitos.');
    },
  });

  const previewMutation = useMutation({
    mutationFn: ({ sourceId, bundle }: { sourceId: string; bundle: string }) => previewImport(sourceId, bundle),
    onSuccess: (result) => {
      setPreviewReport(result.report);
      setCommitMessage(null);
      setFormError(null);
    },
    onError: (error) => {
      setPreviewReport(null);
      if (error instanceof ApiError) setFormError(error.message);
      else setFormError('Não foi possível executar o preview.');
    },
  });

  const commitMutation = useMutation({
    mutationFn: ({ sourceId, bundle }: { sourceId: string; bundle: string }) => commitImport(sourceId, bundle),
    onSuccess: (result) => {
      setPreviewReport(result);
      setCommitMessage(
        `Importação concluída: ${result.created.spots} spots, ${result.created.versions} versões, ${result.created.nodes} nós, ${result.created.actions} ações. Conteúdo criado como DRAFT.`,
      );
      setFormError(null);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'strategy-sources'] });
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.message);
        const body = (error as ApiError & { body?: unknown }).body;
        if (body && typeof body === 'object' && 'report' in body) {
          setPreviewReport((body as { report: ImportReport }).report);
        }
      } else {
        setFormError('Não foi possível commitar o bundle.');
      }
    },
  });

  const sources = sourcesQuery.data?.items ?? [];
  const selectedSource = sources.find((source) => source.id === selectedSourceId) ?? null;

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Administração</p>
          <h1 className="admin-title">Fontes estratégicas</h1>
          <p className="admin-subtitle">Cadastro, licenças, verificação de direitos e preview de importação (sem publicar).</p>
        </div>
      </header>

      {formError ? <p className="auth-form-error">{formError}</p> : null}
      {commitMessage ? <p className="admin-success">{commitMessage}</p> : null}

      <section className="admin-grid">
        <article className="admin-card">
          <header className="admin-card-header">
            <h2>Cadastrar fonte</h2>
            <p>Cria uma fonte em estado administrativo para receber versões DRAFT.</p>
          </header>
          <form
            className="admin-form"
            onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
            noValidate
          >
            <label className="auth-field">
              <span>Slug (kebab-case)</span>
              <Input {...createForm.register('slug')} autoComplete="off" />
              <FieldError message={createForm.formState.errors.slug?.message} />
            </label>
            <label className="auth-field">
              <span>Título</span>
              <Input {...createForm.register('title')} />
              <FieldError message={createForm.formState.errors.title?.message} />
            </label>
            <label className="auth-field">
              <span>Autor</span>
              <Input {...createForm.register('author')} />
              <FieldError message={createForm.formState.errors.author?.message} />
            </label>
            <label className="auth-field">
              <span>URL de origem (opcional)</span>
              <Input {...createForm.register('originUrl')} inputMode="url" />
              <FieldError message={createForm.formState.errors.originUrl?.message} />
            </label>
            <label className="auth-field">
              <span>Método</span>
              <select className="admin-select" {...createForm.register('method')}>
                {methodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Salvando...' : 'Cadastrar fonte'}
            </Button>
          </form>
        </article>

        <article className="admin-card admin-card-wide">
          <header className="admin-card-header">
            <h2>Fontes cadastradas</h2>
            <p>Selecione uma fonte para adicionar licença, verificar direitos ou importar bundle.</p>
          </header>
          {sourcesQuery.isPending ? <p className="privacy-note">Carregando...</p> : null}
          {sourcesQuery.isError ? <p className="auth-form-error">Não foi possível carregar as fontes.</p> : null}
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fonte</th>
                  <th>Método</th>
                  <th>Direitos verificados</th>
                  <th>Licenças</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((source) => (
                  <tr key={source.id}>
                    <td>
                      <div className="admin-table-primary">{source.title}</div>
                      <div className="admin-table-secondary">{source.slug} • {source.author}</div>
                    </td>
                    <td>{formatMethod(source.method)}</td>
                    <td>{source.rightsVerified ? 'Sim' : 'Não'}</td>
                    <td>{source.licenses?.length ?? 0}</td>
                    <td>
                      <Button type="button" variant="ghost" onClick={() => setSelectedSourceId(source.id)}>
                        {selectedSourceId === source.id ? 'Selecionada' : 'Selecionar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedSource ? (
            <div className="admin-subgrid">
              <section className="admin-panel">
                <header>
                  <h3>Licença</h3>
                  <p>Registre evidências de autorização antes de publicar.</p>
                </header>
                <form
                  className="admin-form"
                  onSubmit={licenseForm.handleSubmit((values) => licenseMutation.mutate({ sourceId: selectedSource.id, input: values }))}
                  noValidate
                >
                  <label className="auth-field">
                    <span>Nome da licença</span>
                    <Input {...licenseForm.register('licenseName')} />
                    <FieldError message={licenseForm.formState.errors.licenseName?.message} />
                  </label>
                  <label className="auth-field">
                    <span>URL da licença (opcional)</span>
                    <Input {...licenseForm.register('licenseUrl')} inputMode="url" />
                    <FieldError message={licenseForm.formState.errors.licenseUrl?.message} />
                  </label>
                  <label className="auth-field">
                    <span>Termos</span>
                    <textarea className="admin-textarea" {...licenseForm.register('terms')} rows={4} />
                    <FieldError message={licenseForm.formState.errors.terms?.message} />
                  </label>
                  <label className="auth-field">
                    <span>ID de autorização (opcional)</span>
                    <Input {...licenseForm.register('authorizationId')} />
                    <FieldError message={licenseForm.formState.errors.authorizationId?.message} />
                  </label>
                  <label className="auth-field">
                    <span>Checksum SHA256</span>
                    <Input {...licenseForm.register('checksum')} autoComplete="off" />
                    <FieldError message={licenseForm.formState.errors.checksum?.message} />
                  </label>
                  <Button type="submit" disabled={licenseMutation.isPending}>
                    {licenseMutation.isPending ? 'Salvando...' : 'Adicionar licença'}
                  </Button>
                </form>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => verifyMutation.mutate(selectedSource.id)}
                  disabled={verifyMutation.isPending || selectedSource.rightsVerified}
                >
                  {selectedSource.rightsVerified ? 'Direitos já verificados' : verifyMutation.isPending ? 'Verificando...' : 'Marcar direitos como verificados'}
                </Button>
              </section>

              <section className="admin-panel">
                <header>
                  <h3>Preview e importação</h3>
                  <p>Dry-run não persiste nada. Commit cria conteúdo como DRAFT (publicação é etapa separada).</p>
                </header>
                <label className="auth-field">
                  <span>Bundle JSON</span>
                  <textarea
                    className="admin-textarea admin-textarea-large"
                    value={bundleText}
                    onChange={(event) => setBundleText(event.target.value)}
                    rows={12}
                    spellCheck={false}
                  />
                </label>
                <div className="admin-actions">
                  <Button
                    type="button"
                    onClick={() => previewMutation.mutate({ sourceId: selectedSource.id, bundle: bundleText })}
                    disabled={previewMutation.isPending || bundleText.trim().length === 0}
                  >
                    {previewMutation.isPending ? 'Executando...' : 'Executar preview'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => commitMutation.mutate({ sourceId: selectedSource.id, bundle: bundleText })}
                    disabled={commitMutation.isPending || bundleText.trim().length === 0}
                  >
                    {commitMutation.isPending ? 'Importando...' : 'Commitar como DRAFT'}
                  </Button>
                </div>

                {previewReport ? (
                  <div className="admin-report">
                    <header>
                      <h4>Relatório</h4>
                      <span className={previewReport.ok ? 'admin-badge admin-badge-ok' : 'admin-badge admin-badge-bad'}>
                        {previewReport.ok ? 'Válido' : 'Com erros'}
                      </span>
                    </header>
                    <dl className="admin-stats">
                      <div>
                        <dt>Spots</dt>
                        <dd>{previewReport.counts.spots}</dd>
                      </div>
                      <div>
                        <dt>Versões</dt>
                        <dd>{previewReport.counts.strategyVersions}</dd>
                      </div>
                      <div>
                        <dt>Nós</dt>
                        <dd>{previewReport.counts.decisionNodes}</dd>
                      </div>
                    </dl>
                    {previewReport.issues.length > 0 ? (
                      <div className="admin-issues">
                        <h5>Erros acionáveis</h5>
                        <ul>
                          {previewReport.issues.map((issue: ImportIssue, index: number) => (
                            <li key={`${issue.code}-${issue.path}-${index}`}>
                              <strong>{issue.code}</strong> • <code>{issue.path}</code>
                              <p>{issue.message}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}
