#!/usr/bin/env node
// Resolve a Google Maps "Saved" export (Takeout CSVs, one per list) into place rows.
//
//   node scripts/import-gmaps.mjs <dir-with-csvs> [--out places.import.json] [--region Dubai]
//   node scripts/import-gmaps.mjs <dir-with-csvs> --upsert     (needs SUPABASE_SERVICE_ROLE_KEY)
//
// Each CSV row has Title, Note, URL, Tags (Takeout naming varies slightly by year).
// The list name is the CSV file name. Coordinates come from the Places API (New):
// URL → place id when the link carries one, else a text search on "<title>, <region>".
// Env (reads .env.local automatically): GOOGLE_PLACES_API_KEY (falls back to
// NEXT_PUBLIC_GOOGLE_MAPS_API_KEY), SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { basename, extname, join } from "node:path";

loadDotEnv(".env.local");

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith("--"));
if (!dir) die("usage: import-gmaps.mjs <dir> [--out file] [--region Dubai] [--upsert]");
const out = flag("--out") ?? "places.import.json";
const region = flag("--region") ?? "Dubai";
const upsert = args.includes("--upsert");

const KEY = process.env.GOOGLE_PLACES_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (!KEY) die("set GOOGLE_PLACES_API_KEY (Places API (New) enabled)");

const FIELDS = "id,displayName,location,formattedAddress,googleMapsUri,primaryType";

const rows = [];
for (const file of readdirSync(dir).filter((f) => extname(f).toLowerCase() === ".csv")) {
  const list = basename(file, ".csv");
  for (const r of parseCsv(readFileSync(join(dir, file), "utf8"))) {
    const title = r.title || r.Title;
    if (!title) continue;
    rows.push({
      list_name: list,
      name: title,
      note: r.note || r.Note || r.comment || r.Comment || null,
      url: r.url || r.URL || r.item_content_url || null,
      tags: r.tags || r.Tags || null,
    });
  }
}
console.error(`${rows.length} rows across lists`);

const places = [];
for (const r of rows) {
  try {
    const p = await resolve(r);
    if (!p) {
      console.error(`  ✗ ${r.list_name} / ${r.name}`);
      continue;
    }
    places.push(p);
    console.error(`  ✓ ${r.list_name} / ${p.name}`);
  } catch (e) {
    console.error(`  ✗ ${r.list_name} / ${r.name}: ${e.message}`);
  }
}

writeFileSync(out, JSON.stringify(places, null, 2));
console.error(`wrote ${places.length} places → ${out}`);

if (upsert) {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) die("--upsert needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await sb.from("places").upsert(places, { onConflict: "google_place_id" });
  if (error) die(error.message);
  console.error(`upserted ${places.length} rows`);
}

// ---------------------------------------------------------------------------

async function resolve(r) {
  const id = placeIdFromUrl(r.url);
  const details = id ? await placeDetails(id) : await textSearch(`${r.name}, ${region}`);
  if (!details?.location) return null;
  return {
    google_place_id: details.id,
    name: details.displayName?.text ?? r.name,
    lat: details.location.latitude,
    lng: details.location.longitude,
    address: details.formattedAddress ?? null,
    maps_url: details.googleMapsUri ?? r.url ?? null,
    list_name: r.list_name,
    category: details.primaryType?.replace(/_/g, " ") ?? null,
    note: [r.note, r.tags].filter(Boolean).join(" · ") || null,
  };
}

function placeIdFromUrl(url) {
  if (!url) return null;
  const m = url.match(/[?&]query_place_id=([^&]+)/) ?? url.match(/!1s(ChIJ[^!]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

async function placeDetails(id) {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
    headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": FIELDS },
  });
  if (!res.ok) throw new Error(`details ${res.status}`);
  return res.json();
}

async function textSearch(textQuery) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": KEY,
      "X-Goog-FieldMask": FIELDS.split(",").map((f) => `places.${f}`).join(","),
    },
    body: JSON.stringify({ textQuery, pageSize: 1 }),
  });
  if (!res.ok) throw new Error(`search ${res.status}`);
  const j = await res.json();
  return j.places?.[0] ?? null;
}

// Minimal RFC-4180 parser: quoted fields, embedded commas/newlines, "" escapes.
function parseCsv(text) {
  const recs = [];
  let field = "", rec = [], q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { rec.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      rec.push(field); recs.push(rec); rec = []; field = "";
    } else field += c;
  }
  if (field || rec.length) { rec.push(field); recs.push(rec); }
  const [header, ...body] = recs.filter((r) => r.some((v) => v !== ""));
  const keys = header.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

function loadDotEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

function flag(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

function die(msg) {
  console.error(msg);
  process.exit(1);
}
