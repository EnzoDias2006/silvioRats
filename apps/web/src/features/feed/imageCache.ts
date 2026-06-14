import { imageCacheNamespace } from "@silviorats/shared";
import { del, get, set } from "idb-keyval";

function cacheKey(photoId: string, version: string) {
  return `${imageCacheNamespace}:image:${photoId}:${version}`;
}

export async function getCachedImage(photoId: string, version: string) {
  return get<Blob>(cacheKey(photoId, version));
}

export async function setCachedImage(photoId: string, version: string, blob: Blob) {
  await set(cacheKey(photoId, version), blob);
}

export async function deleteCachedImage(photoId: string, version: string) {
  await del(cacheKey(photoId, version));
}

export async function fetchCachedImage(input: { photoId: string; version: string; url: string }) {
  const cached = await getCachedImage(input.photoId, input.version);
  if (cached) return cached;

  const response = await fetch(input.url);
  if (!response.ok) throw new Error("Failed to download image");

  const blob = await response.blob();
  await setCachedImage(input.photoId, input.version, blob);
  return blob;
}
