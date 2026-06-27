import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { useEffect, useMemo, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

import TierRow from "./components/TierRow";
import { WORDS } from "./words";
import { type TierName, type TierState } from "./types";
import "./styles.css";

const TIERS = ["S", "A", "B", "C", "D", "F"] as const;
const BATCH_SIZE = 10;

const initialTiers: TierState = {
  S: [],
  A: [],
  B: [],
  C: [],
  D: [],
  F: [],
  unranked: [],
};

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getRandomWords(count: number, exclude: Set<string>): string[] {
  const available = WORDS.filter((word) => !exclude.has(word));
  return shuffleArray(available).slice(0, Math.min(count, available.length));
}

export default function App() {
  const [tiers, setTiers] = useState<TierState>(initialTiers);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exporting, setExporting] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    })
  );

  const usedWords = useMemo(() => new Set(Object.values(tiers).flat()), [tiers]);
  const hasMoreWords = usedWords.size < WORDS.length;
  const showLoadMoreButton = tiers.unranked.length === 0 && !loadingMore;

  useEffect(() => {
    const initialWords = getRandomWords(BATCH_SIZE, new Set());
    setTiers((prev) => ({ ...prev, unranked: initialWords }));
  }, []);

  const moveWordToTier = (word: string, targetTier: TierName) => {
    setTiers((prev) => {
      const next: TierState = structuredClone(prev);

      Object.keys(next).forEach((key) => {
        next[key as TierName] = next[key as TierName].filter((item) => item !== word);
      });

      next[targetTier].push(word);
      return next;
    });
  };

  const loadMoreWords = () => {
    if (!hasMoreWords) return;

    setLoadingMore(true);
    const newWords = getRandomWords(BATCH_SIZE, usedWords);

    setTiers((prev) => ({
      ...prev,
      unranked: [...prev.unranked, ...newWords],
    }));
    setLoadingMore(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveWord(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const word = event.active.id as string;
    const tier = event.over?.id as TierName;

    setActiveWord(null);
    if (!tier) return;

    moveWordToTier(word, tier);
  };

  const exportAsImage = async () => {
    if (!exportRef.current) return;

    setExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 50));

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
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="page">
        <div className="export-area" ref={exportRef}>
          {TIERS.map((tier) => (
            <TierRow key={tier} name={tier} words={tiers[tier]} />
          ))}

          <TierRow
            name="unranked"
            words={tiers.unranked}
            hideLabel
            footer={
              showLoadMoreButton ? (
                <button
                  type="button"
                  className="load-more-button"
                  onClick={loadMoreWords}
                  disabled={loadingMore || !hasMoreWords}
                >
                  {loadingMore
                    ? "Loading..."
                    : hasMoreWords
                    ? `Load ${BATCH_SIZE} more words`
                    : "No more words"}
                </button>
              ) : null
            }
          />
        </div>

        <div className="controls">
          {!exporting && (
            <button type="button" className="export-btn" onClick={exportAsImage}>
              Export as Image
            </button>
          )}
        </div>

        <DragOverlay>
          {activeWord ? <div className="word-card dragging">{activeWord}</div> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
