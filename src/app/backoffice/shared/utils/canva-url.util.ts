const CANVA_ACTIONS = new Set(['view', 'edit', 'watch', 'present', 'embed']);

export interface ParsedCanvaUrl {
  designId: string;
  shareToken?: string;
}

/** Extrae ID de diseño y token de acceso de URLs Canva. */
export function parseCanvaUrl(url: string | undefined | null): ParsedCanvaUrl | null {
  if (!url?.trim()) return null;
  const match = url.trim().match(/canva\.com\/design\/([A-Za-z0-9_-]+)(?:\/([^/?#]+))?/i);
  if (!match) return null;

  const designId = match[1];
  const second = match[2];
  const shareToken =
    second && !CANVA_ACTIONS.has(second.toLowerCase()) ? second : undefined;

  return { designId, shareToken };
}

export function extractCanvaDesignId(url: string | undefined | null): string | null {
  return parseCanvaUrl(url)?.designId ?? null;
}

export function buildCanvaEmbedUrl(designId: string, shareToken?: string | null): string {
  if (shareToken) {
    return `https://www.canva.com/design/${designId}/${shareToken}/view?embed`;
  }
  return `https://www.canva.com/design/${designId}/view?embed`;
}

export function buildCanvaViewUrl(designId: string, shareToken?: string | null): string {
  if (shareToken) {
    return `https://www.canva.com/design/${designId}/${shareToken}/view`;
  }
  return `https://www.canva.com/design/${designId}/view`;
}

/** Atributos recomendados para iframes de Canva (evita conflictos de sesión). */
export const CANVA_IFRAME_ATTRS =
  'allowfullscreen allow="fullscreen" referrerpolicy="strict-origin-when-cross-origin"';

/** Enlaces que requieren resolución en servidor (canva.link, etc.). */
export function needsCanvaUrlResolve(url: string | undefined | null): boolean {
  if (!url?.trim()) return false;
  if (parseCanvaUrl(url)) return false;
  return /canva\.link|canva\.com/i.test(url);
}

export function resolveCanvaDesignIdFromBlockData(data: {
  canvaUrl?: string;
  canvaDesignId?: string;
}): string | null {
  return data.canvaDesignId || extractCanvaDesignId(data.canvaUrl) || null;
}

export function resolveCanvaShareTokenFromBlockData(data: {
  canvaUrl?: string;
  canvaShareToken?: string;
}): string | undefined {
  if (data.canvaShareToken) return data.canvaShareToken;
  return parseCanvaUrl(data.canvaUrl)?.shareToken;
}

export function buildCanvaEmbedFromBlockData(data: {
  canvaUrl?: string;
  canvaDesignId?: string;
  canvaShareToken?: string;
}): string | null {
  const designId = resolveCanvaDesignIdFromBlockData(data);
  if (!designId) return null;
  const shareToken = resolveCanvaShareTokenFromBlockData(data);
  return buildCanvaEmbedUrl(designId, shareToken);
}

export function buildCanvaViewFromBlockData(data: {
  canvaUrl?: string;
  canvaDesignId?: string;
  canvaShareToken?: string;
}): string | null {
  const designId = resolveCanvaDesignIdFromBlockData(data);
  if (!designId) return null;
  const shareToken = resolveCanvaShareTokenFromBlockData(data);
  return buildCanvaViewUrl(designId, shareToken);
}
