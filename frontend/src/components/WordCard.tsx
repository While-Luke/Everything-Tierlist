import { useDraggable } from "@dnd-kit/core";

export default function WordCard({
  word,
}: {
  word: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: word,
    });

  const style = {
    opacity: isDragging ? 0 : 1,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  };

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