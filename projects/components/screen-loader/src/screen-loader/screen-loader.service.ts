import { ComponentRef, Injectable, Injector, TemplateRef } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ScreenLoader } from './screen-loader';
import { ScreenLoaderRef } from './screen-loader-ref';

@Injectable({
  providedIn: 'root'
})
export class ScreenLoaderService {
  constructor(
    private overlay: Overlay,
    private injector: Injector
  ) {}

  open(message: string | TemplateRef<any>): ScreenLoaderRef {
    const overlayConfig = new OverlayConfig({
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy: this.overlay.position().global(),
      width: '100%',
      height: '100%'
    });

    const overlayRef = this.overlay.create(overlayConfig);
    const screenLoaderRef = new ScreenLoaderRef(overlayRef);

    const componentPortal = new ComponentPortal(ScreenLoader, null, this.injector);
    const componentRef: ComponentRef<ScreenLoader> = overlayRef.attach(componentPortal);

    componentRef.setInput('opened', true);
    componentRef.setInput('message', message);

    screenLoaderRef._notifyOpened();

    return screenLoaderRef;
  }
}
