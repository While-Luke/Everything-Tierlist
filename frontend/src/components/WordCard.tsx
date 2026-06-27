import { useDraggable } from "@dnd-kit/core";

export default function WordCard({
  word,
}: {
  word: string;
}) {
  const { attributes, listeners, setNodeRef, transform } =
    useDraggable({
      id: word,
    });

  const style = transform
    ? {
        transform: `translate3d(
          ${transform.x}px,
          ${transform.y}px,
          0
        )`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="word-card"
    >
      {word}
    </div>
  );
}