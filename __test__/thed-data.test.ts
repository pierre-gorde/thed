import assert from "node:assert/strict";
import test from "node:test";

import {
  DEMO_GIGS,
  FALLBACK_RELEASE,
  LINKS,
  badgeFromTags,
  optionLabel,
  gigDateParts,
  pickLatestRelease,
  shortPrice,
  splitGigs,
  toGigs,
} from "../app/lib/thed-data.ts";

const NOW = new Date("2026-11-26T12:00:00Z");

test("bandeau : prend la dernière sortie déjà parue", () => {
  const release = pickLatestRelease(
    [
      { wrapperType: "artist" },
      { wrapperType: "collection", collectionName: "Ancien - Single", releaseDate: "2025-03-01T08:00:00Z" },
      { wrapperType: "collection", collectionName: "Première leçon de vol - EP", releaseDate: "2026-11-14T08:00:00Z", artworkUrl100: "https://is1-ssl.mzstatic.com/a/100x100bb.jpg" },
      { wrapperType: "collection", collectionName: "Pas encore sorti - Single", releaseDate: "2027-01-01T08:00:00Z" },
    ],
    NOW,
  );
  assert.deepEqual(release, {
    tag: "Nouvel EP",
    title: "Première leçon de vol",
    href: LINKS.epSmartLink,
    cover: "https://is1-ssl.mzstatic.com/a/60x60bb.jpg",
  });
});

test("bandeau : un vieux single renvoie vers Spotify", () => {
  const release = pickLatestRelease(
    [{ wrapperType: "collection", collectionName: "Titre - Single", releaseDate: "2026-01-10T08:00:00Z" }],
    NOW,
  );
  assert.equal(release?.tag, "Dernier single");
  assert.equal(release?.href, LINKS.spotify);
  assert.equal(pickLatestRelease([], NOW), null);
  assert.equal(FALLBACK_RELEASE.title, "Première leçon de vol");
});

test("concerts : convertit la réponse Bandsintown", () => {
  const gigs = toGigs([
    {
      id: 1,
      datetime: "2027-02-14T20:00:00",
      venue: { name: "La Maroquinerie", city: "Paris", country: "France" },
      offers: [{ type: "Tickets", url: "https://billets", status: "available" }],
    },
    { id: 2, datetime: "2027-03-01T20:00:00", venue: { city: "Bruxelles", country: "Belgium" }, offers: [{ type: "Tickets", url: "https://x", status: "sold out" }] },
    { id: 3 },
  ]);
  assert.equal(gigs?.length, 2);
  assert.equal(gigs?.[0]?.place, "Paris");
  assert.equal(gigs?.[0]?.ticketUrl, "https://billets");
  assert.equal(gigs?.[1]?.place, "Bruxelles, Belgium");
  assert.equal(gigs?.[1]?.soldOut, true);
  assert.equal(toGigs({ errorMessage: "nope" }), null);
});

test("concerts : sépare à venir et passés", () => {
  const { upcoming, past } = splitGigs(DEMO_GIGS, NOW);
  assert.deepEqual(upcoming.map((gig) => gig.place), ["Paris", "Lyon", "Bruxelles, Belgique"]);
  assert.deepEqual(past.map((gig) => gig.id), ["demo-release"]);
  assert.deepEqual(gigDateParts("2027-02-14T20:00:00"), { day: "14", month: "févr. 27" });
});

test("prix courts et badges", () => {
  assert.equal(shortPrice("30,00 €"), "30 €");
  assert.equal(shortPrice("19,90 €"), "19,90 €");
  assert.equal(badgeFromTags(["merch", "badge:Tirage limité"]), "Tirage limité");
  assert.equal(badgeFromTags(["merch"]), null);
});

test("optionLabel traduit la taille, aussi dans un pack", () => {
  assert.equal(optionLabel("Size"), "Taille");
  assert.equal(optionLabel("T-shirt Première leçon de vol (Size)"), "Taille");
  assert.equal(optionLabel("Color"), "Couleur");
  assert.equal(optionLabel("Format"), "Format");
});
