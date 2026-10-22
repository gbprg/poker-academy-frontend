import { useMemo, useState } from 'react';

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

function getHandClass(rank1: string, rank2: string, suited: boolean, isPair: boolean) {
  if (isPair) return `${rank1}${rank2}`;
  return suited ? `${rank1}${rank2}s` : `${rank1}${rank2}o`;
}

const COMBO_COUNTS = {
  pair: 6,
  suited: 4,
  offsuit: 12,
};

export type MatrixAction = {
  actionType: string;
  frequency: number;
  sizing?: number | null;
  evNullable?: number | null;
};

export type RangeMatrix13x13Props = {
  actionsByHandClass: Record<string, MatrixAction[]>;
  onSelectHandClass?: (handClass: string, actions: MatrixAction[]) => void;
};

function actionColor(actions: MatrixAction[]) {
  if (!actions || actions.length === 0) return 'var(--muted)';
  const top = actions.reduce((prev, cur) => (cur.frequency > prev.frequency ? cur : prev), actions[0]);
  if (top.actionType === 'FOLD') return 'rgba(255, 255, 255, 0.25)';
  if (top.actionType === 'CALL' || top.actionType === 'CHECK') return 'rgba(200, 200, 200, 0.5)';
  if (top.actionType === 'RAISE' || top.actionType === 'BET' || top.actionType === '3BET' || top.actionType === '4BET') {
    return 'rgba(217, 164, 65, 0.85)';
  }
  if (top.actionType === 'ALL_IN') return 'rgba(255, 107, 107, 0.9)';
  return 'rgba(217, 164, 65, 0.6)';
}

function comboCountForCell(row: number, col: number) {
  if (row === col) return COMBO_COUNTS.pair;
  if (row < col) return COMBO_COUNTS.suited;
  return COMBO_COUNTS.offsuit;
}

export function RangeMatrix13x13({ actionsByHandClass, onSelectHandClass }: RangeMatrix13x13Props) {
  const [active, setActive] = useState<string | null>(null);

  const summary = useMemo(() => {
    let total = 0;
    let raised = 0;
    let called = 0;
    let folded = 0;
    for (const [handClass, actions] of Object.entries(actionsByHandClass)) {
      if (!actions || actions.length === 0) continue;
      let combos = 1;
      if (handClass.length === 2 && handClass[0] === handClass[1]) combos = COMBO_COUNTS.pair;
      else if (handClass.endsWith('s')) combos = COMBO_COUNTS.suited;
      else if (handClass.endsWith('o')) combos = COMBO_COUNTS.offsuit;
      total += combos;
      for (const action of actions) {
        const weight = action.frequency * combos;
        if (action.actionType === 'RAISE' || action.actionType === 'BET' || action.actionType === '3BET' || action.actionType === '4BET') {
          raised += weight;
        } else if (action.actionType === 'CALL' || action.actionType === 'CHECK') {
          called += weight;
        } else if (action.actionType === 'FOLD') {
          folded += weight;
        } else {
          called += weight;
        }
      }
    }
    if (total === 0) return { total: 0, raised: 0, called: 0, folded: 0 };
    return {
      total,
      raised: Math.round((raised / total) * 1000) / 10,
      called: Math.round((called / total) * 1000) / 10,
      folded: Math.round((folded / total) * 1000) / 10,
    };
  }, [actionsByHandClass]);

  return (
    <section className="range-matrix" aria-label="Matriz 13x13 de ranges">
      <div className="range-matrix-grid" role="grid" aria-label="Matriz de maos">
        {RANKS.map((rank1, row) =>
          RANKS.map((rank2, col) => {
            const isPair = row === col;
            const suited = row < col;
            const handClass = getHandClass(rank1, rank2, suited, isPair);
            const actions = actionsByHandClass[handClass] ?? [];
            const hasRange = actions.length > 0;
            const combos = comboCountForCell(row, col);
            const isActive = active === handClass;

            return (
              <button
                key={`${row}-${col}`}
                type="button"
                role="gridcell"
                className={`range-matrix-cell ${isActive ? 'range-matrix-cell-active' : ''} ${hasRange ? 'range-matrix-cell-has' : ''}`}
                style={{ background: hasRange ? actionColor(actions) : 'transparent' }}
                aria-label={`${handClass}, ${combos} combinacoes${hasRange ? ', com acoes definidas' : ', sem acoes'}`}
                onClick={() => {
                  setActive(handClass);
                  if (onSelectHandClass) onSelectHandClass(handClass, actions);
                }}
                onFocus={() => setActive(handClass)}
              >
                <span className="range-matrix-label">{handClass}</span>
                {hasRange ? <span className="range-matrix-combos">{combos}</span> : null}
              </button>
            );
          }),
        )}
      </div>

      <aside className="range-matrix-legend" aria-label="Legenda">
        <h3>Legenda</h3>
        <ul>
          <li><span className="range-legend-swatch" style={{ background: 'rgba(217, 164, 65, 0.85)' }} /> Raise/Bet/3-bet/4-bet</li>
          <li><span className="range-legend-swatch" style={{ background: 'rgba(200, 200, 200, 0.5)' }} /> Call/Check</li>
          <li><span className="range-legend-swatch" style={{ background: 'rgba(255, 107, 107, 0.9)' }} /> All-in</li>
          <li><span className="range-legend-swatch" style={{ background: 'rgba(255, 255, 255, 0.25)' }} /> Fold</li>
          <li><span className="range-legend-swatch range-legend-empty" /> Sem acoes</li>
        </ul>
        <p className="range-matrix-note">A cor e um sinal visual, nao o unico indicador. Use o detalhe da mao para ver frequencias exatas.</p>
      </aside>

      <section className="range-matrix-summary" aria-label="Resumo ponderado por combinacoes">
        <h3>Resumo (ponderado por combos)</h3>
        <dl>
          <div><dt>Raise/Bet</dt><dd>{summary.raised}%</dd></div>
          <div><dt>Call/Check</dt><dd>{summary.called}%</dd></div>
          <div><dt>Fold</dt><dd>{summary.folded}%</dd></div>
        </dl>
        <p className="range-matrix-note">Calculo por combinacoes totais, nao media simples das 169 classes.</p>
      </section>
    </section>
  );
}
