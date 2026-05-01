import { Injectable } from '@angular/core';

@Injectable()
export class EmbedService {
  parse(rawUrl: string): { url: string; type: string } {
    const cleaned = (rawUrl || '').trim();
    if (!cleaned) {
      return { url: '', type: '' };
    }

    const withScheme = /^(https?:)?\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;

    let u: URL | null = null;
    try {
      u = new URL(withScheme);
    } catch {
      return { url: cleaned, type: '' };
    }

    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    const href = u.toString();

    if (path.endsWith('.pdf')) {
      return { url: href, type: 'pdf' };
    } else if (host.includes('youtu.be') || host.includes('youtube.com')) {
      return { url: this.toYoutubeEmbed(u), type: 'youtube' };
    } else if (host.includes('vimeo.com')) {
      return { url: this.toVimeoEmbed(u), type: 'vimeo' };
    } else if (host.includes('spotify.com')) {
      return { url: this.toSpotifyEmbed(u), type: 'spotify' };
    } else if (host.includes('maps.google.') || (host.includes('google.') && path.startsWith('/maps'))) {
      return { url: this.toGoogleMapsEmbed(u), type: 'google-maps' };
    } else if (host.includes('docs.google.')) {
      return { url: this.toGoogleDocsEmbed(u), type: 'google-docs' };
    } else if (host.includes('drive.google.')) {
      return { url: this.toGoogleDriveEmbed(u), type: 'google-drive' };
    } else if (host.includes('codepen.io')) {
      return { url: this.toCodepenEmbed(u), type: 'codepen' };
    } else if (host.includes('figma.com')) {
      return { url: this.toFigmaEmbed(u), type: 'figma' };
    } else if (host.includes('loom.com')) {
      return { url: this.toLoomEmbed(u), type: 'loom' };
    } else if (host.includes('twitter.com') || host === 'x.com' || host.endsWith('.x.com')) {
      return { url: this.toTwitterEmbed(u), type: 'twitter' };
    } else if (host.includes('instagram.com')) {
      return { url: this.toInstagramEmbed(u), type: 'instagram' };
    } else if (host.includes('tiktok.com')) {
      return { url: this.toTiktokEmbed(u), type: 'tiktok' };
    } else if (host.includes('soundcloud.com')) {
      return { url: this.toSoundcloudEmbed(u), type: 'soundcloud' };
    } else if (host.includes('stackblitz.com')) {
      return { url: this.toStackblitzEmbed(u), type: 'stackblitz' };
    } else if (host.includes('gist.github.com')) {
      return { url: href, type: 'gist' };
    } else {
      return { url: href, type: 'website' };
    }
  }

  // ==== Provider transformers ====
  private toYoutubeEmbed(u: URL): string {
    // Already embed
    if (/^\/embed\//.test(u.pathname)) {
      return `https://www.youtube.com${u.pathname}${u.search}`;
    }

    const host = u.hostname.toLowerCase();
    let id = '';
    let start = '';

    if (host.includes('youtu.be')) {
      id = u.pathname.split('/').filter(Boolean)[0] || '';
      // t or start
      start = this.extractYouTubeStart(u.searchParams);
    } else {
      // youtube.com variants
      if (u.searchParams.get('v')) {
        id = u.searchParams.get('v') || '';
        start = this.extractYouTubeStart(u.searchParams);
      } else if (u.pathname.startsWith('/shorts/')) {
        id = u.pathname.split('/')[2] || '';
      } else if (u.pathname.startsWith('/live/')) {
        id = u.pathname.split('/')[2] || '';
      }
    }

    const qs = start ? `?start=${start}` : '';
    return id ? `https://www.youtube.com/embed/${id}${qs}` : u.toString();
  }

  private extractYouTubeStart(params: URLSearchParams): string {
    const t = params.get('t') || params.get('start') || '';
    if (!t) return '';
    // t can be in format 1h2m3s or 90 or 1m30s
    const total = this.parseTimeToSeconds(t);
    return total ? String(total) : '';
  }

  private parseTimeToSeconds(t: string): number {
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    const re = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i;
    const m = t.match(re);
    if (!m) return 0;
    const h = parseInt(m[1] || '0', 10);
    const mnt = parseInt(m[2] || '0', 10);
    const s = parseInt(m[3] || '0', 10);
    return h * 3600 + mnt * 60 + s;
  }

  private toVimeoEmbed(u: URL): string {
    // extract last numeric id
    const parts = u.pathname.split('/').filter(Boolean);
    const last = parts[parts.length - 1] || '';
    const id = /^(\d+)$/.test(last) ? last : (parts.includes('videos') ? parts[parts.indexOf('videos') + 1] : '');
    return id ? `https://player.vimeo.com/video/${id}` : u.toString();
  }

  private toSpotifyEmbed(u: URL): string {
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'embed') return u.toString();
    // /{type}/{id}
    if (parts.length >= 2) {
      const type = parts[0];
      const id = parts[1];
      return `https://open.spotify.com/embed/${type}/${id}`;
    }
    return u.toString();
  }

  private toGoogleMapsEmbed(u: URL): string {
    const p = u.pathname;
    if (p.includes('/maps/embed') || u.searchParams.get('output') === 'embed') {
      return u.toString();
    }
    // Best-effort wrap original URL as query for embed
    return `https://www.google.com/maps?output=embed&q=${encodeURIComponent(u.toString())}`;
  }

  private toGoogleDocsEmbed(u: URL): string {
    // document, presentation, spreadsheets, forms
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length >= 3) {
      const product = parts[0]; // document|presentation|spreadsheets|forms
      const kind = parts[1]; // usually 'd'
      const id = parts[2];
      if (product === 'document') {
        return `https://docs.google.com/document/d/${id}/preview`;
      }
      if (product === 'presentation') {
        return `https://docs.google.com/presentation/d/${id}/embed`;
      }
      if (product === 'spreadsheets') {
        return `https://docs.google.com/spreadsheets/d/${id}/preview`;
      }
      if (product === 'forms') {
        return `https://docs.google.com/forms/d/${id}/viewform?embedded=true`;
      }
    }
    return u.toString();
  }

  private toGoogleDriveEmbed(u: URL): string {
    // /file/d/{id}/view -> /file/d/{id}/preview
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('d');
    if (parts[0] === 'file' && idx >= 0 && parts[idx + 1]) {
      const id = parts[idx + 1];
      return `https://drive.google.com/file/d/${id}/preview`;
    }
    // open?id=... -> uc?export=preview&id=...
    const openId = u.searchParams.get('id');
    if (openId) {
      return `https://drive.google.com/uc?export=preview&id=${encodeURIComponent(openId)}`;
    }
    return u.toString();
  }

  private toCodepenEmbed(u: URL): string {
    const parts = u.pathname.split('/').filter(Boolean);
    const user = parts[0];
    const mode = parts[1]; // pen|full|details|embed
    const id = parts[2];
    if (mode === 'embed') return u.toString();
    if (user && id) {
      return `https://codepen.io/${user}/embed/${id}`;
    }
    return u.toString();
  }

  private toFigmaEmbed(u: URL): string {
    return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(u.toString())}`;
  }

  private toLoomEmbed(u: URL): string {
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts[0] === 'embed') return u.toString();
    // /share/{id}
    if (parts[0] === 'share' && parts[1]) {
      return `https://www.loom.com/embed/${parts[1]}`;
    }
    return u.toString();
  }

  private toTwitterEmbed(u: URL): string {
    // Use twitframe to get an embeddable iframe
    return `https://twitframe.com/show?url=${encodeURIComponent(u.toString())}`;
  }

  private toInstagramEmbed(u: URL): string {
    // Append /embed to post/reel URLs
    let p = u.pathname;
    if (!p.endsWith('/')) p += '/';
    if (!p.endsWith('embed/')) {
      p += 'embed/';
    }
    return `${u.protocol}//${u.host}${p}`;
  }

  private toTiktokEmbed(u: URL): string {
    // Expect /@user/video/{id}
    const parts = u.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('video');
    if (idx >= 0 && parts[idx + 1]) {
      const id = parts[idx + 1];
      return `https://www.tiktok.com/embed/v2/${id}`;
    }
    return u.toString();
  }

  private toSoundcloudEmbed(u: URL): string {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.toString())}`;
  }

  private toStackblitzEmbed(u: URL): string {
    // Ensure we have the embed parameter for StackBlitz iframe
    const url = new URL(u.toString());
    if (url.searchParams.get('embed') !== '1') {
      url.searchParams.set('embed', '1');
    }
    // Keep other parameters like file, terminal, ctl, hideExplorer if provided by user
    return url.toString();
  }
}
