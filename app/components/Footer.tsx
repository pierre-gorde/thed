import { Link } from "react-router";

import { LINKS } from "~/lib/thed-data";

import { Logo } from "./Logo";

const ext = { target: "_blank", rel: "noopener" } as const;

export function Footer() {
  return (
    <footer className="t-footer">
      <div className="t-wrap">
        <div className="t-cols">
          <div>
            <Link className="t-logo" to="/" aria-label="Thed">
              <Logo />
            </Link>
          </div>
          <div>
            <h4>Suivre</h4>
            <ul>
              <li><a href={LINKS.instagram} {...ext}>Instagram</a></li>
              <li><a href={LINKS.tiktok} {...ext}>TikTok</a></li>
              <li><a href={LINKS.youtube} {...ext}>YouTube</a></li>
            </ul>
          </div>
          <div>
            <h4>Écouter</h4>
            <ul>
              <li><a href={LINKS.spotify} {...ext}>Spotify</a></li>
              <li><a href={LINKS.appleMusic} {...ext}>Apple Music</a></li>
              <li><a href={LINKS.deezer} {...ext}>Deezer</a></li>
            </ul>
          </div>
          <div>
            <h4>Infos</h4>
            <ul>
              <li><Link to="/policies/shipping-policy">Livraison</Link></li>
              <li><Link to="/policies/refund-policy">Retours</Link></li>
              <li><Link to="/policies/terms-of-sale">CGV</Link></li>
              <li><Link to="/policies/legal-notice">Mentions légales</Link></li>
              <li><Link to="/policies/privacy-policy">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <p className="t-fine">© {new Date().getFullYear()} THED PRODUCTION</p>
      </div>
    </footer>
  );
}
