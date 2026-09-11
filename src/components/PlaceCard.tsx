"use client";

import type { Place } from "@/lib/places";

type Props = { place: Place; colour: string; onClose: () => void };

// Detail card for the selected marker, floating above the list chips.
export default function PlaceCard({ place, colour, onClose }: Props) {
  const mapsHref =
    place.maps_url ??
    (place.google_place_id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.google_place_id}`
      : `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[calc(3.75rem+max(1rem,env(safe-area-inset-bottom)))]">
      <div className="glass pointer-events-auto w-full max-w-md rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 h-3 w-3 shrink-0 rounded-full"
            style={{ background: colour }}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
              {place.list_name}
              {place.category ? ` · ${place.category}` : ""}
            </p>
            <h2 className="truncate text-lg font-semibold leading-tight">{place.name}</h2>
            {place.address && (
              <p className="mt-0.5 truncate text-xs text-foreground/60">{place.address}</p>
            )}
            {place.note && (
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{place.note}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-foreground/60 transition hover:bg-white/10 hover:text-foreground"
          >
            ×
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110"
          >
            Open in Google Maps
          </a>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-sand/30 px-4 py-2 text-sm font-medium transition hover:border-gold/60"
          >
            Directions
          </a>
        </div>
      </div>
    </div>
  );
}
