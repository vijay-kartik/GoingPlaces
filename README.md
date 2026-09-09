# Honeymoon Trip

A web app for our Dubai honeymoon. The main page is a full-screen, dark-styled Google Map of Dubai with floating UI on top and Google sign-in.

Stack: Next.js 16 (App Router, TypeScript, Tailwind 4) · `@vis.gl/react-google-maps` · Auth.js v5 (Google provider) · Vercel.

## Run locally

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev                   # http://localhost:3000
```

## Environment variables

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | yes | Google Cloud → APIs & Services → Credentials → API key (enable **Maps JavaScript API**) |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | no | Google Cloud → Maps Platform → Map Management. Enables the vector map (tilt/rotate). |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | for sign-in | OAuth 2.0 Client ID, type *Web application* |
| `AUTH_SECRET` | for sign-in | `npx auth secret` |

OAuth redirect URIs to register on the client:

- `http://localhost:3000/api/auth/callback/google`
- `https://<vercel-domain>/api/auth/callback/google`

Without the Maps key the page shows a setup card instead of the map. Without the OAuth vars the sign-in button is replaced by a "not configured" pill, so the map still works.

## Layout

```
src/
  auth.ts                       Auth.js config (Google provider)
  app/
    layout.tsx                  full-height shell
    page.tsx                    map + floating header + user menu
    api/auth/[...nextauth]/     Auth.js route handlers
  components/
    DubaiMap.tsx                Google Map (client component)
    UserMenu.tsx                sign-in / avatar (server component)
```

## Deploy

Import the repo in Vercel, add the env vars above in Project Settings → Environment Variables, deploy. Then add the Vercel domain to the Maps key's HTTP-referrer restriction and to the OAuth client's redirect URIs.
