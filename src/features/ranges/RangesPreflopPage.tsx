import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { ApiError } from '../../lib/api/client.js';
import { RangeMatrix13x13, type MatrixAction } from '../../components/poker/RangeMatrix13x13.js';
import { BettingTimeline } from '../../components/poker/BettingTimeline.js';
import { fetchPreflopRange } from './api.js';

const TIMELINE = [
  { id: 'rfi', label: 'RFI' },
  { id: 'vs-limp', label: 'vs Limp' },
  { id: 'vs-raise', label: 'vs Raise' },
  { id: '3bet', label: '3-bet' },
  { id: '4bet', label: '4-bet' },
  { id: 'push-fold', label: 'Push/Fold' },
];

export function RangesPreflopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [format, setFormat] = useState(searchParams.get('format') ?? 'MTT');
  const [valuation, setValuation] = useState(searchParams.get('valuation') ?? 'CHIP_EV');
  const [street, setStreet] = useState(searchParams.get('street') ?? 'PREFLOP');
  const [tableSize, setTableSize] = useState(Number(searchParams.get('tableSize') ?? 9));
  const [scenario, setScenario] = useState(searchParams.get('scenario') ?? 'rfi');
  const [position, setPosition] = useState(searchParams.get('position') ?? 'BTN');
  const [vsPosition, setVsPosition] = useState(searchParams.get('vsPosition') ?? '');
  const [selectedHand, setSelectedHand] = useState<{ handClass: string; actions: MatrixAction[] } | null>(null);

  const updateParams = (next: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    setSearchParams(params, { replace: true });
  };

  const rangeQuery = useQuery({
    queryKey: ['ranges', 'preflop', format, valuation, street, tableSize, position, vsPosition, scenario],
    queryFn: () => fetchPreflopRange({ format, valuation, street, tableSize, position, vsPosition: vsPosition || undefined, scenario }),
    retry: false,
    staleTime: 30_000,
  });

  const actionsByHandClass = useMemo(() => {
    const map: Record<string, MatrixAction[]> = {};
    if (!rangeQuery.data) return map;
    for (const node of rangeQuery.data.nodes) {
      for (const action of node.actions) {
        if (!map[action.handClass]) map[action.handClass] = [];
        map[action.handClass].push({
          actionType: action.actionType,
          frequency: action.frequency,
          sizing: action.sizing,
          evNullable: action.evNullable,
        });
      }
    }
    return map;
  }, [rangeQuery.data]);

  const errorMessage = rangeQuery.error instanceof ApiError ? rangeQuery.error.message : null;

  return (
    <main className="range-page">
      <header className="range-header">
        <p className="eyebrow">Biblioteca de ranges</p>
        <h1 className="range-title">Ranges pré-flop (consulta exata)</h1>
        <p className="range-subtitle">Somente versões PUBLICADAS. Sem fallback ou sugestão de ranges semelhantes.</p>
      </header>

      <BettingTimeline
        steps={TIMELINE.map((step) => ({
          id: step.id,
          label: step.label,
          active: scenario === step.id,
          disabled: rangeQuery.isFetching && scenario !== step.id,
        }))}
        onSelect={(id) => {
          setScenario(id);
          setSelectedHand(null);
          updateParams({ scenario: id });
        }}
      />

      <section className="range-filters" aria-label="Filtros exatos">
        <label className="range-field">
          <span>Formato</span>
          <select
            className="range-select"
            value={format}
            onChange={(event) => {
              const value = event.target.value;
              setFormat(value);
              updateParams({ format: value });
            }}
          >
            <option value="MTT">MTT</option>
            <option value="CASH">Cash</option>
            <option value="SPIN_GO">Spin & Go</option>
          </select>
        </label>
        <label className="range-field">
          <span>Valuation</span>
          <select
            className="range-select"
            value={valuation}
            onChange={(event) => {
              const value = event.target.value;
              setValuation(value);
              updateParams({ valuation: value });
            }}
          >
            <option value="CHIP_EV">Chip EV</option>
            <option value="ICM">ICM</option>
            <option value="PKO">PKO</option>
          </select>
        </label>
        <label className="range-field">
          <span>Street</span>
          <select
            className="range-select"
            value={street}
            onChange={(event) => {
              const value = event.target.value;
              setStreet(value);
              updateParams({ street: value });
            }}
          >
            <option value="PREFLOP">Pré-flop</option>
          </select>
        </label>
        <label className="range-field">
          <span>Table size</span>
          <select
            className="range-select"
            value={tableSize}
            onChange={(event) => {
              const value = Number(event.target.value);
              setTableSize(value);
              updateParams({ tableSize: value });
            }}
          >
            <option value={6}>6-max</option>
            <option value={9}>9-max</option>
          </select>
        </label>
        <label className="range-field">
          <span>Posição (herói)</span>
          <select
            className="range-select"
            value={position}
            onChange={(event) => {
              const value = event.target.value;
              setPosition(value);
              setSelectedHand(null);
              updateParams({ position: value });
            }}
          >
            <option value="UTG">UTG</option>
            <option value="MP">MP</option>
            <option value="CO">CO</option>
            <option value="BTN">BTN</option>
            <option value="SB">SB</option>
            <option value="BB">BB</option>
          </select>
        </label>
        <label className="range-field">
          <span>vs Posição (opcional)</span>
          <select
            className="range-select"
            value={vsPosition}
            onChange={(event) => {
              const value = event.target.value;
              setVsPosition(value);
              setSelectedHand(null);
              updateParams({ vsPosition: value });
            }}
          >
            <option value="">Sem definição</option>
            <option value="UTG">UTG</option>
            <option value="MP">MP</option>
            <option value="CO">CO</option>
            <option value="BTN">BTN</option>
            <option value="SB">SB</option>
            <option value="BB">BB</option>
          </select>
        </label>
      </section>

      <section className="range-card">
        {rangeQuery.isPending ? <p className="privacy-note">Carregando ranges...</p> : null}
        {errorMessage ? <p className="auth-form-error">{errorMessage}</p> : null}
        {rangeQuery.data ? (
          <>
            <header>
              <h2>Versão publicada</h2>
              <p className="privacy-note">
                {rangeQuery.data.version.versionTag} • {rangeQuery.data.version.source.title} • {rangeQuery.data.spot.spotKey}
              </p>
            </header>
            <RangeMatrix13x13 actionsByHandClass={actionsByHandClass} onSelectHandClass={(handClass, actions) => setSelectedHand({ handClass, actions })} />
            {selectedHand ? (
              <section className="range-detail" aria-label="Detalhe da mão">
                <header>
                  <h3>{selectedHand.handClass}</h3>
                  <p className="privacy-note">Ações e frequências retornadas pelo servidor (sem cálculo de gabarito no cliente)</p>
                </header>
                <ul>
                  {selectedHand.actions.map((action, index) => (
                    <li key={`${action.actionType}-${index}`}>
                      <span>{action.actionType}{action.sizing ? ` ${action.sizing}bb` : ''}</span>
                      <span>{Math.round(action.frequency * 100)}%</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}
