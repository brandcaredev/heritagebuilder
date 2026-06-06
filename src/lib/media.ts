import { getURL } from "./utils";

type MediaSize = "thumbnail" | "card" | "main" | "gallery";

type MediaLike = {
  thumbnailURL?: null | string;
  url?: null | string;
  sizes?: Partial<Record<MediaSize, { url?: null | string }>>;
};

export const getMediaUrl = (
  media: MediaLike | null | undefined,
  preferredSize?: MediaSize,
) => {
  const path =
    (preferredSize ? media?.sizes?.[preferredSize]?.url : undefined) ??
    media?.url ??
    media?.thumbnailURL;

  if (!path) return "";

  return path.startsWith("http") ? path : `${getURL()}${path}`;
};
