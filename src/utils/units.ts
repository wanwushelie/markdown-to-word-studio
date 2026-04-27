/**
 * Convert pixels to EMU (English Metric Units)
 * 1 inch = 914400 EMU = 96 px
 * 1 px = 9525 EMU
 */
export function pxToEmu(px: number): number {
  return Math.round(px * 9525);
}

/**
 * Convert points to half-points (used by docx for font sizes)
 */
export function ptToHalfPt(pt: number): number {
  return pt * 2;
}

/**
 * Convert points to twips (1 twip = 1/20 point)
 */
export function ptToTwip(pt: number): number {
  return Math.round(pt * 20);
}

/**
 * Get page width in EMU for standard page sizes
 */
export function getPageWidthEmu(pageSize: 'A4' | 'Letter', orientation: 'portrait' | 'landscape'): number {
  const widths = {
    A4: { portrait: pxToEmu(794), landscape: pxToEmu(1123) },
    Letter: { portrait: pxToEmu(816), landscape: pxToEmu(1056) },
  };
  return widths[pageSize][orientation];
}

/**
 * Get page height in EMU for standard page sizes
 */
export function getPageHeightEmu(pageSize: 'A4' | 'Letter', orientation: 'portrait' | 'landscape'): number {
  const heights = {
    A4: { portrait: pxToEmu(1123), landscape: pxToEmu(794) },
    Letter: { portrait: pxToEmu(1056), landscape: pxToEmu(816) },
  };
  return heights[pageSize][orientation];
}
