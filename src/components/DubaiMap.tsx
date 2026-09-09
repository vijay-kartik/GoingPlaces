"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";

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

type Props = { apiKey: string; mapId?: string };

export default function DubaiMap({ apiKey, mapId }: Props) {
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
      />
    </APIProvider>
  );
}
