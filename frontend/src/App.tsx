import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  TouchSensor, 
  MouseSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { useEffect, useState, useRef } from "react";

import * as htmlToImage from "html-to-image";

import TierRow from "./components/TierRow";
import { WORDS } from "./words";

import "./styles.css";

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get a random sample of words, excluding used words
function getRandomWords(count: number, usedWords: Set<string>): string[] {
  const available = WORDS.filter((word) => !usedWords.has(word));
  const shuffled = shuffleArray(available);
  return shuffled.slice(0, Math.min(count, available.length));
}

const TIERS = ["S", "A", "B", "C", "D", "F"] as const;

const BATCH_SIZE = 10;

type TierName = (typeof TIERS)[number] | "unranked";

type TierState = Record<TierName, string[]>;

export default function App() {
  const [tiers, setTiers] = useState<TierState>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
    unranked: [],
  });

  const [activeWord, setActiveWord] = useState<string | null>(null);

  const [loadingMore, setLoadingMore] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    // Load initial batch of random words
    const initialWords = getRandomWords(BATCH_SIZE, new Set());
    setTiers((prev) => ({
      ...prev,
      unranked: initialWords,
    }));
  }, []);

  const loadMoreWords = () => {
    setLoadingMore(true);

    // Collect all used words
    const usedWords = new Set([
      ...tiers.unranked,
      ...tiers.S,
      ...tiers.A,
      ...tiers.B,
      ...tiers.C,
      ...tiers.D,
      ...tiers.F,
    ]);

    // Get new random words, excluding used ones
    const newWords = getRandomWords(BATCH_SIZE, usedWords);

    setTiers((prev) => ({
      ...prev,
      unranked: [...prev.unranked, ...newWords],
    }));

    setLoadingMore(false);
  };

  const isEmpty =
    tiers.unranked.length === 0 &&
    !loadingMore;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveWord(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const word = event.active.id as string;
    const tier = event.over?.id as TierName;

    setActiveWord(null);

    if (!tier) return;

    setTiers((prev) => {
      const next: TierState = structuredClone(prev);

      Object.keys(next).forEach((key) => {
        next[key as TierName] = next[key as TierName].filter(
          (w) => w !== word
        );
      });

      next[tier].push(word);

      return next;
    });
  };

  const exportRef = useRef<HTMLDivElement>(null);

  const [exporting, setExporting] = useState(false);

  const exportAsImage = async () => {
    if (!exportRef.current) return;

    setExporting(true);

    // wait for React to re-render without buttons
    await new Promise((r) => setTimeout(r, 50));

    const dataUrl = await htmlToImage.toPng(exportRef.current, {
      backgroundColor: "#111",
    });

    const link = document.createElement("a");
    link.download = "tier-list.png";
    link.href = dataUrl;
    link.click();

    setExporting(false);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="page">
        <div className="export-area" ref={exportRef}>
          {TIERS.map((tier) => (
            <TierRow key={tier} name={tier} words={tiers[tier]} />
          ))}
        
          {!exporting && isEmpty && (
            <div className="load-more-container">
              <button
                onClick={loadMoreWords}
                disabled={loadingMore}
                className="load-more-button"
              >
                {loadingMore ? "Loading..." : "Load 10 more words"}
              </button>
            </div>
          )}

          <TierRow name=" " words={tiers.unranked} />

        </div>

        {!exporting && (
          <button onClick={exportAsImage} className="export-btn">
            Export as Image
          </button>
        )}
      </div>

      <DragOverlay>
        {activeWord ? (
          <div className="word-card dragging">
            {activeWord}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}