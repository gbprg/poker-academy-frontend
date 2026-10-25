import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { ApiError } from '../../lib/api/client.js';
import { createPreset, fetchPresets, fetchEligibleCount, type TrainingPreset } from './api.js';

export function TrainingConfiguratorPage() {
  const navigate = useNavigate();
  const [format, setFormat] = useState('MTT');
  const [valuation, setValuation] = useState('CHIP_EV');
  const [street, setStreet] = useState('PREFLOP');
  const [tableSize, setTableSize] = useState(9);
  const [eligible, setEligible] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filters = useMemo(
    () => ({ format, valuation, street, tableSize }),
    [format, valuation, street, tableSize],
  );

  const { data: presetsData, refetch: refetchPresets } = useQuery({
    queryKey: ['training', 'presets'],
    queryFn: fetchPresets,
  });

  async function count() {
    setBusy(true);
    setError(null);
    setEligible(null);
    try {
      const response = await fetchEligibleCount({ filters });
      const value = response.eligible ?? response.count ?? 0;
      setEligible(value);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível calcular elegíveis.');
    } finally {
      setBusy(false);
    }
  }

  function start() {
    if (eligible === null || eligible <= 0) return;
    const params = new URLSearchParams({
      format,
      valuation,
      street,
      tableSize: String(tableSize),
    });
    navigate(`/treinar?${params.toString()}`);
  }

  async function savePreset() {
    const name = window.prompt('Nome do preset');
    if (!name) return;
    try {
      await createPreset({ name, filters, scenario: {} });
      await refetchPresets();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Não foi possível salvar o preset.');
    }
  }

  function applyPreset(preset: TrainingPreset) {
    const presetFilters = preset.filters as Record<string, unknown>;
    if (typeof presetFilters.format === 'string') setFormat(presetFilters.format);
    if (typeof presetFilters.valuation === 'string') setValuation(presetFilters.valuation);
    if (typeof presetFilters.street === 'string') setStreet(presetFilters.street);
    if (typeof presetFilters.tableSize === 'number') setTableSize(presetFilters.tableSize);
    if (typeof presetFilters.tableSize === 'string') setTableSize(Number(presetFilters.tableSize));
    setEligible(null);
  }

  return (
    <main className="training-page">
      <header className="range-header">
        <p className="eyebrow">Configurador</p>
        <h1 className="range-title">Treino livre por situação</h1>
        <p className="range-subtitle">Somente exercícios publicados são elegíveis. Início bloqueado com zero resultados.</p>
      </header>

      <section className="range-card">
        <div className="range-filters" aria-label="Filtros">
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
              <option value="FLOP">Flop</option>
              <option value="TURN">Turn</option>
              <option value="RIVER">River</option>
            </select>
          </label>
          <label className="range-field">
            <span>Table size</span>
            <select className="range-select" value={tableSize} onChange={(event) => setTableSize(Number(event.target.value))}>
              <option value={6}>6-max</option>
              <option value={9}>9-max</option>
            </select>
          </label>
        </div>

        <div className="training-controls">
          <button type="button" className="primary-action" onClick={() => void count()} disabled={busy}>
            Verificar elegíveis
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={start}
            disabled={busy || eligible === null || eligible <= 0}
          >
            Iniciar treino
          </button>
        </div>

        {error ? <p className="auth-form-error">{error}</p> : null}
        {eligible !== null ? (
          <p className="privacy-note">
            {eligible === 0 ? 'Nenhum exercício elegível para esta combinação. Ajuste os filtros.' : `${eligible} exercício(s) elegível(is).`}
          </p>
        ) : null}

        {presetsData && presetsData.presets.length > 0 ? (
          <section>
            <p className="privacy-note">Meus presets</p>
            <div className="training-actions">
              {presetsData.presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className="training-action"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <button type="button" className="secondary-action" onClick={() => void savePreset()}>
          Salvar preset atual
        </button>
      </section>
    </main>
  );
}
