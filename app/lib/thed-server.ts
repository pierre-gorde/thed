import { Cache, createFetchWithCache, type CacheInstance } from "@shopify/hydrogen";

import {
  APPLE_ARTIST_ID,
  BANDSINTOWN_ARTIST,
  DEMO_GIGS,
  FALLBACK_RELEASE,
  pickLatestRelease,
  toGigs,
  type Gig,
  type Release,
} from "~/lib/thed-data";

// Appels serveur vers Apple et Bandsintown, en cache 1 h (et resservis jusqu'à 1 jour si l'API tombe).
const HOURLY = Cache({ maxAge: { hours: 1 }, staleWhileRevalidate: { hours: 1 }, staleIfError: { days: 1 } });
const TIMEOUT_MS = 4000;

type CacheDeps = { cache: CacheInstance; waitUntil: ExecutionContext["waitUntil"] };

function cachedFetch({ cache, waitUntil }: CacheDeps) {
  return createFetchWithCache({ cache, waitUntil });
}

export async function getLatestRelease(deps: CacheDeps): Promise<Release> {
  try {
    const url = `https://itunes.apple.com/lookup?id=${APPLE_ARTIST_ID}&entity=album&sort=recent&country=fr&limit=25`;
    const response = await cachedFetch(deps)(
      url,
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
      { key: ["apple-latest-release", APPLE_ARTIST_ID], strategy: HOURLY },
    );
    if (!response.ok) throw new Error(`Apple ${response.status}`);
    const { results } = (await response.json()) as { results?: unknown[] };
    return pickLatestRelease((results ?? []) as Parameters<typeof pickLatestRelease>[0]) ?? FALLBACK_RELEASE;
  } catch (error) {
    console.warn("Dernière sortie indisponible, bandeau par défaut.", error);
    return FALLBACK_RELEASE;
  }
}

export type GigsResult = { gigs: Gig[]; live: boolean; followUrl: string | null };

/** Concerts Bandsintown. Sans clé (`BANDSINTOWN_APP_ID`) ou en cas d'erreur : dates de démo. */
export async function getGigs(deps: CacheDeps, appId: string | undefined): Promise<GigsResult> {
  const demo: GigsResult = { gigs: DEMO_GIGS, live: false, followUrl: null };
  if (!appId) return demo;

  try {
    const fetchWithCache = cachedFetch(deps);
    const base = `https://rest.bandsintown.com/artists/${encodeURIComponent(BANDSINTOWN_ARTIST)}`;
    const get = (path: string) =>
      fetchWithCache(
        `${base}${path}${path.includes("?") ? "&" : "?"}app_id=${encodeURIComponent(appId)}`,
        { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: "application/json" } },
        { key: ["bandsintown", BANDSINTOWN_ARTIST, path], strategy: HOURLY },
      ).then((response) => (response.ok ? response.json() : Promise.reject(new Error(`Bandsintown ${response.status}`))));

    const [info, events] = await Promise.all([get("/"), get("/events?date=all")]);
    const gigs = toGigs(events);
    if (!gigs) throw new Error("Réponse Bandsintown inattendue");
    const url = (info as { url?: string } | null)?.url ?? null;
    return { gigs, live: true, followUrl: url ? `${url}${url.includes("?") ? "&" : "?"}trigger=track` : null };
  } catch (error) {
    console.warn("Concerts Bandsintown indisponibles, dates de démo.", error);
    return demo;
  }
}
