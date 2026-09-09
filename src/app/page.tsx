import DubaiMap from "@/components/DubaiMap";
import UserMenu from "@/components/UserMenu";

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID;

  return (
    <main className="relative h-full w-full">
      {apiKey ? <DubaiMap apiKey={apiKey} mapId={mapId} /> : <MissingKey />}

      {/* Floating chrome over the map */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="glass pointer-events-auto rounded-2xl px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Honeymoon trip
          </p>
          <h1 className="text-xl font-semibold leading-tight">Dubai</h1>
        </div>
        <div className="pointer-events-auto">
          <UserMenu />
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
