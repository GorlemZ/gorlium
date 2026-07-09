// Warms the browser cache for an image URL so it's ready before it's shown.
export function preloadImage(url: string) {
  const img = new Image();
  img.src = url;
}
