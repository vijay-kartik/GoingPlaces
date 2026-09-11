import { auth, authConfigured, isAllowed } from "@/auth";
import AppMenu from "@/components/AppMenu";
import DubaiMap from "@/components/DubaiMap";
import Gate from "@/components/Gate";
import UserMenu from "@/components/UserMenu";
import { fetchPlaces } from "@/lib/places";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ place?: string }>;
}) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;
  const { place: focusId } = await searchParams;

  // Gate the whole page behind an invited Google account. When OAuth isn't configured
  // (local dev without credentials) the map is shown ungated so the UI can still be worked on.
  if (authConfigured) {
    const session = await auth();
    if (!isAllowed(session?.user?.email)) return <Gate />;
  }

  const places = await fetchPlaces();

  return (
    <main className="relative h-full w-full">
      {apiKey ? (
        <DubaiMap apiKey={apiKey} mapId={mapId} places={places} focusId={focusId} />
      ) : (
        <MissingKey />
      )}

      {/* Floating chrome over the map */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="glass pointer-events-auto rounded-2xl px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Honeymoon trip
          </p>
          <h1 className="text-xl font-semibold leading-tight">Dubai</h1>
          <p className="mt-0.5 text-xs text-foreground/60">
            {places.length === 0 ? "No places yet" : `${places.length} saved places`}
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <UserMenu />
          <AppMenu />
        </div>
      </div>
    </main>
  );
}

function MissingKey() {
  return (
    <div className="absolute inset-0 grid place-items-center p-6">
      <div className="glass max-w-md rounded-2xl p-6 text-sm leading-relaxed">
        <h2 className="mb-2 text-lg font-semibold">Map key missing</h2>
        <p className="text-foreground/80">
          Set <code className="text-sand">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in{" "}
          <code className="text-sand">.env.local</code> (or in Vercel project
          settings) and restart the dev server.
        </p>
      </div>
    </div>
  );
}
