import { useEffect, useRef } from "react";
import { Link } from "react-router";

import { useCart } from "~/lib/cart";
import { CART_DRAWER_ID, openDialogFromLinkClick } from "~/lib/cart-drawer";

import { Logo } from "./Logo";

export function Header() {
  const totalQuantity = useCart((state) => state.data.totalQuantity);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const previous = useRef(totalQuantity);

  // Petit rebond du compteur quand un article arrive dans le panier.
  useEffect(() => {
    const button = buttonRef.current;
    if (button && totalQuantity > previous.current) {
      button.classList.remove("t-bump");
      void button.offsetWidth;
      button.classList.add("t-bump");
    }
    previous.current = totalQuantity;
  }, [totalQuantity]);

  return (
    <header className="t-header">
      <div className="t-wrap">
        <Link className="t-logo" to="/" aria-label="Thed, accueil">
          <Logo />
        </Link>
        <nav className="t-nav" aria-label="Menu">
          <Link to="/#merch">Merch</Link>
          <Link to="/#concerts">Concerts</Link>
          <Link to="/#live">Live</Link>
        </nav>
        <Link
          ref={buttonRef}
          className="t-cartbtn"
          to="/cart"
          aria-label={`Ouvrir le panier (${totalQuantity} article${totalQuantity > 1 ? "s" : ""})`}
          aria-controls={CART_DRAWER_ID}
          aria-haspopup="dialog"
          data-testid="cart-trigger"
          onClick={(event) => openDialogFromLinkClick(event, CART_DRAWER_ID)}
        >
          <span className="t-lbl-c">Panier</span>
          <b>{totalQuantity > 99 ? "99+" : totalQuantity}</b>
        </Link>
      </div>
    </header>
  );
}
