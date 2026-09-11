"use client";

import { colourForList } from "@/lib/places";

type Props = {
  lists: string[];
  hidden: Set<string>;
  counts: Record<string, number>;
  onToggle: (name: string) => void;
};

// Horizontal row of list toggles floating at the bottom of the map. Tapping a chip
// hides/shows that list's markers.
export default function ListChips({ lists, hidden, counts, onToggle }: Props) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {lists.map((name) => {
          const off = hidden.has(name);
          const colour = colourForList(name, lists);
          return (
            <button
              key={name}
              type="button"
              onClick={() => onToggle(name)}
              aria-pressed={!off}
              className={`glass flex shrink-0 items-center gap-2 rounded-full py-2 pl-3 pr-3.5 text-sm transition ${
                off ? "opacity-50" : ""
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: off ? "transparent" : colour, boxShadow: `0 0 0 2px ${colour}` }}
              />
              <span className="font-medium">{name}</span>
              <span className="text-xs text-foreground/60">{counts[name] ?? 0}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
