import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy } from '@angular/router';
import { ENVIRONMENT } from '@ngstarter-ui/components/core';
import { vi } from 'vitest';
import { DocsTitleStrategy } from './docs-title-strategy';

describe('Docs SEO metadata', () => {
  let router: Router;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'old-example', redirectTo: 'libraries/form-builder/form-builder' },
          { path: '**', children: [] },
        ]),
        { provide: ENVIRONMENT, useValue: { siteUrl: 'https://docs.ngstarter.com/', pageTitle: 'NgStarter' } },
        { provide: TitleStrategy, useClass: DocsTitleStrategy },
      ],
    });
    router = TestBed.inject(Router);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.head.querySelectorAll('link[rel="canonical"], meta').forEach(element => element.remove());
    TestBed.resetTestingModule();
  });

  function expectCanonical(path: string): void {
    const canonical = document.head.querySelectorAll('link[rel="canonical"]');
    expect(canonical).toHaveLength(1);
    expect(canonical[0].getAttribute('href')).toBe(`https://docs.ngstarter.com${path}`);
    expect(TestBed.inject(Meta).getTag('property="og:url"')?.content)
      .toBe(`https://docs.ngstarter.com${path}`);
  }

  for (const path of [
    '/libraries/form-builder/form-builder',
    '/libraries/form-builder/external-renderer-flow',
  ]) {
    it(`uses the public HTTPS origin for ${path} even when the request uses HTTP`, async () => {
      vi.spyOn(document, 'URL', 'get').mockReturnValue(`http://internal-server:4000${path}`);

      await router.navigateByUrl(path);

      expectCanonical(path);
    });
  }

  it('replaces an existing canonical on navigation without query strings, fragments, or trailing slashes', async () => {
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = 'http://docs.ngstarter.com/';
    document.head.appendChild(canonical);

    await router.navigateByUrl('/libraries/form-builder/form-builder/?utm_source=test#fields');
    expectCanonical('/libraries/form-builder/form-builder');

    await router.navigateByUrl('/libraries/form-builder/external-renderer-flow');
    expectCanonical('/libraries/form-builder/external-renderer-flow');
    expect(document.head.querySelector('link[rel="canonical"]')).toBe(canonical);
  });

  it('uses the final URL after a redirect and keeps the root slash', async () => {
    await router.navigateByUrl('/old-example');
    expectCanonical('/libraries/form-builder/form-builder');

    await router.navigateByUrl('/?utm_source=test');
    expectCanonical('/');
  });

  it('gives the Form Builder overview and its distinct examples unique titles and descriptions', async () => {
    const titles = new Set<string>();
    const descriptions = new Set<string>();

    for (const suffix of ['', '/form-builder', '/form-renderer', '/external-renderer-flow']) {
      await router.navigateByUrl(`/libraries/form-builder${suffix}`);
      titles.add(TestBed.inject(Title).getTitle());
      descriptions.add(TestBed.inject(Meta).getTag('name="description"')!.content);
    }

    expect(titles.size).toBe(4);
    expect(descriptions.size).toBe(4);
    expect(TestBed.inject(Title).getTitle()).toContain('External Renderer Flow');
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toContain('external stepper');
  });
});
