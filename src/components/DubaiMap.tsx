"use client";

import { useMemo, useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { colourForList, type Place } from "@/lib/places";
import PlaceCard from "@/components/PlaceCard";
import ListChips from "@/components/ListChips";

// Roughly centred between Downtown, the Marina and the Palm.
export const DUBAI_CENTER = { lat: 25.15, lng: 55.23 };

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0f2434" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#c9b48a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1d2a" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1d3a4f" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0b1d2a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c526e" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#071520" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#13293a" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

// A teardrop pin as an SVG data URL, tinted per list. Classic markers accept these
// without needing a Map ID (which AdvancedMarker would require).
function pinIcon(colour: string, active: boolean) {
  const s = active ? 44 : 32;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" fill="${colour}" stroke="#0b1d2a" stroke-width="1.2"/>
    <circle cx="12" cy="9" r="2.6" fill="#0b1d2a"/>
  </svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: s, height: s, equals: () => false } as google.maps.Size,
    anchor: { x: s / 2, y: s, equals: () => false } as google.maps.Point,
  };
}

type Props = { apiKey: string; mapId?: string; places: Place[] };

export default function DubaiMap({ apiKey, mapId, places }: Props) {
  const lists = useMemo(
    () => Array.from(new Set(places.map((p) => p.list_name))),
    [places]
  );
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = places.filter((p) => !hidden.has(p.list_name));
  const selected = places.find((p) => p.id === selectedId) ?? null;

  function toggleList(name: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
    if (selected && selected.list_name === name) setSelectedId(null);
  }

  return (
    <APIProvider apiKey={apiKey} libraries={["places"]}>
      <Map
        className="absolute inset-0 h-full w-full"
        defaultCenter={DUBAI_CENTER}
        defaultZoom={11}
        minZoom={9}
        // A Map ID switches Google to a vector (WebGL) map, which supports tilt/rotation
        // and cloud-based styling. Without one we fall back to a raster map + inline styles.
        mapId={mapId || undefined}
        styles={mapId ? undefined : DARK_STYLE}
        colorScheme={mapId ? "DARK" : undefined}
        tilt={mapId ? 45 : undefined}
        gestureHandling="greedy"
        disableDefaultUI
        zoomControl={false}
        clickableIcons={false}
        reuseMaps
        onClick={() => setSelectedId(null)}
      >
        {visible.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            title={p.name}
            icon={pinIcon(colourForList(p.list_name, lists), p.id === selectedId)}
            zIndex={p.id === selectedId ? 1000 : undefined}
            onClick={() => setSelectedId(p.id)}
          />
        ))}
      </Map>

      {lists.length > 0 && (
        <ListChips lists={lists} hidden={hidden} onToggle={toggleList} counts={countBy(places)} />
      )}

      {selected && (
        <PlaceCard
          place={selected}
          colour={colourForList(selected.list_name, lists)}
          onClose={() => setSelectedId(null)}
        />
      )}
    </APIProvider>
  );
}

function countBy(places: Place[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of places) out[p.list_name] = (out[p.list_name] ?? 0) + 1;
  return out;
}
