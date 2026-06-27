import { useDroppable } from "@dnd-kit/core";
import WordCard from "./WordCard";

import type { ReactNode } from "react";

type Props = {
  name: string;
  words: string[];
  footer?: ReactNode;
  hideLabel?: boolean;
};

export default function TierRow({
  name,
  words,
  footer,
  hideLabel = false,
}: Props) {
  const { setNodeRef } = useDroppable({
    id: name,
  });

  return (
    <div className={`tier-row tier-${name}`}>
      {!hideLabel && name ? <div className="tier-label">{name}</div> : null}

      <div
        ref={setNodeRef}
        className="tier-content"
      >
        {words.map((word) => (
          <WordCard key={word} word={word} />
        ))}
      </div>

      {footer ? <div className="tier-footer">{footer}</div> : null}
    </div>
  );
}