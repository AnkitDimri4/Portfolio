/**
 * `url` when it's a web address (http or https), or undefined. For links whose address comes from an
 * API (GitHub's, or our own), so none can ever be a `javascript:` link: React doesn't stop those.
 */
export const webUrl = (url) => {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? url : undefined;
  } catch {
    return undefined;
  }
};
