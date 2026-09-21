/** The agreed scope, presented as an open editorial list rather than a card. */
export function OfferDeliverables({ items }: { items: string[] }) {
  return <div className="offer-deliverables">
    <h3>What you receive</h3>
    <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
    <p className="offer-terms">We agree the deliverables, timeline and project price in writing before work begins.</p>
  </div>;
}
