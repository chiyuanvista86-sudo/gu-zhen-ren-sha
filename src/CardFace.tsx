import { CardIllustration } from "./ClassicArt";
import { CARDS, isRed } from "./data";
import type { Card } from "./data";

export function CardFace({ card }: { card: Card }) {
  const info = CARDS[card.kind];
  return (
    <div
      className={`card-face card-${card.kind} ${isRed(card) ? "red-suit" : "black-suit"}`}
    >
      <span className="card-corner">
        {card.rank}
        <small>{card.suit}</small>
      </span>
      <span className="card-category">{info.category}</span>
      <strong className="card-name">{info.name}</strong>
      <CardIllustration kind={card.kind} />
      <span className="card-bottom">
        <i>蛊</i>
        <span>{info.name}</span>
        <small>{info.category}</small>
      </span>
    </div>
  );
}
