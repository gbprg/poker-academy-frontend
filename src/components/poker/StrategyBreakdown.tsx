type StrategyActionLike = {
  handClass: string;
  actionType: string;
  sizing?: number | null;
  frequency: number;
};

export function StrategyBreakdown({ actions }: { actions: StrategyActionLike[] }) {
  const groups = actions.reduce<Record<string, number>>((acc, action) => {
    const key = `${action.actionType}${action.sizing ? ` ${action.sizing}bb` : ''}`;
    acc[key] = (acc[key] ?? 0) + action.frequency;
    return acc;
  }, {});

  return (
    <section className="strategy-breakdown" aria-label="Breakdown de ações">
      <h3>Mixes</h3>
      <ul>
        {Object.entries(groups).map(([key, freq]) => (
          <li key={key}>
            <span>{key}</span>
            <span>{Math.round(freq * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
