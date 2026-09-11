import { createClient } from "@supabase/supabase-js";

export type Place = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  google_place_id: string | null;
  list_name: string;
  category: string | null;
  note: string | null;
  address: string | null;
  maps_url: string | null;
  rating: number | null;
  user_rating_count: number | null;
  editorial_summary: string | null;
};

export const supabaseConfigured = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY
);

// Server-only client. The publishable key never reaches the browser; the app itself is
// already gated by Google sign-in, and the places table only allows reads for this key.
function client() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
}

export async function fetchPlaces(): Promise<Place[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await client()
    .from("places")
    .select(
      "id,name,lat,lng,google_place_id,list_name,category,note,address,maps_url,rating,user_rating_count,editorial_summary"
    )
    .order("list_name")
    .order("name");
  if (error) {
    console.error("fetchPlaces:", error.message);
    return [];
  }
  return data ?? [];
}

// One colour per list so markers and chips match. Falls back through the palette.
const LIST_COLOURS = ["#d4a857", "#e8927c", "#7cc4e8", "#9fd48a", "#c79be8", "#e8d27c"];

export function colourForList(listName: string, lists: string[]): string {
  const i = Math.max(0, lists.indexOf(listName));
  return LIST_COLOURS[i % LIST_COLOURS.length];
}
