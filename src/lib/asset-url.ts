import { withBase } from "@i18n/routing";

const externalUrlPattern = /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i;

export function resolveAssetUrl(src: string): string {
  if (!src || externalUrlPattern.test(src)) {
    return src;
  }

  return withBase(src);
}
