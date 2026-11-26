import {
  AnalyticsEvent,
  buildProductSelectionSearchParams,
  canAddToCart,
  getSelectedProductOptions,
  gql,
  type SelectedOption,
} from "@shopify/hydrogen";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router";

import { ProductCard, PRODUCT_CARD_FRAGMENT } from "~/components/ProductCard";
import { openCartDrawer } from "~/lib/cart-drawer";
import { formatPrice } from "~/lib/money";
import { ProductProvider, useProductForm } from "~/lib/product";
import { storefrontClientContext } from "~/lib/storefront";
import { shortPrice } from "~/lib/thed-data";

import type { Route } from "./+types/product";

const PRODUCT_VARIANT_FRAGMENT = gql(`
  fragment ProductVariantFields on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    selectedOptions {
      name
      value
    }
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    image {
      id
      url
      altText
      width
      height
    }
    product {
      title
      handle
    }
    sku
  }
`);

const PRODUCT_QUERY = gql(
  `
    query ProductPage($handle: String!, $selectedOptions: [SelectedOptionInput!]!) {
      product(handle: $handle) {
        id
        handle
        title
        vendor
        description
        descriptionHtml
        requiresSellingPlan
        encodedVariantExistence
        encodedVariantAvailability
        featuredImage {
          id
          url
          altText
          width
          height
        }
        images(first: 8) {
          nodes {
            id
            url
            altText
            width
            height
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
        options {
          name
          optionValues {
            name
            firstSelectableVariant {
              ...ProductVariantFields
            }
            swatch {
              color
              image {
                previewImage {
                  url
                }
              }
            }
          }
        }
        selectedOrFirstAvailableVariant(
          selectedOptions: $selectedOptions
          ignoreUnknownOptions: true
          caseInsensitiveMatch: true
        ) {
          ...ProductVariantFields
        }
        adjacentVariants(
          selectedOptions: $selectedOptions
          ignoreUnknownOptions: true
          caseInsensitiveMatch: true
        ) {
          ...ProductVariantFields
        }
      }
      products(first: 5) {
        nodes {
          ...ProductCard
        }
      }
    }
  `,
  [PRODUCT_VARIANT_FRAGMENT, PRODUCT_CARD_FRAGMENT],
);

export function meta({ data }: Route.MetaArgs) {
  const product = data?.product;
  if (!product) return [{ title: "Thed" }];
  const image = product.featuredImage?.url;
  return [
    { title: `${product.title} · Thed` },
    { name: "description", content: product.description.slice(0, 160) },
    { property: "og:title", content: product.title },
    ...(image ? [{ property: "og:image", content: image }] : []),
  ];
}

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) throw new Response("Not Found", { status: 404 });

  const storefrontClient = context.get(storefrontClientContext);
  const selectedOptions = getSelectedProductOptions({
    searchParams: new URL(request.url).searchParams,
  });
  const { data } = await storefrontClient.graphql(PRODUCT_QUERY, {
    variables: { handle, selectedOptions },
  });

  if (!data?.product) throw new Response("Not Found", { status: 404 });

  return {
    product: data.product,
    relatedProducts: data.products.nodes
      .filter((product) => product.handle !== data.product?.handle)
      .slice(0, 4),
  };
}

type ProductData = Route.ComponentProps["loaderData"]["product"];
type ProductVariant = NonNullable<ProductData["selectedOrFirstAvailableVariant"]>;
type RelatedProduct = Route.ComponentProps["loaderData"]["relatedProducts"][number];

type ProductImage = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

function toRouterLocation(url: string) {
  return url;
}

function variantUrl(
  product: { handle: string; options: Array<{ name: string }> },
  selectedOptions: SelectedOption[],
  handle = product.handle,
  base: URLSearchParams = new URLSearchParams(),
) {
  const params = buildProductSelectionSearchParams({
    selectedOptions,
    optionNames: product.options.map((option) => option.name),
    base,
  });
  const query = params.toString();
  return `/products/${handle}${query ? `?${query}` : ""}`;
}

function ProductViewedTracker({ product }: { product: ProductData }) {
  useEffect(() => {
    const selectedVariant = product.selectedOrFirstAvailableVariant;
    window.Shopify?.analytics?.publish(AnalyticsEvent.PRODUCT_VIEWED, {
      products: [
        {
          id: product.id,
          title: product.title,
          price: selectedVariant?.price ?? product.priceRange.minVariantPrice,
          vendor: product.vendor ?? "",
          variantId: selectedVariant?.id ?? product.id,
          variantTitle: selectedVariant?.title ?? product.title,
          quantity: 1,
          sku: selectedVariant?.sku,
        },
      ],
    });
  }, [product]);

  return null;
}


const OPTION_LABELS: Record<string, string> = { size: "Taille", color: "Couleur", couleur: "Couleur" };

function optionLabel(name: string) {
  return OPTION_LABELS[name.toLowerCase()] ?? name;
}

function useGalleryImages(product: ProductData, selectedVariant: ProductVariant | null) {
  return useMemo(() => {
    const images: ProductImage[] = [];
    const seen = new Set<string>();
    const addImage = (image: ProductImage | null | undefined) => {
      if (!image?.url || seen.has(image.url)) return;
      seen.add(image.url);
      images.push(image);
    };
    addImage(selectedVariant?.image ?? product.featuredImage ?? product.images.nodes[0]);
    for (const image of product.images.nodes) addImage(image);
    return images;
  }, [product, selectedVariant]);
}

/** Galerie en carrousel (glisser au doigt, ou toucher pour passer à la photo suivante). */
function Gallery({ product, selectedVariant }: { product: ProductData; selectedVariant: ProductVariant | null }) {
  const images = useGalleryImages(product, selectedVariant);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const first = images[0]?.url;

  useEffect(() => {
    setActive(0);
    track.current?.scrollTo({ left: 0 });
  }, [first]);

  const next = () => {
    const el = track.current;
    if (!el || images.length < 2) return;
    const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
    el.scrollTo({ left: end ? 0 : el.scrollLeft + el.clientWidth, behavior: "smooth" });
  };

  return (
    <div data-testid="product-gallery">
      <div
        ref={track}
        className="t-gal"
        role="region"
        aria-roledescription="carrousel"
        aria-label={`Photos : ${product.title}`}
        tabIndex={0}
        onClick={next}
        onScroll={(event) => {
          const el = event.currentTarget;
          if (el.clientWidth > 0) setActive(Math.round(el.scrollLeft / el.clientWidth));
        }}
      >
        {images.length ? (
          images.map((image, index) => (
            <div key={image.url} className="t-media">
              <img
                src={image.url}
                alt={image.altText ?? product.title}
                width={image.width ?? undefined}
                height={image.height ?? undefined}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                data-testid={index === 0 ? "product-gallery-image" : undefined}
              />
            </div>
          ))
        ) : (
          <div className="t-media">
            <span className="t-placeholder">Photo à venir</span>
          </div>
        )}
      </div>
      <div className="t-gdots" aria-hidden="true">
        {images.length > 1 ? images.map((image, index) => <i key={image.url} className={index === active ? "t-on" : undefined} />) : null}
      </div>
    </div>
  );
}

// Même garde que le Link de React Router : un clic modifié (nouvel onglet…) reste au navigateur.
function isPlainActivation(event: MouseEvent<HTMLAnchorElement>) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    (!event.currentTarget.target || event.currentTarget.target === "_self")
  );
}

/** Choix de la taille (ou autre option). Les produits sans variante n'affichent rien. */
function VariantOptions({ product }: { product: ProductData }) {
  const { options, register } = useProductForm();
  const location = useLocation();
  const baseParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const visible = options.filter((option) => option.values.length > 1 || option.values[0]?.name !== "Default Title");

  return (
    <>
      {visible.map((option) => {
        const selected = option.values.find((value) => value.selected)?.name;
        return (
          <fieldset key={option.name} className="t-sizes-wrap" style={{ border: 0, margin: 0, padding: 0 }}>
            <legend className="t-lbl">
              {optionLabel(option.name)}
              {selected ? ` : ${selected}` : ""}
            </legend>
            <div className="t-sizes" role="group" aria-label={optionLabel(option.name)}>
              {option.values.map((value) => {
                const registered = register("optionValue", { optionName: option.name, value: value.name });
                const isCrossProduct = value.handle !== product.handle;
                const soldOut = !value.available;
                const label = `${value.name}${soldOut ? " (épuisé)" : ""}`;

                if (!isCrossProduct && !value.exists) {
                  return (
                    <button key={value.name} type="button" className="t-size" disabled aria-pressed={value.selected}>
                      {value.name}
                    </button>
                  );
                }

                return (
                  <Link
                    key={value.name}
                    to={variantUrl(product, value.selectedOptions, value.handle, baseParams)}
                    replace={!isCrossProduct}
                    preventScrollReset
                    className="t-size"
                    aria-label={label}
                    aria-current={value.selected ? "true" : undefined}
                    aria-disabled={soldOut ? "true" : undefined}
                    onClick={
                      isCrossProduct
                        ? undefined
                        : (event) => {
                            if (!isPlainActivation(event)) return;
                            registered.onClick();
                            event.preventDefault();
                          }
                    }
                  >
                    {value.name}
                  </Link>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </>
  );
}

function AddToCart({ product, selectedVariant }: { product: ProductData; selectedVariant: ProductVariant | null }) {
  const { options, register, formProps, errors, pending } = useProductForm();
  const addable = canAddToCart(product, options);
  const label = pending ? "Ajout…" : addable ? "Ajouter au panier" : selectedVariant ? "Épuisé" : "Choisis une taille";
  const messages = [...errors.userErrors, ...errors.warnings, ...errors.networkErrors].map((error) => error.message);

  return (
    <form {...formProps({ afterSubmit: openCartDrawer })}>
      <input type="hidden" {...register("quantity", { value: 1 })} />
      <input type="hidden" {...register("merchandiseId", {})} />
      <button {...register("addToCart", {})} className="t-btn t-full" disabled={!addable || pending} data-testid="add-to-cart">
        {label}
      </button>
      {messages.length ? (
        <div className="t-errors" role="alert">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}
    </form>
  );
}

function ProductInfo({ product, selectedVariant }: { product: ProductData; selectedVariant: ProductVariant | null }) {
  const price = selectedVariant?.price ?? product.priceRange.minVariantPrice;
  const compareAt = selectedVariant?.compareAtPrice;
  const quantity = selectedVariant?.availableForSale ? selectedVariant.quantityAvailable : null;

  return (
    <div className="t-pv-info">
      <span className="t-lbl">Thed</span>
      <h1>{product.title}</h1>
      <div className="t-price" data-product-price>
        {shortPrice(formatPrice(price))}
        {compareAt && Number(compareAt.amount) > Number(price.amount) ? <s>{shortPrice(formatPrice(compareAt))}</s> : null}
      </div>
      {product.descriptionHtml ? (
        <div className="t-desc" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      ) : (
        <p className="t-desc">{product.description}</p>
      )}
      <VariantOptions product={product} />
      {quantity != null && quantity > 0 && quantity <= 5 ? (
        <p className="t-stock">Plus que {quantity} en stock</p>
      ) : null}
      <AddToCart product={product} selectedVariant={selectedVariant} />
      <div className="t-ship">
        <span>Expédié sous 7 jours depuis Paris.</span>
        <span>Aussi en vente au stand merch des concerts.</span>
      </div>
    </div>
  );
}

function ProductPageContent({ product }: { product: ProductData }) {
  const { selectedVariant } = useProductForm();
  return (
    <div className="t-pv">
      <Gallery product={product} selectedVariant={selectedVariant} />
      <ProductInfo product={product} selectedVariant={selectedVariant} />
    </div>
  );
}

function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  if (products.length === 0) return null;
  return (
    <section className="t-section" aria-labelledby="related-title">
      <div className="t-shead">
        <h2 id="related-title" className="t-h2">
          Aussi dans le merch
        </h2>
      </div>
      <ul className="t-grid">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProductRoute({ loaderData }: Route.ComponentProps) {
  const { product, relatedProducts } = loaderData;
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ProductProvider
      product={product}
      onSelect={(result) => {
        const url = toRouterLocation(
          variantUrl(product, result.selectedOptions, result.selectedVariant?.product?.handle, new URLSearchParams(location.search)),
        );
        void navigate(url, {
          replace: true,
          preventScrollReset: true,
          ...(result.status === "resolved" ? { defaultShouldRevalidate: false } : {}),
        });
      }}
    >
      <ProductViewedTracker product={product} />
      <main className="t-main t-wrap t-product" id="main-content" tabIndex={-1}>
        <Link className="t-back" to="/#merch">
          ← Tout le merch
        </Link>
        <ProductPageContent product={product} />
        <RelatedProducts products={relatedProducts} />
      </main>
    </ProductProvider>
  );
}
