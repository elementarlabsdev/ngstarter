import { afterEach, describe, expect, it } from 'vitest';

import { scrollDropdownItemIntoView } from './dropdown-navigation';

let panel: HTMLElement;

afterEach(() => panel?.remove());

describe('scrollDropdownItemIntoView', () => {
  for (const scale of [1, 0.8]) {
    for (const edge of ['top', 'bottom'] as const) {
      it(`fully reveals an item at the ${edge} with a search header at scale ${scale}`, () => {
        panel = document.createElement('div');
        Object.assign(panel.style, {
          position: 'fixed', top: '20px', left: '20px', width: '300px',
          height: '240px', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          transform: `scaleY(${scale})`, transformOrigin: 'top',
        });
        const header = document.createElement('input');
        Object.assign(header.style, { height: '40px', flex: 'none', boxSizing: 'border-box' });
        const content = document.createElement('div');
        Object.assign(content.style, { overflowY: 'auto', minHeight: '0', position: 'relative' });
        const items = Array.from({ length: 30 }, () => {
          const item = document.createElement('div');
          item.style.height = '38px';
          content.append(item);
          return item;
        });
        panel.append(header, content);
        document.body.append(panel);
        const item = edge === 'top' ? items[0] : items.at(-1)!;
        if (edge === 'top') {
          content.scrollTop = content.scrollHeight;
        }
        const documentScrollTop = document.documentElement.scrollTop;

        scrollDropdownItemIntoView(item, panel);

        const bounds = item.getBoundingClientRect();
        const viewport = content.getBoundingClientRect();
        expect(bounds.top).toBeGreaterThanOrEqual(viewport.top - 1);
        expect(bounds.bottom).toBeLessThanOrEqual(viewport.bottom + 1);
        expect(content.scrollTop).toBeGreaterThanOrEqual(0);
        expect(panel.scrollTop).toBe(0);
        expect(document.documentElement.scrollTop).toBe(documentScrollTop);
      });
    }
  }
});
