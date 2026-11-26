import { gql, type StorefrontApi } from "@shopify/hydrogen";

// « Réglages du site » : un metaobject Shopify modifiable dans l'admin
// (Contenu > Metaobjects > Réglages du site). Chaque champ vide garde la valeur par défaut ci-dessous.
export const SITE_SETTINGS_TYPE = "reglages_site";
export const SITE_SETTINGS_HANDLE = "reglages-du-site";

export const SITE_SETTINGS_QUERY = gql(`
  query SiteSettings($handle: MetaobjectHandleInput!) {
    metaobject(handle: $handle) {
      fields {
        key
        value
        reference {
          __typename
          ... on Video {
            sources {
              url
              mimeType
            }
            previewImage {
              url
            }
          }
          ... on MediaImage {
            image {
              url
            }
          }
          ... on GenericFile {
            url
          }
        }
      }
    }
  }
`);

type SiteSettingsQueryResult = StorefrontApi.ResultOf<typeof SITE_SETTINGS_QUERY>;
type SettingsField = NonNullable<SiteSettingsQueryResult["metaobject"]>["fields"][number];

export type SiteSettings = {
  introVideo: string;
  introImage: string;
  liveVideo: string;
  liveImage: string;
  liveUrl: string;
  liveText: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  introVideo: "/media/live-landscape.mp4",
  introImage: "/media/live-poster-land.jpg",
  liveVideo: "/media/session.mp4",
  liveImage: "/media/session-poster.jpg",
  liveUrl: "https://www.youtube.com/watch?v=-kaA9M5-M_I",
  liveText: "Les titres de « Première leçon de vol » en live, sur un toit de Paris.",
};

function fileUrl(field: SettingsField | undefined): string | null {
  const ref = field?.reference;
  if (!ref) return null;
  switch (ref.__typename) {
    case "Video": {
      const mp4 = ref.sources.find((source) => source.mimeType === "video/mp4") ?? ref.sources[0];
      return mp4?.url ?? null;
    }
    case "MediaImage":
      return ref.image?.url ?? null;
    case "GenericFile":
      return ref.url ?? null;
    default:
      return null;
  }
}

function previewUrl(field: SettingsField | undefined): string | null {
  const ref = field?.reference;
  return ref?.__typename === "Video" ? (ref.previewImage?.url ?? null) : null;
}

function text(field: SettingsField | undefined): string | null {
  const value = field?.value?.trim();
  return value ? value : null;
}

export function normalizeSiteSettings(data: SiteSettingsQueryResult | null | undefined): SiteSettings {
  const fields = new Map((data?.metaobject?.fields ?? []).map((field) => [field.key, field]));
  const d = DEFAULT_SITE_SETTINGS;
  const introVideo = fields.get("video_intro");
  const liveVideo = fields.get("video_live");
  return {
    introVideo: fileUrl(introVideo) ?? d.introVideo,
    introImage: fileUrl(fields.get("image_intro")) ?? previewUrl(introVideo) ?? d.introImage,
    liveVideo: fileUrl(liveVideo) ?? d.liveVideo,
    liveImage: fileUrl(fields.get("image_live")) ?? previewUrl(liveVideo) ?? d.liveImage,
    liveUrl: text(fields.get("lien_live")) ?? d.liveUrl,
    liveText: text(fields.get("texte_live")) ?? d.liveText,
  };
}
