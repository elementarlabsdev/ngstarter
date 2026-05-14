import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { DEFAULT_OG_IMAGE, SeoData, SITE_URL } from './seo-data';

@Injectable()
export class AppSeoTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const seo = this.resolveSeoData(snapshot.root);

    if (!seo) {
      return;
    }

    const title = this.buildTitle(snapshot) ?? seo.title;
    const description = seo.description;
    const canonicalUrl = `${SITE_URL}${seo.canonicalPath}`;
    const ogTitle = seo.ogTitle ?? title;
    const ogDescription = seo.ogDescription ?? description;
    const ogImage = seo.ogImage ?? DEFAULT_OG_IMAGE;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:type', content: seo.ogType ?? 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'NgStarter' });
    this.meta.updateTag({ property: 'og:title', content: ogTitle });
    this.meta.updateTag({ property: 'og:description', content: ogDescription });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:type', content: 'image/png' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: ogTitle });
    this.meta.updateTag({ name: 'twitter:description', content: ogDescription });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });
    this.updateCanonical(canonicalUrl);
    this.updateStructuredData(seo);
  }

  private resolveSeoData(snapshot: ActivatedRouteSnapshot): SeoData | null {
    let route: ActivatedRouteSnapshot | null = snapshot;
    let seo: SeoData | null = null;

    while (route) {
      const routeSeo = route.data['seo'] as SeoData | undefined;

      if (routeSeo) {
        seo = routeSeo;
      }

      route = route.firstChild;
    }

    return seo;
  }

  private updateCanonical(href: string): void {
    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      this.document.head.appendChild(canonical);
    }

    canonical.setAttribute('href', href);
  }

  private updateStructuredData(seo: SeoData): void {
    const scriptId = 'app-seo-json-ld';
    let script = this.document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!seo.structuredData?.length) {
      script?.remove();
      return;
    }

    if (!script) {
      script = this.document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': seo.structuredData,
    });
  }
}
