import { describe, expect, it } from 'vitest';
import type { Tile } from '../tile/tile';
import { exchangeTileGroup, findTileGroup, type TileSlot } from './tile-group';

function slot(x: number, y: number, width: number, height: number): TileSlot {
  return { tile: {} as Tile, rect: new DOMRectReadOnly(x, y, width, height) };
}

describe('Tiles group exchange', () => {
  const first = slot(0, 0, 40, 40);
  const second = slot(50, 0, 40, 40);
  const third = slot(0, 50, 90, 40);
  const topNeighbor = slot(100, 0, 40, 90);
  const dragged = slot(0, 100, 90, 90);
  const bottomNeighbor = slot(100, 100, 40, 90);

  it('exchanges a tile with a matching group across rows and preserves neighboring slots', () => {
    const slots = [first, second, topNeighbor, third, dragged, bottomNeighbor];
    const group = findTileGroup(slots, dragged.rect, third.rect, new DOMRectReadOnly(0, 50, 90, 90), 10, 10)!;
    expect(group.tiles.size).toBe(3);
    expect([first, second, third].every(({ tile }) => group.tiles.has(tile))).toBe(true);

    const order = exchangeTileGroup(slots, dragged.tile, dragged.rect, group, false);
    expect(slots.map(({ tile }) => order.get(tile))).toEqual([2, 3, 1, 5, 0, 4]);
  });

  it('rejects incomplete rectangles and tiles that extend beyond the matching footprint', () => {
    const floating = new DOMRectReadOnly(0, 50, 90, 90);
    expect(findTileGroup([first, third, dragged], dragged.rect, third.rect, floating, 10, 10)).toBeUndefined();

    const oversized = slot(0, 50, 140, 40);
    expect(findTileGroup([first, second, oversized, dragged], dragged.rect, second.rect, floating, 10, 10)).toBeUndefined();
  });
});
