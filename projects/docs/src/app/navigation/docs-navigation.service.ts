import { Injectable } from '@angular/core';

export interface DocsNavItem {
  type?: string;
  name?: string;
  link?: string;
  children?: DocsNavItem[];
}

export interface DocsRelatedLink {
  href: string;
  label: string;
  description: string;
}

interface FlatDocsNavItem {
  name: string;
  link: string;
  normalizedLink: string;
  groupName: string;
  sectionName: string;
  siblings: FlatDocsNavItem[];
}

@Injectable({ providedIn: 'root' })
export class DocsNavigationService {
  private flatItems: FlatDocsNavItem[] = [];

  registerNavItems(items: readonly DocsNavItem[]): void {
    const flatItems: FlatDocsNavItem[] = [];
    let currentSection = 'Documentation';

    for (const item of items) {
      if (item.type === 'heading' && item.name) {
        currentSection = item.name;
        continue;
      }

      if (item.type === 'group' && item.children?.length) {
        this.addGroup(flatItems, item.name || currentSection, currentSection, item.children);
        continue;
      }

      if (item.link && item.name) {
        this.addGroup(flatItems, currentSection, currentSection, [item]);
      }
    }

    this.flatItems = flatItems;
  }

  relatedLinksForUrl(url: string, limit = 3): readonly DocsRelatedLink[] {
    const activeItem = this.findActiveItem(url);

    if (!activeItem) {
      return [];
    }

    return this.neighborItems(activeItem)
      .slice(0, limit)
      .map((item) => ({
        href: item.link,
        label: item.name,
        description: this.descriptionFor(item, activeItem),
      }));
  }

  private addGroup(
    flatItems: FlatDocsNavItem[],
    groupName: string,
    sectionName: string,
    items: readonly DocsNavItem[]
  ): void {
    const siblings: FlatDocsNavItem[] = [];

    const sortedItems = items
      .slice()
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    for (const item of sortedItems) {
      if (!item.link || !item.name) {
        continue;
      }

      const flatItem: FlatDocsNavItem = {
        name: item.name,
        link: item.link,
        normalizedLink: normalizeDocsPath(item.link),
        groupName,
        sectionName,
        siblings,
      };

      siblings.push(flatItem);
      flatItems.push(flatItem);
    }
  }

  private findActiveItem(url: string): FlatDocsNavItem | undefined {
    const currentPath = normalizeDocsPath(url);

    return this.flatItems
      .slice()
      .sort((a, b) => b.normalizedLink.length - a.normalizedLink.length)
      .find((item) => (
        currentPath === item.normalizedLink ||
        currentPath.startsWith(`${item.normalizedLink}/`)
      ));
  }

  private neighborItems(activeItem: FlatDocsNavItem): readonly FlatDocsNavItem[] {
    const activeIndex = activeItem.siblings.findIndex((item) => item.link === activeItem.link);

    if (activeIndex === -1) {
      return activeItem.siblings.filter((item) => item.link !== activeItem.link);
    }

    const orderedItems: FlatDocsNavItem[] = [];

    for (let offset = 1; orderedItems.length < activeItem.siblings.length - 1; offset += 1) {
      const previous = activeItem.siblings[activeIndex - offset];
      const next = activeItem.siblings[activeIndex + offset];

      if (!previous && !next) {
        break;
      }

      if (previous) {
        orderedItems.push(previous);
      }

      if (next) {
        orderedItems.push(next);
      }
    }

    if (orderedItems.length >= 3) {
      return orderedItems;
    }

    const sectionItems = this.flatItems.filter((item) => (
      item.sectionName === activeItem.sectionName &&
      item.link !== activeItem.link &&
      !orderedItems.some((relatedItem) => relatedItem.link === item.link)
    ));

    return orderedItems.concat(sectionItems);
  }

  private descriptionFor(item: FlatDocsNavItem, activeItem: FlatDocsNavItem): string {
    if (item.groupName === activeItem.groupName) {
      return `More docs in ${item.groupName}.`;
    }

    return `Related ${item.sectionName} docs.`;
  }
}

function normalizeDocsPath(url: string): string {
  const path = `/${url.split(/[?#]/)[0]}`
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');

  return (path || '/')
    .replace(/\/api$/, '')
    .replace(/\/overview$/, '');
}
