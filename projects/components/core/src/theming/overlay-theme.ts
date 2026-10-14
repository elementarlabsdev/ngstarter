/** Mirrors NgStarter tokens into a detached overlay and follows ancestor theme changes. */
export function bindNgsOverlayTheme(source: HTMLElement, target: HTMLElement): () => void {
  const view = source.ownerDocument.defaultView;
  if (!view || target.contains(source)) return () => {};
  const previous = new Map<string, string>();
  const apply = () => {
    const styles = view.getComputedStyle(source);
    const current = new Set<string>();
    for (let index = 0; index < styles.length; index++) {
      const name = styles.item(index);
      if (!name.startsWith('--ngs-')) continue;
      current.add(name);
      if (!previous.has(name)) previous.set(name, target.style.getPropertyValue(name));
      target.style.setProperty(name, styles.getPropertyValue(name));
    }
    for (const [name, value] of previous) if (!current.has(name)) {
      if (value) target.style.setProperty(name, value); else target.style.removeProperty(name);
    }
  };
  apply();
  const observer = new MutationObserver(apply);
  for (let ancestor: HTMLElement | null = source; ancestor; ancestor = ancestor.parentElement) {
    observer.observe(ancestor, { attributes: true, attributeFilter: ['style', 'class', 'data-ngs-theme', 'data-ngs-color-scheme', 'data-ngs-density', 'data-ngs-radius'] });
  }
  const media = view.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', apply);
  return () => {
    observer.disconnect(); media.removeEventListener('change', apply);
    for (const [name, value] of previous) {
      if (value) target.style.setProperty(name, value); else target.style.removeProperty(name);
    }
  };
}
