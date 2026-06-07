import '@angular/compiler';
import { Component, Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { afterEach, describe, expect, it } from 'vitest';

import { MenuContent } from '../menu-content';
import { MenuFooter } from '../menu-footer/menu-footer';
import { MenuHeader } from '../menu-header/menu-header';
import { MenuItem } from '../menu-item/menu-item';
import { MenuTrigger } from '../menu-trigger';
import { Menu } from './menu';

@Component({
  standalone: true,
  imports: [
    Menu,
    MenuTrigger,
    MenuItem,
    MenuHeader,
    MenuFooter
  ],
  template: `
    <button type="button" [ngsMenuTriggerFor]="menu">Open menu</button>

    <ngs-menu #menu="ngsMenu" classList="custom-menu-panel">
      <ngs-menu-header>
        <div class="header-marker">Header content</div>
      </ngs-menu-header>

      <button ngs-menu-item type="button">Archive</button>
      <button ngs-menu-item type="button">Delete</button>

      <ngs-menu-footer>
        <div class="footer-marker">Footer content</div>
      </ngs-menu-footer>
    </ngs-menu>
  `
})
class MenuProjectionHost {
}

@Component({
  standalone: true,
  imports: [
    Menu,
    MenuTrigger,
    MenuItem
  ],
  template: `
    <button type="button" [ngsMenuTriggerFor]="menu">Open menu</button>

    <ngs-menu #menu="ngsMenu">
      <div ngs-menu-header class="attribute-header">Attribute header</div>
      <button ngs-menu-item type="button">Settings</button>
      <div ngs-menu-footer class="attribute-footer">Attribute footer</div>
    </ngs-menu>
  `
})
class AttributeSlotsHost {
}

@Component({
  standalone: true,
  imports: [
    Menu,
    MenuTrigger,
    MenuItem,
    MenuContent,
    MenuHeader,
    MenuFooter
  ],
  template: `
    <button type="button" [ngsMenuTriggerFor]="menu" [ngsMenuTriggerData]="context()">Open menu</button>

    <ngs-menu #menu="ngsMenu">
      <ngs-menu-header>
        <div class="content-header">Static header</div>
      </ngs-menu-header>

      <ng-template ngsMenuContent let-user="user">
        <button ngs-menu-item type="button">{{ user }}</button>
      </ng-template>

      <ngs-menu-footer>
        <div class="content-footer">Static footer</div>
      </ngs-menu-footer>
    </ngs-menu>
  `
})
class MenuContentHost {
  readonly context = signal({ user: 'Ada' });
}

let overlayContainer: OverlayContainer | undefined;

async function createHost<T>(component: Type<T>): Promise<ComponentFixture<T>> {
  await TestBed.configureTestingModule({
    imports: [
      OverlayModule,
      component
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  overlayContainer = TestBed.inject(OverlayContainer);
  fixture.detectChanges();

  return fixture;
}

function getOverlayRoot(): HTMLElement {
  return overlayContainer?.getContainerElement() as HTMLElement;
}

function getTrigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
}

function openMenu(fixture: ComponentFixture<unknown>): void {
  getTrigger(fixture).click();
  fixture.detectChanges();
}

function getPanel(): HTMLElement {
  return getOverlayRoot().querySelector('.ngs-menu-panel') as HTMLElement;
}

afterEach(() => {
  overlayContainer?.ngOnDestroy();
  overlayContainer = undefined;
});

describe('Menu', () => {
  it('projects menu header and footer outside the scrollable content container', async () => {
    const fixture = await createHost(MenuProjectionHost);

    openMenu(fixture);

    const panel = getPanel();
    const children = Array.from(panel.children) as HTMLElement[];

    expect(panel.classList.contains('custom-menu-panel')).toBe(true);
    expect(children[0].tagName.toLowerCase()).toBe('ngs-menu-header');
    expect(children[0].classList.contains('ngs-menu-header')).toBe(true);
    expect(children[0].textContent).toContain('Header content');

    expect(children[1].classList.contains('ngs-menu-content')).toBe(true);
    expect(children[1].querySelectorAll('[ngs-menu-item], ngs-menu-item')).toHaveLength(2);
    expect(children[1].querySelector('.header-marker')).toBeNull();
    expect(children[1].querySelector('.footer-marker')).toBeNull();

    expect(children[2].tagName.toLowerCase()).toBe('ngs-menu-footer');
    expect(children[2].classList.contains('ngs-menu-footer')).toBe(true);
    expect(children[2].textContent).toContain('Footer content');
  });

  it('supports attribute-based header and footer slots', async () => {
    const fixture = await createHost(AttributeSlotsHost);

    openMenu(fixture);

    const panel = getPanel();
    const content = panel.querySelector('.ngs-menu-content') as HTMLElement;

    expect(panel.querySelector('.attribute-header')?.textContent).toContain('Attribute header');
    expect(panel.querySelector('.attribute-footer')?.textContent).toContain('Attribute footer');
    expect(content.querySelector('.attribute-header')).toBeNull();
    expect(content.querySelector('.attribute-footer')).toBeNull();
  });

  it('keeps menu content templates inside the scrollable container with the trigger context', async () => {
    const fixture = await createHost(MenuContentHost);

    openMenu(fixture);

    const panel = getPanel();
    const content = panel.querySelector('.ngs-menu-content') as HTMLElement;

    expect(content.textContent).toContain('Ada');
    expect(panel.querySelector('.content-header')?.textContent).toContain('Static header');
    expect(panel.querySelector('.content-footer')?.textContent).toContain('Static footer');
    expect(content.querySelector('.content-header')).toBeNull();
    expect(content.querySelector('.content-footer')).toBeNull();
  });
});
