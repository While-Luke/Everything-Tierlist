import { useDroppable } from "@dnd-kit/core";
import WordCard from "./WordCard";

type Props = {
  name: string;
  words: string[];
};

export default function TierRow({
  name,
  words,
}: Props) {
  const { setNodeRef } = useDroppable({
    id: name,
  });

  return (
    <div className={`tier-row tier-${name}`}>
      <div className="tier-label">
        {name}
      </div>

      <div
        ref={setNodeRef}
        className="tier-content"
      >
        {words.map(word => (
          <WordCard key={word} word={word} />
        ))}
      </div>
    </div>
  );
}