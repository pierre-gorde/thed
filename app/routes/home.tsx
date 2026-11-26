import { gql } from "@shopify/hydrogen";
import { useMemo, useState } from "react";

import { AutoVideo } from "~/components/AutoVideo";
import { ProductCard, PRODUCT_CARD_FRAGMENT, type ProductCardData } from "~/components/ProductCard";
import { envContext } from "~/lib/env";
import {
  SITE_SETTINGS_HANDLE,
  SITE_SETTINGS_QUERY,
  SITE_SETTINGS_TYPE,
  normalizeSiteSettings,
} from "~/lib/site-settings";
import { storefrontClientContext } from "~/lib/storefront";
import { LINKS, gigDateParts, splitGigs, type Gig } from "~/lib/thed-data";
import { getGigs } from "~/lib/thed-server";

import type { Route } from "./+types/home";

// Ordre du merch : celui de la collection « accueil » si elle existe (modifiable dans l'admin),
// sinon les produits du plus récent au plus ancien.
const HOME_QUERY = gql(
  `
    query Home($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
      collection(handle: "accueil") {
        products(first: 24, sortKey: COLLECTION_DEFAULT) {
          nodes {
            ...ProductCard
          }
        }
      }
      products(first: 24, sortKey: CREATED_AT, reverse: true) {
        nodes {
          ...ProductCard
        }
      }
    }
  `,
  [PRODUCT_CARD_FRAGMENT],
);

export function meta() {
  return [
    { title: "Thed · Merch, concerts, live session" },
    {
      name: "description",
      content: "Le merch officiel de Thed (t-shirt et poster « Première leçon de vol »), les prochains concerts et la live session.",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.get(envContext);
  const storefrontClient = context.get(storefrontClientContext);
  const [home, settings, gigs] = await Promise.all([
    storefrontClient.graphql(HOME_QUERY),
    storefrontClient.graphql(SITE_SETTINGS_QUERY, {
      variables: { handle: { type: SITE_SETTINGS_TYPE, handle: SITE_SETTINGS_HANDLE } },
    }),
    getGigs({ cache: context.cache, waitUntil: context.waitUntil }, env.BANDSINTOWN_APP_ID),
  ]);

  const curated = home.data?.collection?.products.nodes ?? [];
  const products: ProductCardData[] = curated.length ? curated : (home.data?.products.nodes ?? []);

  return {
    products,
    settings: normalizeSiteSettings(settings.data),
    gigs,
  };
}

type Sort = "feat" | "asc" | "desc";

function Merch({ products }: { products: readonly ProductCardData[] }) {
  const [inStock, setInStock] = useState(false);
  const [under30, setUnder30] = useState(false);
  const [sort, setSort] = useState<Sort>("feat");

  const list = useMemo(() => {
    const price = (product: ProductCardData) => Number(product.priceRange.minVariantPrice.amount);
    let result = products.slice();
    if (inStock) result = result.filter((product) => product.availableForSale);
    if (under30) result = result.filter((product) => price(product) <= 30);
    if (sort === "asc") result.sort((a, b) => price(a) - price(b));
    if (sort === "desc") result.sort((a, b) => price(b) - price(a));
    return result;
  }, [products, inStock, under30, sort]);

  return (
    <section id="merch" className="t-section" aria-labelledby="merch-title">
      <div className="t-wrap">
        <div className="t-shead">
          <h2 id="merch-title" className="t-h2">
            Merch
          </h2>
        </div>
        <div className="t-toolbar">
          <div>
            <label>
              <span className="t-sr">Disponibilité</span>
              <select value={inStock ? "in" : "all"} onChange={(event) => setInStock(event.target.value === "in")}>
                <option value="all">Disponibilité</option>
                <option value="in">En stock</option>
              </select>
            </label>
            <label>
              <span className="t-sr">Prix</span>
              <select value={under30 ? "30" : "all"} onChange={(event) => setUnder30(event.target.value === "30")}>
                <option value="all">Prix</option>
                <option value="30">30 € ou moins</option>
              </select>
            </label>
          </div>
          <div>
            <span className="t-count" aria-live="polite">
              {list.length} article{list.length > 1 ? "s" : ""}
            </span>
            <label>
              <span className="t-sr">Trier</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
                <option value="feat">Trier</option>
                <option value="asc">Prix croissant</option>
                <option value="desc">Prix décroissant</option>
              </select>
            </label>
          </div>
        </div>
        {list.length ? (
          <ul className="t-grid">
            {list.map((product, index) => (
              <li key={product.id}>
                <ProductCard product={product} priority={index < 2} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="t-empty">{products.length ? "Aucun article ne correspond." : "Le merch arrive bientôt."}</p>
        )}
      </div>
    </section>
  );
}

function GigRow({ gig, past }: { gig: Gig; past: boolean }) {
  const { day, month } = gigDateParts(gig.datetime);
  const sub = [gig.title, gig.venue].filter(Boolean).join(" · ");
  return (
    <li className={past ? "t-past" : undefined}>
      <span className="t-d">
        <b>{day}</b>
        <small>{month}</small>
      </span>
      <span className="t-w">
        <b>{gig.place}</b>
        <span>{sub}</span>
      </span>
      {past ? (
        <span className="t-btn t-ghost t-sm" aria-disabled="true">
          Passé
        </span>
      ) : gig.soldOut ? (
        <span className="t-btn t-ghost t-sm" aria-disabled="true">
          Complet
        </span>
      ) : gig.ticketUrl ? (
        <a className="t-btn t-sm" href={gig.ticketUrl} target="_blank" rel="noopener">
          Billets
        </a>
      ) : (
        <a className="t-btn t-ghost t-sm" href={gig.url ?? LINKS.bandsintown} target="_blank" rel="noopener">
          Me prévenir
        </a>
      )}
    </li>
  );
}

function Concerts({ gigs, live, followUrl }: Route.ComponentProps["loaderData"]["gigs"]) {
  const { upcoming, past } = splitGigs(gigs);
  return (
    <div id="concerts">
      <div className="t-shead">
        <h2 className="t-h2">Concerts</h2>
        <a className="t-more" href={followUrl ?? LINKS.bandsintown} target="_blank" rel="noopener">
          Suivre sur Bandsintown
        </a>
      </div>
      <ul className="t-gigs">
        {upcoming.length ? (
          upcoming.map((gig) => <GigRow key={gig.id} gig={gig} past={false} />)
        ) : (
          <li className="t-empty-row">
            Pas de date annoncée pour l'instant. Suis Thed sur Bandsintown pour être prévenu.
          </li>
        )}
      </ul>
      {past.length ? (
        <>
          <p className="t-gigs-sub">Déjà passés</p>
          <ul className="t-gigs">
            {past.map((gig) => (
              <GigRow key={gig.id} gig={gig} past />
            ))}
          </ul>
        </>
      ) : null}
      {live ? null : (
        <p className="t-note">
          <span className="t-src">
            <i />
            Dates de démo : le profil Bandsintown de Thed n'est pas encore branché
          </span>
        </p>
      )}
    </div>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { settings } = loaderData;

  return (
    <main className="t-main" id="main-content" tabIndex={-1}>
      <div className="t-banner">
        <AutoVideo src={settings.introVideo} poster={settings.introImage} alt="Thed sur scène, face au public" />
      </div>

      <Merch products={loaderData.products} />

      <section className="t-section" aria-label="Concerts et live session">
        <div className="t-wrap t-split">
          <Concerts {...loaderData.gigs} />
          <div id="live">
            <div className="t-shead">
              <h2 className="t-h2">Live session</h2>
              <a className="t-more" href={LINKS.youtube} target="_blank" rel="noopener">
                Chaîne YouTube
              </a>
            </div>
            <figure className="t-clip">
              <AutoVideo src={settings.liveVideo} poster={settings.liveImage} alt="Thed en live session" />
              <figcaption>
                <span className="t-rec">
                  <i /> Live session
                </span>
                <a className="t-btn t-sm" href={settings.liveUrl} target="_blank" rel="noopener">
                  Voir en entier
                </a>
              </figcaption>
            </figure>
            <p className="t-live-lead">{settings.liveText}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
