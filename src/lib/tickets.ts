import { createClient } from "@supabase/supabase-js";

export type Passenger = {
  name: string;
  seat: string | null;
  eticket: string | null;
};

export type Ticket = {
  id: string;
  slug: string;
  airline: string;
  flight_number: string;
  pnr: string;
  booking_id: string | null;
  origin_city: string;
  origin_code: string;
  origin_airport: string | null;
  origin_terminal: string | null;
  dest_city: string;
  dest_code: string;
  dest_airport: string | null;
  dest_terminal: string | null;
  depart_date: string;
  depart_time: string;
  arrive_date: string;
  arrive_time: string;
  duration: string | null;
  stops: string | null;
  fare_type: string | null;
  cabin_class: string | null;
  cabin_baggage: string | null;
  checkin_baggage: string | null;
  passengers: Passenger[];
  pdf_path: string | null;
};

export const supabaseConfigured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY
);

function client() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
}

export async function fetchTickets(): Promise<Ticket[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await client()
    .from("tickets")
    .select("*")
    .order("depart_date");
  if (error) {
    console.error("fetchTickets:", error.message);
    return [];
  }
  return data ?? [];
}

// The bucket is private, so the bytes are fetched server-side and streamed to the
// signed-in traveller rather than exposed as a storage URL.
export async function downloadTicketPdf(slug: string) {
  if (!supabaseConfigured) return null;
  const sb = client();
  const { data: ticket } = await sb
    .from("tickets")
    .select("pdf_path")
    .eq("slug", slug)
    .maybeSingle();
  if (!ticket?.pdf_path) return null;

  const { data, error } = await sb.storage.from("tickets").download(ticket.pdf_path);
  if (error || !data) {
    console.error("downloadTicketPdf:", error?.message);
    return null;
  }
  return data;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Arriving the morning after a late departure is worth calling out on the card.
export function arrivesNextDay(t: Ticket): boolean {
  return t.arrive_date !== t.depart_date;
}
