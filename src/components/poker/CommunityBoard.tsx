export function CommunityBoard({ cards }: { cards: Array<{ rank: string; suit: string }> | null | undefined }) {
  if (!cards || cards.length === 0) {
    return (
      <section className="community-board" aria-label="Board comunitário">
        <p className="privacy-note">Board não informado</p>
      </section>
    );
  }

  return (
    <section className="community-board" aria-label="Board comunitário">
      <div className="community-board-cards">
        {cards.map((card, index) => (
          <div key={`${card.rank}${card.suit}-${index}`} className="community-board-card">
            <span className="community-board-rank">{card.rank}</span>
            <span className="community-board-suit">{card.suit}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
