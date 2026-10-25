
  const { data: presetsData, refetch: refetchPresets } = useQuery({
    queryKey: ['training', 'presets'],
    queryFn: fetchPresets,
  });

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
        </div>

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
