import { gql } from "@shopify/hydrogen";
import { Link } from "react-router";

import { storefrontClientContext } from "~/lib/storefront";

import type { Route } from "./+types/policy";

// Pages légales rédigées dans l'admin Shopify (Paramètres > Politiques).
const POLICIES_QUERY = gql(`
  query Policies($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    shop {
      shippingPolicy { title body handle }
      refundPolicy { title body handle }
      privacyPolicy { title body handle }
      termsOfService { title body handle }
      termsOfSale { title body handle }
      legalNotice { title body handle }
    }
  }
`);

const FALLBACK_TITLES: Record<string, string> = {
  "shipping-policy": "Livraison",
  "refund-policy": "Retours et remboursements",
  "privacy-policy": "Confidentialité",
  "terms-of-service": "Conditions d'utilisation",
  "terms-of-sale": "Conditions générales de vente",
  "legal-notice": "Mentions légales",
};

export function meta({ data }: Route.MetaArgs) {
  return [{ title: `${data?.title ?? "Infos"} · Thed` }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const fallbackTitle = FALLBACK_TITLES[params.handle];
  if (!fallbackTitle) throw new Response("Not Found", { status: 404 });

  const storefrontClient = context.get(storefrontClientContext);
  const { data } = await storefrontClient.graphql(POLICIES_QUERY);
  const policy = Object.values(data?.shop ?? {}).find(
    (value) => value && typeof value === "object" && "handle" in value && value.handle === params.handle,
  ) as { title: string; body: string } | undefined;

  return { title: policy?.title ?? fallbackTitle, body: policy?.body ?? null };
}

export default function PolicyRoute({ loaderData }: Route.ComponentProps) {
  return (
    <main id="main-content" tabIndex={-1} className="t-main t-wrap t-page">
      <Link className="t-back" to="/">
        ← Retour
      </Link>
      <h1>{loaderData.title}</h1>
      {loaderData.body ? (
        <div className="t-rich" dangerouslySetInnerHTML={{ __html: loaderData.body }} />
      ) : (
        <p className="t-desc">Cette page arrive bientôt.</p>
      )}
    </main>
  );
}
