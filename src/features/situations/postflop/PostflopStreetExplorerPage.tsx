import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError } from '../../../lib/api/client.js';
import { CommunityBoard } from '../../../components/poker/CommunityBoard.js';
import { BettingTimeline } from '../../../components/poker/BettingTimeline.js';
import { StrategyBreakdown } from '../../../components/poker/StrategyBreakdown.js';
import { fetchPostflopNode, fetchPostflopTrees } from './api.js';

const STREETS = [
  { id: 'FLOP', label: 'Flop' },
  { id: 'TURN', label: 'Turn' },
  { id: 'RIVER', label: 'River' },
];

export function PostflopStreetExplorerPage() {
  const [format, setFormat] = useState('CASH');
  const [valuation, setValuation] = useState('CHIP_EV');
  const [street, setStreet] = useState('FLOP');
  const [tableSize, setTableSize] = useState(6);
  const [nodeId, setNodeId] = useState('');

  const treesQuery = useQuery({
    queryKey: ['postflop', 'trees', format, valuation, street, tableSize],
    queryFn: () => fetchPostflopTrees({ format, valuation, street, tableSize }),
    retry: false,
  });

  const nodeQuery = useQuery({
    queryKey: ['postflop', 'node', nodeId],
    queryFn: () => fetchPostflopNode(nodeId),
    enabled: nodeId.trim().length > 0,
    retry: false,
  });

  const errorMessage = treesQuery.error instanceof ApiError ? treesQuery.error.message : nodeQuery.error instanceof ApiError ? nodeQuery.error.message : null;

  return (
    <main className="range-page">
      <header className="range-header">
        <p className="eyebrow">Street Explorer</p>
        <h1 className="range-title">Navegação pós-flop</h1>
        <p className="range-subtitle">Somente árvores materializadas publicadas. Sem cálculo online de ramos ausentes.</p>
      </header>

      <BettingTimeline steps={STREETS.map((s) => ({ id: s.id, label: s.label, active: street === s.id }))} onSelect={(id: string) => setStreet(id)} />

      <section className="range-filters" aria-label="Filtros">
        <label className="range-field">
          <span>Formato</span>
          <select className="range-select" value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="CASH">Cash</option>
            <option value="MTT">MTT</option>
          </select>
        </label>
        <label className="range-field">
          <span>Valuation</span>
          <select className="range-select" value={valuation} onChange={(e) => setValuation(e.target.value)}>
            <option value="CHIP_EV">Chip EV</option>
          </select>
        </label>
        <label className="range-field">
          <span>Table size</span>
          <select className="range-select" value={tableSize} onChange={(e) => setTableSize(Number(e.target.value))}>
            <option value={6}>6-max</option>
            <option value={9}>9-max</option>
          </select>
        </label>
        <label className="range-field">
          <span>Node ID</span>
          <input className="range-select" value={nodeId} onChange={(e) => setNodeId(e.target.value)} placeholder="flop-cbet" />
        </label>
      </section>

      <section className="range-card">
        {treesQuery.isPending ? <p className="privacy-note">Carregando árvores...</p> : null}
        {errorMessage ? <p className="auth-form-error">{errorMessage}</p> : null}
        {treesQuery.data && !treesQuery.data.available ? (
          <div className="admin-report">
            <header>
              <h2>CoverageNotice</h2>
            </header>
            <p>Sem cobertura publicada para os filtros exatos. Nenhum ramo foi fabricado.</p>
          </div>
        ) : null}
        {treesQuery.data?.available ? (
          <div>
            <p className="privacy-note">{treesQuery.data.items.length} árvore(s) materializada(s) encontrada(s).</p>
            {treesQuery.data.items[0] ? <CommunityBoard cards={treesQuery.data.items[0].spot.board} /> : null}
          </div>
        ) : null}
        {nodeQuery.data ? (
          <>
            <CommunityBoard cards={nodeQuery.data.spot.board} />
            <div className="range-card-header">
              <StrategyBreakdown actions={nodeQuery.data.actions} />
              <button
                type="button"
                className="primary-action"
                onClick={() => {
                  window.location.href = `/treinar?nodeId=${encodeURIComponent(nodeQuery.data!.nodeKey)}&versionId=${encodeURIComponent(nodeQuery.data!.strategyVersionId)}&spotId=${encodeURIComponent(nodeQuery.data!.spot.id)}`;
                }}
              >
                Treinar decisão neste nó
              </button>
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
