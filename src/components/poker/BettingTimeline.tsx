export type TimelineStep = {
  id: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
};

export function BettingTimeline({ steps, onSelect }: { steps: TimelineStep[]; onSelect?: (id: string) => void }) {
  return (
    <nav className="betting-timeline" aria-label="Árvore de ações pré-flop">
      <ol>
        {steps.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              className={`betting-timeline-step ${step.active ? 'betting-timeline-step-active' : ''}`}
              disabled={step.disabled}
              onClick={() => onSelect?.(step.id)}
              aria-current={step.active ? 'step' : undefined}
            >
              {step.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
