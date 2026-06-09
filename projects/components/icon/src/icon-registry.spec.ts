import { TestBed } from '@angular/core/testing';
import { setCustomIconsLoader } from 'iconify-icon';
import { beforeEach, describe, expect, it } from 'vitest';

import { IconRegistry } from './icon-registry';

describe('IconRegistry', () => {
  let registry: IconRegistry;
  let loaderCalls: string[][];
  let prefixIndex = 0;
  let prefix: string;

  beforeEach(() => {
    TestBed.resetTestingModule();
    registry = TestBed.inject(IconRegistry);
    loaderCalls = [];
    prefix = `ngs-test-icons-${prefixIndex++}`;

    setCustomIconsLoader((icons) => {
      loaderCalls.push([...icons]);

      return {
        prefix,
        icons: icons.reduce<Record<string, { body: string; width: number; height: number }>>((data, name) => {
          data[name] = { body: `<path id="${name}"/>`, width: 24, height: 24 };

          return data;
        }, {}),
      };
    }, prefix);
  });

  it('batches icons requested in the same turn', async () => {
    const first = registry.get(`${prefix}:add`);
    const second = registry.get(`${prefix}:search`);
    const [firstIcon, secondIcon] = await Promise.all([first, second]);

    expect(loaderCalls).toEqual([['add', 'search']]);
    expect(firstIcon).toEqual(expect.objectContaining({ body: '<path id="add"/>', width: 24, height: 24 }));
    expect(secondIcon).toEqual(expect.objectContaining({ body: '<path id="search"/>', width: 24, height: 24 }));
  });

  it('reuses cached icon data without loading again', async () => {
    await registry.get(`${prefix}:add`);
    await Promise.resolve();

    loaderCalls = [];

    await expect(registry.get(`${prefix}:add`)).resolves.toEqual(expect.objectContaining({
      body: '<path id="add"/>',
      width: 24,
      height: 24,
    }));
    expect(loaderCalls).toEqual([]);
  });

  it('deduplicates pending requests for the same icon', async () => {
    const first = registry.get(`${prefix}:add`);
    const second = registry.get(`${prefix}:add`);
    const [firstIcon, secondIcon] = await Promise.all([first, second]);

    expect(loaderCalls).toEqual([['add']]);
    expect(firstIcon).toBe(secondIcon);
  });
});
