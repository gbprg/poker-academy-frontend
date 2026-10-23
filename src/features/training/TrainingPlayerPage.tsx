import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { ApiError } from '../../lib/api/client.js';
import {
  completeTrainingSession,
  createTrainingSession,
  fetchTrainingQuestion,
  submitTrainingAnswer,
  type AnswerFeedback,
  type CompletionResponse,
  type DeliveredQuestion,
} from './api.js';

type BoardCard = string | { rank?: string; suit?: string };
type SeatView = {
  seat?: number;
  position?: string;
  stack?: { bb?: number; chips?: number };
  isHero?: boolean;
  isActive?: boolean;
};
type HeroView = { position?: string; handClass?: string };

function parseBoard(value: unknown): BoardCard[] {
  return Array.isArray(value) ? (value as BoardCard[]) : [];
}

function parseSeats(value: unknown): SeatView[] {
  return Array.isArray(value) ? (value as SeatView[]) : [];
}

function cardLabel(card: BoardCard): string {
  if (typeof card === 'string') return card;
  return `${card.rank ?? '?'}${card.suit ?? ''}`;
}

export function TrainingPlayerPage() {
  const [searchParams] = useSearchParams();
  const spotId = searchParams.get('spotId') ?? undefined;
  const strategyVersionId = searchParams.get('strategyVersionId') ?? undefined;
  const nodeId = searchParams.get('nodeId') ?? undefined;

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [position, setPosition] = useState(1);
  const [question, setQuestion] = useState<DeliveredQuestion | null>(null);
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [completion, setCompletion] = useState<CompletionResponse | null>(null);
  const [actionType, setActionType] = useState('');
  const [sizing, setSizing] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filters = useMemo(
    () => ({
      ...(searchParams.get('format') ? { format: searchParams.get('format') } : {}),
      ...(searchParams.get('valuation') ? { valuation: searchParams.get('valuation') } : {}),
      ...(searchParams.get('street') ? { street: searchParams.get('street') } : {}),
      ...(searchParams.get('tableSize') ? { tableSize: searchParams.get('tableSize') } : {}),
    }),
    [searchParams],
  );

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const response = await createTrainingSession({
        spotId,
        strategyVersionId,
        ...(Object.keys(filters).length > 0 ? { filters } : {}),
        ...(nodeId ? { scenario: { nodeId } } : {}),
      });
      setSessionId(response.session.id);
      setTotalQuestions(response.session.totalQuestions);
      setPosition(1);
      setCompletion(null);
      setIdempotencyKey(crypto.randomUUID());
      setFeedback(null);
      setActionType('');
      setSizing('');
      setQuestion(response.question ?? (await fetchTrainingQuestion(response.session.id, 1)));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível iniciar o treino.');
    } finally {
      setBusy(false);
    }
  }

  async function answer() {
    if (!sessionId || !question) return;
    setBusy(true);
    setError(null);
    try {
      const result = await submitTrainingAnswer(sessionId, position, {
        actionType,
        ...(sizing ? { sizing: Number(sizing) } : {}),
        idempotencyKey,
      });
      setFeedback(result);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível registrar a resposta.');
    } finally {
      setBusy(false);
    }
  }

  async function next() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      if (position >= totalQuestions) {
        const result = await completeTrainingSession(sessionId);
        setCompletion(result);
        return;
      }
      const nextPosition = position + 1;
      const nextQuestion = await fetchTrainingQuestion(sessionId, nextPosition);
      setPosition(nextPosition);
      setQuestion(nextQuestion);
      setIdempotencyKey(crypto.randomUUID());
      setFeedback(null);
      setActionType('');
      setSizing('');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível avançar.');
    } finally {
      setBusy(false);
    }
  }

  async function finishEarly() {
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      setCompletion(await completeTrainingSession(sessionId));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível concluir.');
    } finally {
      setBusy(false);
    }
  }

  const board = parseBoard(question?.context.board);
  const seats = parseSeats(question?.context.seats);
  const hero = (question?.context.hero ?? null) as HeroView | null;
  const legalActions = question?.context.legalActions ?? [];

  if (completion) {
    return (
      <main className="training-page">
        <header className="range-header">
          <p className="eyebrow">Resultado da sessão</p>
          <h1 className="range-title">Treino concluído</h1>
          <p className="range-subtitle">
            {completion.partial ? 'Sessão finalizada com questões em aberto.' : 'Todas as questões foram respondidas.'}
          </p>
        </header>
        <section className="range-card">
          <p>
            Acertos de mix: {completion.answeredQuestions}/{completion.totalQuestions} •{' '}
            {completion.averageScore === null
              ? 'Sem pontuação'
              : `Score médio ${(completion.averageScore * 100).toFixed(1)}%`}
          </p>
          {completion.averageEvDelta !== null ? (
            <p className="privacy-note">EV médio perdido: {completion.averageEvDelta}</p>
          ) : (
            <p className="privacy-note">EV não disponível nas fontes publicadas.</p>
          )}
          <ol className="training-results">
            {completion.results.map((result) => (
              <li key={result.position}>
                <span>
                  #{result.position} {result.spotKey ?? ''}
                </span>
                <span>
                  {result.answered ? `${result.actionType} • ${(result.score ?? 0) * 100}%` : 'Não respondida'}
                </span>
                <span className="privacy-note">{result.scoringVersion ?? ''}</span>
              </li>
            ))}
          </ol>
          <a className="primary-action" href="/historico">
            Ver histórico
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="training-page">
      <header className="range-header">
        <p className="eyebrow">Treino guiado</p>
        <h1 className="range-title">Decisão no spot</h1>
        <p className="range-subtitle">
          As respostas são corrigidas no servidor. Nenhum gabarito é enviado ao navegador.
        </p>
      </header>

      {!sessionId ? (
        <section className="range-card">
          <p className="privacy-note">
            {spotId ? 'Sessão vinculada ao spot selecionado.' : 'Sessão aberta a partir de todo o conteúdo publicado.'}
          </p>
          <button type="button" className="primary-action" onClick={() => void start()} disabled={busy}>
            Iniciar treino
          </button>
        </section>
      ) : null}

      {error ? <p className="auth-form-error">{error}</p> : null}

      {sessionId && question ? (
        <section className="training-board">
          <div className="training-board__meta">
            <span>
              Questão {position} de {totalQuestions}
            </span>
            <span className="privacy-note">
              {question.context.spotKey} • {question.context.street} • {question.context.tableSize}-max
            </span>
          </div>

          <div className="community-board" aria-label="Cartas comunitárias">
            {board.length === 0 ? <span className="privacy-note">Sem cartas comunitárias (pré-flop)</span> : null}
            {board.map((card, index) => (
              <span key={`${cardLabel(card)}-${index}`} className="community-card">
                {cardLabel(card)}
              </span>
            ))}
          </div>

          {hero ? (
            <p className="training-hero">
              Herói: {hero.position ?? '—'} • Mão {hero.handClass ?? '—'}
            </p>
          ) : null}

          <ul className="training-seats">
            {seats.map((seat, index) => (
              <li key={`${seat.seat ?? index}`} className={seat.isHero ? 'is-hero' : undefined}>
                <span>{seat.position ?? `Assento ${seat.seat ?? index + 1}`}</span>
                <span>{seat.stack?.bb !== undefined ? `${seat.stack.bb} bb` : '—'}</span>
                {seat.isHero ? <span className="badge">Herói</span> : null}
              </li>
            ))}
          </ul>

          <div className="training-actions" role="group" aria-label="Ações permitidas">
            {legalActions.map((action) => (
              <button
                key={action}
                type="button"
                className={`training-action ${actionType === action ? 'is-selected' : ''}`}
                aria-pressed={actionType === action}
                onClick={() => setActionType(action)}
                disabled={busy || feedback !== null}
              >
                {action}
              </button>
            ))}
          </div>

          <label className="range-field">
            <span>Tamanho (opcional)</span>
            <input
              className="range-select"
              type="number"
              min="0"
              step="0.1"
              value={sizing}
              onChange={(event) => setSizing(event.target.value)}
              disabled={busy || feedback !== null}
            />
          </label>

          {feedback === null ? (
            <button
              type="button"
              className="primary-action"
              onClick={() => void answer()}
              disabled={busy || actionType === ''}
            >
              Confirmar resposta
            </button>
          ) : (
            <div className="training-feedback" aria-live="polite">
              <p>
                Score: {(feedback.score * 100).toFixed(1)}% • Melhor ação: {feedback.bestActionType ?? '—'}
              </p>
              <p className="privacy-note">
                {feedback.evDelta === null
                  ? 'EV não disponível para esta fonte.'
                  : `EV perdido: ${feedback.evDelta}`}{' '}
                • {feedback.scoringVersion}
                {feedback.duplicate ? ' • resposta já registrada' : ''}
              </p>
              <ul className="training-mix">
                {feedback.mix.map((item) => (
                  <li key={item.actionType}>
                    {item.actionType}: {(item.frequency * 100).toFixed(1)}%
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="training-controls">
            <button type="button" className="primary-action" onClick={() => void next()} disabled={busy || feedback === null}>
              {position >= totalQuestions ? 'Concluir sessão' : 'Próxima questão'}
            </button>
            <button type="button" className="secondary-action" onClick={() => void finishEarly()} disabled={busy}>
              Encerrar agora
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
