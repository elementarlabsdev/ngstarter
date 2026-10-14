import { bindNgsOverlayTheme } from './overlay-theme';

describe('Scoped overlay themes', () => {
  it('copies local tokens, follows theme changes and restores the target on cleanup', async () => {
    const scope = document.createElement('div'); const source = document.createElement('div'); const target = document.createElement('div');
    scope.append(source); document.body.append(scope, target);
    scope.style.setProperty('--ngs-color-surface', '#ffffff');
    scope.style.setProperty('--ngs-color-on-surface', '#112233');
    scope.style.setProperty('--ngs-content-editor-toolbar-bg', 'var(--ngs-color-on-surface)');
    target.style.setProperty('--ngs-color-surface', '#abcdef');
    const cleanup = bindNgsOverlayTheme(source, target);
    expect(getComputedStyle(target).getPropertyValue('--ngs-content-editor-toolbar-bg').trim()).toBe('#112233');
    scope.style.setProperty('--ngs-color-on-surface', '#eeeeee');
    await Promise.resolve();
    expect(getComputedStyle(target).getPropertyValue('--ngs-content-editor-toolbar-bg').trim()).toBe('#eeeeee');
    scope.style.removeProperty('--ngs-content-editor-toolbar-bg'); await Promise.resolve();
    expect(target.style.getPropertyValue('--ngs-content-editor-toolbar-bg')).toBe('');
    cleanup(); expect(target.style.getPropertyValue('--ngs-color-surface')).toBe('#abcdef');
    scope.style.setProperty('--ngs-color-surface', '#000000'); await Promise.resolve();
    expect(target.style.getPropertyValue('--ngs-color-surface')).toBe('#abcdef');
    scope.remove(); target.remove();
  });
});
