import { gql, type StorefrontApi } from "@shopify/hydrogen";
import { Link } from "react-router";

import { compareMoney, formatPrice } from "~/lib/money";
import { badgeFromTags, shortPrice } from "~/lib/thed-data";

export const PRODUCT_CARD_FRAGMENT = gql(`
  fragment ProductCard on Product {
    id
    handle
    title
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 2) {
      nodes {
        url
        altText
      }
    }
    availableForSale
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }
`);

const PRODUCT_CARD_SHAPE_QUERY = gql(
  `query ProductCardShape { products(first: 1) { nodes { ...ProductCard } } }`,
  [PRODUCT_CARD_FRAGMENT],
);

export type ProductCardData = StorefrontApi.ResultOf<
  typeof PRODUCT_CARD_SHAPE_QUERY
>["products"]["nodes"][number];

type ProductCardProps = {
  product: ProductCardData;
  priority?: boolean;
};

/** Carte produit « Thed · Merch » : 2 photos (la 2e au survol), badge, prix. */
export function ProductCard({ product, priority = false }: ProductCardProps) {
  const primaryImage = product.featuredImage ?? product.images.nodes[0] ?? null;
  const hoverImage = product.images.nodes.find((image) => image.url !== primaryImage?.url) ?? null;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const onSale = compareMoney(compareAt, price) > 0;
  const badge = !product.availableForSale ? "Épuisé" : badgeFromTags(product.tags);
  const priceText = shortPrice(formatPrice(price));

  return (
    <Link
      to={`/products/${product.handle}`}
      className="t-card"
      aria-label={`${product.title}, ${priceText}`}
      data-testid="product-card"
      prefetch="intent"
    >
      <div className="t-media">
        {badge ? <span className="t-badge">{badge}</span> : null}
        {primaryImage ? (
          <img
            className="t-shot"
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.title}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        ) : (
          <span className="t-placeholder">Photo à venir</span>
        )}
        {hoverImage ? (
          <img className="t-shot" src={hoverImage.url} alt="" loading="lazy" />
        ) : null}
      </div>
      <h3>{product.title}</h3>
      <div className="t-price">
        {priceText}
        {onSale ? <s>{shortPrice(formatPrice(compareAt))}</s> : null}
      </div>
    </Link>
  );
}
