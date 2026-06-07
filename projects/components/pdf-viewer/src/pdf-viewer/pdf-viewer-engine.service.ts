import { Injectable } from '@angular/core';
import { PluginRegistry } from '@embedpdf/core';
import type { PdfEngine } from '@embedpdf/models';

@Injectable({
  providedIn: 'root'
})
export class PdfViewerEngineService {
  private readonly engines = new Map<string, Promise<PdfEngine<Blob>>>();

  getEngine(wasmUrl: string): Promise<PdfEngine<Blob>> {
    const cachedEngine = this.engines.get(wasmUrl);

    if (cachedEngine) {
      return cachedEngine;
    }

    const engine = this.createEngine(wasmUrl);
    this.engines.set(wasmUrl, engine);
    return engine;
  }

  createRegistry(engine: PdfEngine<Blob>, defaultScale: number): Promise<PluginRegistry> {
    const registry = new PluginRegistry(engine, { defaultScale });
    return registry.initialize().then(() => registry);
  }

  private async createEngine(wasmUrl: string): Promise<PdfEngine<Blob>> {
    const { createPdfiumEngine } = await import('@embedpdf/engines/pdfium-direct-engine');
    return createPdfiumEngine(wasmUrl, { encoderPoolSize: 0 });
  }
}
