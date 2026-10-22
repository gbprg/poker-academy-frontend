import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../lib/api/client.js';
import { RangeMatrix13x13, type MatrixAction } from '../../components/poker/RangeMatrix13x13.js';
import { fetchPreflopRange } from './api.js';

export function RangesPreflopPage() {
  const [format, setFormat] = useState('MTT');
  const [valuation, setValuation] = useState('CHIP_EV');
  const [street, setStreet] = useState('PREFLOP');
  const [tableSize, setTableSize] = useState(9);
  const [selectedHand, setSelectedHand] = useState<{ handClass: string; actions: MatrixAction[] } | null>(null);

  const rangeQuery = useQuery({
    queryKey: ['ranges', 'preflop', format, valuation, street, tableSize],
    queryFn: () => fetchPreflopRange({ format, valuation, street, tableSize }),
    retry: false,
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

      <section className="range-filters" aria-label="Filtros exatos">
        <label className="range-field">
          <span>Formato</span>
          <select className="range-select" value={format} onChange={(event) => setFormat(event.target.value)}>
            <option value="MTT">MTT</option>
            <option value="CASH">Cash</option>
            <option value="SPIN_GO">Spin & Go</option>
          </select>
        </label>
        <label className="range-field">
          <span>Valuation</span>
          <select className="range-select" value={valuation} onChange={(event) => setValuation(event.target.value)}>
            <option value="CHIP_EV">Chip EV</option>
            <option value="ICM">ICM</option>
            <option value="PKO">PKO</option>
          </select>
        </label>
        <label className="range-field">
          <span>Street</span>
          <select className="range-select" value={street} onChange={(event) => setStreet(event.target.value)}>
            <option value="PREFLOP">Pré-flop</option>
          </select>
        </label>
        <label className="range-field">
          <span>Table size</span>
          <select className="range-select" value={tableSize} onChange={(event) => setTableSize(Number(event.target.value))}>
            <option value={6}>6-max</option>
            <option value={9}>9-max</option>
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
