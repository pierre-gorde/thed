# Shopify Hydrogen development

This storefront is scaffolded from Shopify's Hydrogen React Router template. See the README for framework-specific details.

Use the [Shopify AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit) for all Shopify API and platform work. If missing, install it in the agent host per that page (or `npx skills add Shopify/shopify-ai-toolkit --list` for skill-compatible hosts).

## No store yet?

Until a store is connected, this project reads [mock.shop](https://mock.shop): a public, auth-free Storefront API backed by fictional stores. There are more than 100 sample stores, each on its own host with its own catalog.

- The directory at https://mock.shop/llms.txt lists every store with what it sells and its API URL. The default, `mock.shop` itself, is apparel basics.
- To build against a different store, set `PUBLIC_STORE_DOMAIN` in `.env` to that store's host (for example `pets.mock.shop`) and leave `PRIVATE_STOREFRONT_API_TOKEN` empty. Each store describes its own catalog at `https://<store>.mock.shop/llms.txt`.
- Carts work; checkout is mocked (no payment, no real order), and the Customer Account API isn't available.
- To connect a real store, run `npx shopify hydrogen link`, then `npx shopify hydrogen env pull` to pull its environment into `.env`. Fill in any secret values the command reports it couldn't pull. On Oxygen, a linked storefront injects `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_ID`, and `PRIVATE_STOREFRONT_API_TOKEN` for you. `PUBLIC_STOREFRONT_ID` is optional for Storefront API access; it enables Hydrogen analytics, and no other analytics IDs are needed.

## Projet Thed

- Site artiste + merch de Thed. Docs projet (en français) dans `doc/` : lire `doc/README.md` puis `doc/08-plan-production.md` avant de coder.
- Maquette de référence : `prototypes/04-merch-simple.html` (base « Thed · Merch », voir `doc/07-base-merch.md`).
- Stack : Hydrogen 2026-10 (template React Router officiel, tag `@shopify/hydrogen@2026.10.3`) sur Oxygen. Contenus éditables en metaobjects Shopify, médias en fichiers Shopify, concerts via Bandsintown, dernière sortie via Apple (iTunes lookup), côté serveur.
- Mobile first : navigateurs intégrés d'Instagram et TikTok d'abord.
- Skills Hydrogen versionnées dans `.claude/skills/hydrogen-*` (copie `.agents/` ignorée). Après une mise à jour de `@shopify/hydrogen` : `npx hydrogen skills sync`.
- Checks : `npm run typecheck`, `npm test`, `npm run build` (aussi en CI).
