// Données et règles du site Thed, sans dépendance au framework (testées avec `node --test`).

export const LINKS = {
  instagram: "https://www.instagram.com/thed.nw/",
  tiktok: "https://www.tiktok.com/@thed.nw",
  youtube: "https://youtube.com/@theeeed",
  spotify: "https://open.spotify.com/artist/3gFZrEpUIUphZLOUPOBD85",
  appleMusic: "https://music.apple.com/fr/artist/thed/1663638634",
  deezer: "https://www.deezer.com/fr/artist/198140397",
  shotgun: "https://shotgun.live/fr/events/thed",
  bandsintown: "https://www.bandsintown.com/",
  epSmartLink: "https://ffm.to/premire-leon-de-vol",
  liveSession: "https://www.youtube.com/watch?v=-kaA9M5-M_I",
} as const;

export const APPLE_ARTIST_ID = "1663638634";
export const BANDSINTOWN_ARTIST = "Thed";

/* ---------- Dernière sortie (Apple, iTunes lookup) ---------- */

export type Release = {
  /** « Nouvel EP », « Nouveau single », « Dernier EP »… */
  tag: string;
  title: string;
  href: string;
  cover: string | null;
};

export const FALLBACK_RELEASE: Release = {
  tag: "Nouvel EP",
  title: "Première leçon de vol",
  href: LINKS.epSmartLink,
  cover: null,
};

type ItunesItem = {
  wrapperType?: string;
  collectionName?: string;
  releaseDate?: string;
  trackCount?: number;
  artworkUrl100?: string;
};

/** Choisit la sortie la plus récente déjà parue et la met en forme pour le bandeau. */
export function pickLatestRelease(results: readonly ItunesItem[], now = new Date()): Release | null {
  const last = results
    .filter(
      (item) =>
        item.wrapperType === "collection" &&
        item.collectionName &&
        item.releaseDate &&
        new Date(item.releaseDate) <= now,
    )
    .sort((a, b) => (b.releaseDate ?? "").localeCompare(a.releaseDate ?? ""))[0];
  if (!last?.collectionName || !last.releaseDate) return null;

  const match = last.collectionName.match(/^(.*?)\s+-\s+(EP|Single)$/i);
  const title = (match?.[1] ?? last.collectionName).normalize("NFC");
  const kind = match?.[2]
    ? match[2].toLowerCase() === "ep"
      ? "EP"
      : "single"
    : (last.trackCount ?? 0) > 7
      ? "album"
      : "EP";
  const fresh = (now.getTime() - new Date(last.releaseDate).getTime()) / 864e5 < 90;
  const tag = fresh
    ? kind === "single"
      ? "Nouveau single"
      : `Nouvel ${kind}`
    : kind === "single"
      ? "Dernier single"
      : `Dernier ${kind}`;
  const isEP = /premi[eè]re le[cç]on de vol/i.test(title);

  return {
    tag,
    title,
    href: isEP ? LINKS.epSmartLink : LINKS.spotify,
    cover: last.artworkUrl100?.replace("100x100bb", "60x60bb") ?? null,
  };
}

/* ---------- Concerts (Bandsintown) ---------- */

export type Gig = {
  id: string;
  datetime: string;
  title: string | null;
  venue: string | null;
  place: string;
  ticketUrl: string | null;
  soldOut: boolean;
  url: string | null;
};

type BandsintownEvent = {
  id?: string | number;
  datetime?: string;
  title?: string;
  url?: string;
  venue?: { name?: string; city?: string; country?: string };
  offers?: Array<{ type?: string; url?: string; status?: string }>;
};

export function toGig(event: BandsintownEvent, index = 0): Gig | null {
  if (!event.datetime) return null;
  const venue = event.venue ?? {};
  const tickets = (event.offers ?? []).find(
    (offer) => /ticket/i.test(offer.type ?? "Tickets") && offer.url,
  );
  const place = [venue.city, venue.country && venue.country !== "France" ? venue.country : ""]
    .filter(Boolean)
    .join(", ");
  return {
    id: String(event.id ?? `${event.datetime}-${index}`),
    datetime: event.datetime,
    title: event.title?.trim() || null,
    venue: venue.name?.trim() || null,
    place: place || venue.name || "",
    ticketUrl: tickets?.url ?? null,
    soldOut: tickets?.status === "sold out",
    url: event.url ?? null,
  };
}

export function toGigs(events: unknown): Gig[] | null {
  if (!Array.isArray(events)) return null;
  return events.map((event, index) => toGig(event as BandsintownEvent, index)).filter((gig) => gig !== null);
}

/** Dates de démo tant que le profil Bandsintown de Thed n'existe pas. */
export const DEMO_GIGS: Gig[] = [
  {
    id: "demo-paris",
    datetime: "2027-02-14T20:00:00",
    title: null,
    venue: "Salle à confirmer",
    place: "Paris",
    ticketUrl: LINKS.shotgun,
    soldOut: false,
    url: null,
  },
  {
    id: "demo-lyon",
    datetime: "2027-03-07T20:00:00",
    title: null,
    venue: "Salle à confirmer",
    place: "Lyon",
    ticketUrl: LINKS.shotgun,
    soldOut: false,
    url: null,
  },
  {
    id: "demo-bruxelles",
    datetime: "2027-04-03T20:00:00",
    title: null,
    venue: "Salle à confirmer",
    place: "Bruxelles, Belgique",
    ticketUrl: null,
    soldOut: false,
    url: null,
  },
  {
    id: "demo-release",
    datetime: "2026-11-19T20:00:00",
    title: "Release party de l'EP",
    venue: "La Java",
    place: "Paris",
    ticketUrl: null,
    soldOut: false,
    url: null,
  },
];

/** Sépare les dates à venir (un concert reste « à venir » jusqu'au lendemain matin) et les 3 dernières passées. */
export function splitGigs(gigs: readonly Gig[], now = new Date()) {
  const limit = now.getTime() - 12 * 3600e3;
  const time = (gig: Gig) => new Date(gig.datetime).getTime();
  const upcoming = gigs.filter((gig) => time(gig) >= limit).sort((a, b) => time(a) - time(b));
  const past = gigs
    .filter((gig) => time(gig) < limit)
    .sort((a, b) => time(b) - time(a))
    .slice(0, 3);
  return { upcoming, past };
}

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/** « 14 » + « févr. 27 », lu depuis la date locale de l'événement (sans fuseau). */
export function gigDateParts(datetime: string) {
  const [date = ""] = datetime.split("T");
  const [year = "", month = "1", day = ""] = date.split("-");
  return { day: day.padStart(2, "0"), month: `${MONTHS[Number(month) - 1] ?? ""} ${year.slice(2)}` };
}

/* ---------- Divers ---------- */

/** « 30,00 € » → « 30 € » ; garde les centimes quand il y en a. */
export function shortPrice(formatted: string): string {
  return formatted.replace(/[,.]00(?=\D*$)/, "");
}

/** Nom d'option affiché : « Size » → « Taille », y compris dans un pack (« T-shirt … (Size) »). */
export function optionLabel(name: string): string {
  if (/\b(size|taille)\b/i.test(name)) return "Taille";
  if (/\b(colou?r|couleur)\b/i.test(name)) return "Couleur";
  return name;
}

/** Badge d'une carte produit, lu dans les tags Shopify : `badge:Nouveau`. */
export function badgeFromTags(tags: readonly string[]): string | null {
  const tag = tags.find((value) => value.toLowerCase().startsWith("badge:"));
  return tag ? tag.slice("badge:".length).trim() || null : null;
}
