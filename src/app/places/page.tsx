import Link from "next/link";
import { auth, authConfigured, isAllowed } from "@/auth";
import AppMenu from "@/components/AppMenu";
import Gate from "@/components/Gate";
import { colourForList, fetchPlaces, shortAddress, type Place } from "@/lib/places";

export default async function PlacesPage() {
  if (authConfigured) {
    const session = await auth();
    if (!isAllowed(session?.user?.email)) return <Gate />;
  }

  const places = await fetchPlaces();
  // Derived before any re-sorting so the colours match the map's pins.
  const lists = Array.from(new Set(places.map((p) => p.list_name)));

  return (
    <main className="mx-auto min-h-full w-full max-w-2xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-start justify-between gap-3 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Honeymoon trip
          </p>
          <h1 className="text-2xl font-semibold leading-tight">All places</h1>
          <p className="mt-0.5 text-xs text-foreground/60">
            {places.length === 0
              ? "No places yet"
              : `${places.length} across ${lists.length} ${lists.length === 1 ? "list" : "lists"}`}
          </p>
        </div>
        <AppMenu />
      </header>

      {lists.map((listName) => {
        const colour = colourForList(listName, lists);
        const rows = places
          .filter((p) => p.list_name === listName)
          .sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));

        return (
          <section key={listName} className="mb-8">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: colour }}
                aria-hidden
              />
              <h2 className="text-sm font-semibold tracking-wide">{listName}</h2>
              <span className="text-xs text-foreground/50">{rows.length}</span>
            </div>
            <ul className="flex flex-col gap-2">
              {rows.map((place) => (
                <li key={place.id}>
                  <PlaceRow place={place} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {places.length === 0 && (
        <p className="glass rounded-2xl p-4 text-sm text-foreground/70">
          Nothing saved yet.
        </p>
      )}
    </main>
  );
}

// Tapping a row returns to the map with this place selected.
function PlaceRow({ place }: { place: Place }) {
  return (
    <Link
      href={`/?place=${place.id}`}
      className="glass block rounded-2xl p-3.5 transition hover:border-gold/60"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 flex-1 truncate font-medium leading-tight">{place.name}</h3>
        {place.rating !== null && (
          <span className="shrink-0 text-xs text-foreground/70">
            <span aria-hidden className="text-gold">
              ★
            </span>{" "}
            <span className="font-semibold text-foreground/90">{place.rating.toFixed(1)}</span>
            {place.user_rating_count !== null && (
              <span className="text-foreground/50"> ({place.user_rating_count.toLocaleString()})</span>
            )}
          </span>
        )}
      </div>
      {(place.category || place.address) && (
        <p className="mt-0.5 truncate text-xs text-foreground/60">
          {[place.category, shortAddress(place.address)].filter(Boolean).join(" · ")}
        </p>
      )}
      {place.editorial_summary && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground/75">
          {place.editorial_summary}
        </p>
      )}
    </Link>
  );
}
