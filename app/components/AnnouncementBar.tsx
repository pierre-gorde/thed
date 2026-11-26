import type { Release } from "~/lib/thed-data";

/** Bandeau du haut : dernière sortie de Thed, choisie automatiquement (Apple, côté serveur). */
export function AnnouncementBar({ release }: { release: Release }) {
  return (
    <div className="t-announce" role="region" aria-label="Dernière sortie">
      <a href={release.href} target="_blank" rel="noopener">
        {release.cover ? <img src={release.cover} alt="" width={20} height={20} /> : null}
        <span className="t-new">{release.tag}</span>
        <span>
          {release.title}
          <span className="t-cta">
            {" "}
            · <u>Écouter</u>
          </span>
        </span>
      </a>
    </div>
  );
}
