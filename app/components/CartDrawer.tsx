import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link } from "react-router";

import { useCart, useCartForm } from "~/lib/cart";
import { closeCartDrawer, configureOpenCartAction, CART_DRAWER_ID } from "~/lib/cart-drawer";
import { formatPrice } from "~/lib/money";
import { optionLabel, shortPrice } from "~/lib/thed-data";

import { publishCartViewed } from "./AnalyticsTrackers";

function CartErrorBanner() {
  const errors = useCart((state) => state.errors);
  const [dismissedAt, setDismissedAt] = useState(0);
  const messages = useMemo(() => {
    const lines = [...errors.lines.values()].flatMap((group) => group.userErrors);
    return [...errors.network, ...errors.cart.userErrors, ...lines].map((error) => error.message);
  }, [errors]);

  if (messages.length === 0 || errors.lastUpdatedAt <= dismissedAt) return null;

  return (
    <div className="t-errors" role="alert">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
      <button type="button" className="t-remove" onClick={() => setDismissedAt(errors.lastUpdatedAt)}>
        Fermer
      </button>
    </div>
  );
}

function hasPendingCost(pending: {
  cost?: boolean;
  discountCodes: Set<string>;
  lines: Set<string>;
}): boolean {
  return pending.cost ?? (pending.lines.size > 0 || pending.discountCodes.size > 0);
}

function useCartStatusMessage(): string {
  const pending = useCart((state) => state.pending);
  const revalidating = useCart((state) => "revalidating" in state && state.revalidating === true);
  const networkErrors = useCart((state) => state.errors.network);
  const isPending = hasPendingCost(pending) || revalidating;
  const [sawPending, setSawPending] = useState(false);

  useEffect(() => {
    if (isPending) setSawPending(true);
  }, [isPending]);

  if (isPending) return "Mise à jour du panier";
  if (sawPending && networkErrors.length === 0) return "Panier mis à jour";
  return "";
}

type CartLineView = {
  id: string;
  quantity: number;
  cost: { totalAmount: { amount: string; currencyCode: string } };
  attributes?: Array<{ key: string; value: string | null }>;
  merchandise?: {
    title?: string | null;
    selectedOptions?: Array<{ name: string; value: string }> | null;
    image?: { url: string; altText?: string | null } | null;
    product?: { title?: string | null; handle?: string | null } | null;
  } | null;
};

export function CartLineItem({
  line,
  emptyCartFocusId,
}: {
  line: CartLineView;
  emptyCartFocusId: string;
}) {
  const { formProps, register } = useCartForm();
  const pendingLines = useCart((state) => state.pending.lines);
  const lineError = useCart((state) => state.errors.lines.get(line.id));
  const merchandise = line.merchandise;
  const product = merchandise?.product;
  const pending = pendingLines.has(line.id);
  const title = product?.title ?? merchandise?.title ?? "Article";
  const optionText = merchandise?.selectedOptions
    ?.filter((option) => option.value !== "Default Title")
    .map((option) => `${optionLabel(option.name) === "Taille" ? "Taille " : ""}${option.value}`)
    .join(" / ");
  const errorId = `cart-line-error-${line.id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

  // Supprimer une ligne démonte le bouton qui a le focus : on le déplace avant sur la ligne voisine.
  const moveFocusBeforeRemoval = (event: SubmitEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (!form.contains(document.activeElement)) return;
    const intent = event.nativeEvent.submitter?.getAttribute("value");
    const quantity = new FormData(form).get("quantity");
    const removesLine =
      intent === "remove" ||
      (intent === "decrease" && line.quantity <= 1) ||
      (intent === "set" && Number(quantity) <= 0);
    if (!removesLine) return;

    const item = form.closest("li");
    const neighbour = item?.nextElementSibling ?? item?.previousElementSibling;
    const selector = intent === "set" ? 'input[name="quantity"]' : `button[value="${intent}"]`;
    const target =
      neighbour?.querySelector<HTMLElement>(selector) ?? document.getElementById(emptyCartFocusId);
    target?.focus();
  };

  return (
    <li
      className={`t-line ${pending ? "t-pending" : ""}`}
      data-testid="cart-line"
      {...(pending ? { "aria-busy": "true" } : {})}
    >
      <div className="t-media">
        {merchandise?.image ? (
          <img src={merchandise.image.url} alt={merchandise.image.altText ?? title} loading="lazy" />
        ) : null}
      </div>
      <div>
        <b>
          {product?.handle ? (
            <Link to={`/products/${product.handle}`} onClick={() => closeCartDrawer()}>
              {title}
            </Link>
          ) : (
            title
          )}
        </b>
        {optionText ? <span className="t-meta">{optionText}</span> : null}
        <form {...formProps({ beforeSubmit: moveFocusBeforeRemoval })}>
          <button {...register("set")} />
          <input type="hidden" {...register("lineId", { value: line.id })} />
          <span className="t-qty">
            <button type="submit" {...register("decrease")} aria-label={`Retirer un ${title}`}>
              −
            </button>
            <input
              {...register("quantity", { value: line.quantity, interactive: true })}
              aria-label="Quantité"
              aria-describedby={lineError?.userErrors.length ? errorId : undefined}
              aria-invalid={lineError?.userErrors.length ? true : undefined}
            />
            <button type="submit" {...register("increase")} aria-label={`Ajouter un ${title}`}>
              +
            </button>
          </span>
          <button type="submit" {...register("remove")} className="t-remove">
            Supprimer
          </button>
        </form>
        {lineError?.userErrors.length ? (
          <p id={errorId} className="t-errors" role="alert">
            {lineError.userErrors[0]?.message}
          </p>
        ) : null}
      </div>
      <span>{shortPrice(formatPrice(line.cost.totalAmount))}</span>
    </li>
  );
}

function CartLines() {
  const loading = useCart((state) => state.loading);
  const lines = useCart((state) => state.data.lines.nodes);

  if (loading) return <p className="t-empty">Chargement du panier…</p>;
  if (lines.length === 0) return <p className="t-empty">Ton panier est vide.</p>;

  return (
    <ul className="t-lines">
      {lines.map((line) => (
        <CartLineItem key={line.id} line={line} emptyCartFocusId="cart-drawer-title" />
      ))}
    </ul>
  );
}

function CartFooter() {
  const cart = useCart((state) => state.data);
  const pending = useCart((state) => state.pending);
  const revalidating = useCart((state) => "revalidating" in state && state.revalidating === true);
  const hasLines = cart.lines.nodes.length > 0;
  const isPending = hasPendingCost(pending) || revalidating;

  if (!hasLines) return <div />;

  return (
    <div className="t-tot">
      <div className="t-row" aria-busy={isPending}>
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
  );
}

export function CartDrawer() {
  const cart = useCart((state) => state.data);
  const statusMessage = useCartStatusMessage();

  useEffect(() => {
    configureOpenCartAction();
    const dialog = document.getElementById(CART_DRAWER_ID);
    if (!(dialog instanceof HTMLDialogElement)) return;
    const handleToggle = () => {
      if (dialog.open) publishCartViewed(cart);
    };
    dialog.addEventListener("toggle", handleToggle);
    return () => dialog.removeEventListener("toggle", handleToggle);
  }, [cart]);

  return (
    <>
      <span role="status" className="t-sr" aria-live="polite" aria-atomic="true" data-cart-status>
        {statusMessage}
      </span>
      <dialog
        id={CART_DRAWER_ID}
        className="t-drawer"
        aria-labelledby="cart-drawer-title"
        data-testid="cart-drawer"
        closedby="any"
      >
        <div>
          <h2 id="cart-drawer-title" tabIndex={-1}>
            Panier
          </h2>
          <button
            type="button"
            commandfor={CART_DRAWER_ID}
            command="close"
            className="t-x"
            aria-label="Fermer"
            onClick={() => closeCartDrawer()}
          >
            ×
          </button>
        </div>
        <CartErrorBanner />
        <CartLines />
        <CartFooter />
      </dialog>
    </>
  );
}
