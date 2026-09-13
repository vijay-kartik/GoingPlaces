import { auth, authConfigured, isAllowed } from "@/auth";
import AppMenu from "@/components/AppMenu";
import Gate from "@/components/Gate";
import { arrivesNextDay, fetchTickets, formatDate, type Ticket } from "@/lib/tickets";

export default async function TicketsPage() {
  if (authConfigured) {
    const session = await auth();
    if (!isAllowed(session?.user?.email)) return <Gate />;
  }

  const tickets = await fetchTickets();

  return (
    <main className="mx-auto min-h-full w-full max-w-2xl px-4 pb-16 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="flex items-start justify-between gap-3 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Honeymoon trip
          </p>
          <h1 className="text-2xl font-semibold leading-tight">Flights</h1>
          <p className="mt-0.5 text-xs text-foreground/60">
            {tickets.length === 0
              ? "No tickets yet"
              : `${tickets.length} ${tickets.length === 1 ? "booking" : "bookings"}`}
          </p>
        </div>
        <AppMenu />
      </header>

      <div className="flex flex-col gap-6">
        {tickets.map((ticket) => (
          <BoardingPass key={ticket.id} ticket={ticket} />
        ))}
      </div>

      {tickets.length === 0 && (
        <p className="glass rounded-2xl p-4 text-sm text-foreground/70">
          No flights saved yet.
        </p>
      )}
    </main>
  );
}

function BoardingPass({ ticket }: { ticket: Ticket }) {
  return (
    <article className="glass relative rounded-3xl">
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <p className="text-sm font-semibold">{ticket.airline}</p>
          <p className="text-xs text-foreground/60">{ticket.flight_number}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
            PNR
          </p>
          <p className="font-mono text-base font-semibold tracking-widest text-gold">
            {ticket.pnr}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 px-5 py-5">
        <Endpoint
          time={ticket.depart_time}
          code={ticket.origin_code}
          city={ticket.origin_city}
          airport={ticket.origin_airport}
          terminal={ticket.origin_terminal}
          date={formatDate(ticket.depart_date)}
        />

        <div className="flex w-20 flex-col items-center gap-1 pt-1.5 sm:w-28">
          <span className="text-[10px] text-foreground/60">{ticket.duration}</span>
          <div className="flex w-full items-center gap-1">
            <span className="h-px flex-1 bg-sand/30" />
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden className="text-gold">
              <path
                fill="currentColor"
                d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
              />
            </svg>
            <span className="h-px flex-1 bg-sand/30" />
          </div>
          <span className="text-[10px] text-foreground/50">{ticket.stops}</span>
        </div>

        <Endpoint
          align="right"
          time={ticket.arrive_time}
          code={ticket.dest_code}
          city={ticket.dest_city}
          airport={ticket.dest_airport}
          terminal={ticket.dest_terminal}
          date={formatDate(ticket.arrive_date)}
          badge={arrivesNextDay(ticket) ? "+1 day" : null}
        />
      </div>

      {/* Perforation: notches punched out of the card edges, like a real stub. */}
      <div className="relative flex items-center" aria-hidden>
        <span className="absolute -left-2 h-4 w-4 rounded-full bg-background" />
        <span className="mx-5 h-px flex-1 border-t border-dashed border-sand/30" />
        <span className="absolute -right-2 h-4 w-4 rounded-full bg-background" />
      </div>

      <div className="px-5 pb-5 pt-4">
        <ul className="flex flex-col gap-2">
          {ticket.passengers.map((p) => (
            <li key={p.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate">{p.name}</span>
              <span className="shrink-0 text-xs text-foreground/60">
                {p.seat ? (
                  <>
                    Seat <span className="font-semibold text-foreground/90">{p.seat}</span>
                  </>
                ) : (
                  "Seat at check-in"
                )}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <Detail label="Class" value={[ticket.fare_type, ticket.cabin_class].filter(Boolean).join(" · ")} />
          <Detail label="Cabin bag" value={ticket.cabin_baggage} />
          <Detail label="Check-in bag" value={ticket.checkin_baggage} />
          <Detail label="Booking ID" value={ticket.booking_id} mono />
        </dl>

        {ticket.pdf_path && (
          <a
            href={`/api/tickets/${ticket.slug}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
              <path
                d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            Download ticket
          </a>
        )}
      </div>
    </article>
  );
}

function Endpoint({
  time,
  code,
  city,
  airport,
  terminal,
  date,
  align = "left",
  badge = null,
}: {
  time: string;
  code: string;
  city: string;
  airport: string | null;
  terminal: string | null;
  date: string;
  align?: "left" | "right";
  badge?: string | null;
}) {
  const right = align === "right";
  return (
    <div className={`min-w-0 ${right ? "text-right" : ""}`}>
      <p className="flex items-baseline gap-1.5 text-2xl font-semibold leading-none">
        {right && badge && (
          <span className="whitespace-nowrap text-[10px] font-semibold text-gold">{badge}</span>
        )}
        <span className={right ? "ml-auto" : ""}>{time}</span>
      </p>
      <p className="mt-1 text-sm font-semibold tracking-wider text-gold">{code}</p>
      <p className="truncate text-xs text-foreground/70">{city}</p>
      <p className="mt-1 text-[11px] text-foreground/50">{date}</p>
      {airport && <p className="truncate text-[11px] text-foreground/50">{airport}</p>}
      {terminal && <p className="text-[11px] text-foreground/50">{terminal}</p>}
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="min-w-0">
      <dt className="text-[10px] uppercase tracking-[0.15em] text-foreground/45">{label}</dt>
      <dd className={`truncate text-foreground/85 ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
