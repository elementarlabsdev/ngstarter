import type { Tile } from '../tile/tile';

export interface TileSlot {
  tile: Tile;
  rect: DOMRectReadOnly;
}

interface TileGroup {
  anchor: Tile;
  rect: DOMRectReadOnly;
  tiles: Set<Tile>;
}

const tolerance = 1;

function contains(outer: DOMRectReadOnly, inner: DOMRectReadOnly): boolean {
  return inner.left >= outer.left - tolerance && inner.right <= outer.right + tolerance &&
    inner.top >= outer.top - tolerance && inner.bottom <= outer.bottom + tolerance;
}

function overlaps(a: DOMRectReadOnly, b: DOMRectReadOnly): boolean {
  return a.left < b.right - tolerance && a.right > b.left + tolerance &&
    a.top < b.bottom - tolerance && a.bottom > b.top + tolerance;
}

/** Find a rectangle in the hovered rows that the dragged tile can trade with. */
export function findTileGroup(
  slots: readonly TileSlot[],
  source: DOMRectReadOnly,
  hovered: DOMRectReadOnly,
  floating: DOMRectReadOnly,
  columnGap: number,
  rowGap: number,
): TileGroup | undefined {
  const area = (rect: DOMRectReadOnly) => (rect.width + columnGap) * (rect.height + rowGap);
  const sourceArea = area(source);
  let closest: TileGroup | undefined;
  let closestDistance = Infinity;

  for (const { tile, rect } of slots) {
    const bounds = new DOMRectReadOnly(rect.left, rect.top, source.width, source.height);
    const horizontalDistance = Math.abs(bounds.left - floating.left);
    if (horizontalDistance > source.width / 4 || !contains(bounds, hovered) ||
        (bounds.bottom > source.top + tolerance && bounds.top < source.bottom - tolerance)) continue;
    const distance = Math.hypot(horizontalDistance, bounds.top - floating.top);
    if (distance >= closestDistance) continue;

    const covered = slots.filter(slot => overlaps(bounds, slot.rect));
    if (covered.length < 2 || covered.some(slot => !contains(bounds, slot.rect))) continue;
    // Include the grid gaps in each slot's area so holes do not count as covered cells.
    const coveredArea = covered.reduce((sum, slot) => sum + area(slot.rect), 0);
    if (Math.abs(sourceArea - coveredArea) > source.width + source.height) continue;

    closestDistance = distance;
    closest = { anchor: tile, rect: bounds, tiles: new Set(covered.map(slot => slot.tile)) };
  }
  return closest;
}

export function exchangeTileGroup(
  slots: readonly TileSlot[],
  dragged: Tile,
  source: DOMRectReadOnly,
  group: TileGroup,
  rtl: boolean,
): Map<Tile, number> {
  // CSS Grid uses a dense layout, so order the new slots by their actual rows and columns.
  const ordered = slots.map(({ tile, rect }) => {
    if (tile === dragged) return { tile, x: group.rect.left, y: group.rect.top };
    if (group.tiles.has(tile)) {
      return { tile, x: source.left + rect.left - group.rect.left, y: source.top + rect.top - group.rect.top };
    }
    return { tile, x: rect.left, y: rect.top };
  }).sort((a, b) => Math.abs(a.y - b.y) > tolerance ? a.y - b.y : rtl ? b.x - a.x : a.x - b.x);
  return new Map(ordered.map(({ tile }, index) => [tile, index]));
}
