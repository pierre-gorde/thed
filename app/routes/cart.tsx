import { useEffect } from "react";

import { publishCartViewed } from "~/components/AnalyticsTrackers";
import { CartLineItem } from "~/components/CartDrawer";
import { useCart } from "~/lib/cart";
import { formatPrice } from "~/lib/money";
import { shortPrice } from "~/lib/thed-data";

// Page panier (sans JavaScript, ou lien direct). Le tiroir fait la même chose sur le site.
export function meta() {
  return [{ title: "Panier · Thed" }];
}

export default function CartRoute() {
  const cart = useCart((state) => state.data);
  const loading = useCart((state) => state.loading);
  const lines = cart.lines.nodes;

  useEffect(() => {
    publishCartViewed(cart);
  }, [cart]);

  return (
    <main id="main-content" tabIndex={-1} className="t-main t-wrap t-page">
      <h1 id="cart-page-title" tabIndex={-1}>
        Panier
      </h1>
      {loading ? <p className="t-empty">Chargement du panier…</p> : null}
      {!loading && lines.length === 0 ? <p className="t-empty">Ton panier est vide.</p> : null}
      {lines.length > 0 ? (
        <>
          <ul className="t-lines">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} emptyCartFocusId="cart-page-title" />
            ))}
          </ul>
          <div className="t-tot" style={{ marginTop: 20 }}>
            <div className="t-row">
              <span>Sous-total</span>
              <span>{shortPrice(formatPrice(cart.cost.subtotalAmount ?? cart.cost.totalAmount))}</span>
            </div>
            <p className="t-small">Livraison calculée au paiement.</p>
            {cart.checkoutUrl ? (
              <a href={cart.checkoutUrl} className="t-btn t-full">
                Paiement
              </a>
            ) : null}
          </div>
        </>
      ) : null}
    </main>
  );
}
