/// <reference path="./menu.spec.d.ts" />
import '@angular/compiler';
import '../../../../../node_modules/@angular/cdk/overlay-prebuilt.css';
import { Component, Type, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { MenuContent } from '../menu-content';
import { MenuFooter } from '../menu-footer/menu-footer';
import { MenuHeader } from '../menu-header/menu-header';
import { MenuItem } from '../menu-item/menu-item';
import { MenuTrigger } from '../menu-trigger';
import { Menu } from './menu';
import { ContextMenuTrigger } from '../context-menu-trigger';
import { Button } from '@ngstarter-ui/components/button';

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

    <ngs-menu #menu="ngsMenu" classList="custom-menu-panel" [pushIntoViewport]="push()">
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
  readonly push = signal(false);
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

@Component({
  imports: [Menu, MenuItem, MenuTrigger, ContextMenuTrigger],
  template: `
    <button [ngsMenuTriggerFor]="menu" [ngsMenuTriggerRestoreFocus]="restoreFocus()">Open</button>
    <button class="after">After</button>
    <button class="context" [ngsContextMenuTriggerFor]="contextMenu">Context</button>
    <ngs-menu #menu="ngsMenu">
      <ngs-menu-item (click)="selected.set(selected() + 1)">Alpha</ngs-menu-item>
      <button ngs-menu-item disabled>Disabled</button>
      <button ngs-menu-item [ngsMenuTriggerFor]="submenu">More</button>
      <button ngs-menu-item>Zebra</button>
    </ngs-menu>
    <ngs-menu #submenu="ngsMenu">
      <button ngs-menu-item>Child one</button>
      <button ngs-menu-item>Child two</button>
    </ngs-menu>
    <ngs-menu #contextMenu="ngsMenu"><button ngs-menu-item>Context action</button></ngs-menu>
  `,
})
class KeyboardMenuHost {
  readonly selected = signal(0);
  readonly restoreFocus = signal(true);
}

@Component({
  imports: [Button, Menu, MenuItem, MenuTrigger],
  template: `
    <button class="before">Before</button>
    <button ngsButton class="trigger" [ngsMenuTriggerFor]="menu">Open menu</button>
    <ngs-menu #menu="ngsMenu">
      <button ngs-menu-item disabled>Unavailable</button>
      <button ngs-menu-item>First command</button>
      <button ngs-menu-item>Second command</button>
    </ngs-menu>
  `,
  styles: [':host { --ngs-button-height: 40px; }'],
})
class StyledKeyboardMenuHost {}

function keydown(element: HTMLElement, key: string, shiftKey = false): KeyboardEvent {
  const codes: Record<string, number> = {
    ArrowDown: 40, ArrowUp: 38, ArrowRight: 39, ArrowLeft: 37,
    Home: 36, End: 35, Enter: 13, ' ': 32, Escape: 27, Tab: 9, F10: 121,
  };
  const event = new KeyboardEvent('keydown', { key, keyCode: codes[key], shiftKey, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
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
  it('leaves focus on the trigger after a mouse click and enters the commands only on a keyboard action', async () => {
    const fixture = await createHost(StyledKeyboardMenuHost);
    fixture.autoDetectChanges();
    const trigger = fixture.nativeElement.querySelector('.trigger') as HTMLElement;
    await userEvent.click(trigger);
    await fixture.whenStable();
    const items = getPanel().querySelectorAll<HTMLElement>('[ngs-menu-item]');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(trigger);
    expect(Array.from(items).some(item => item.matches(':focus-visible'))).toBe(false);
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(document.activeElement).toBe(items[1]);
    expect(items[1].matches(':focus-visible')).toBe(true);
    await userEvent.keyboard('{ArrowDown}');
    await fixture.whenStable();
    expect(document.activeElement).toBe(items[2]);
    await userEvent.keyboard('{Escape}');
    await fixture.whenStable();
    expect(document.activeElement).toBe(trigger);
    expect(getPanel()).toBeNull();
  });

  it('does not focus context-menu commands on a mouse opening', async () => {
    const fixture = await createHost(KeyboardMenuHost);
    const trigger = fixture.nativeElement.querySelector('.context') as HTMLElement;
    trigger.focus();
    trigger.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 }));
    fixture.detectChanges();
    expect(getPanel()).not.toBeNull();
    expect(document.activeElement).toBe(trigger);
    keydown(trigger, 'ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('Context action');
  });

  it('closes a mouse-opened menu on Tab from the trigger and continues to the next control', async () => {
    const fixture = await createHost(KeyboardMenuHost);
    const trigger = getTrigger(fixture);
    await userEvent.click(trigger);
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);
    expect(getPanel()).not.toBeNull();
    await userEvent.tab();
    fixture.detectChanges();
    expect(getPanel()).toBeNull();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.after'));
  });
  it('moves visible keyboard focus to the first available command on Enter and follows arrow navigation', async () => {
    const fixture = await createHost(StyledKeyboardMenuHost);
    fixture.autoDetectChanges();
    const trigger = fixture.nativeElement.querySelector('.trigger') as HTMLElement;
    const styles = document.createElement('style');
    styles.textContent = '.ngs-menu-panel { --ngs-menu-item-active-background: rgb(17, 34, 51); }';
    document.head.appendChild(styles);
    try {
      (fixture.nativeElement.querySelector('.before') as HTMLElement).focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(getPanel()).toBeNull();
      await userEvent.keyboard('{Enter}');
      await fixture.whenStable();
      const items = getPanel().querySelectorAll<HTMLElement>('[ngs-menu-item]');
      expect(document.activeElement).toBe(items[1]);
      await expect.poll(() => getComputedStyle(items[1]).backgroundColor).toBe('rgb(17, 34, 51)');
      expect(getComputedStyle(items[2]).backgroundColor).not.toBe('rgb(17, 34, 51)');
      await userEvent.keyboard('{ArrowDown}');
      await fixture.whenStable();
      expect(document.activeElement).toBe(items[2]);
      await expect.poll(() => getComputedStyle(items[2]).backgroundColor).toBe('rgb(17, 34, 51)');
      await expect.poll(() => getComputedStyle(items[1]).backgroundColor).not.toBe('rgb(17, 34, 51)');
      await userEvent.keyboard('{ArrowUp}{Escape}');
      await fixture.whenStable();
      expect(document.activeElement).toBe(trigger);
      expect(getPanel()).toBeNull();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      await userEvent.tab({ shift: true });
      await userEvent.tab();
      expect(document.activeElement).toBe(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(getPanel()).toBeNull();
    } finally {
      styles.remove();
    }
  });
  it('opens from the keyboard, navigates enabled items, and restores focus on Escape', async () => {
    const fixture = await createHost(KeyboardMenuHost);
    const trigger = getTrigger(fixture);
    trigger.focus();
    keydown(trigger, 'ArrowDown');
    fixture.detectChanges();
    const panel = getPanel();
    const items = panel.querySelectorAll<HTMLElement>('[ngs-menu-item], ngs-menu-item');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
    expect(document.activeElement).toBe(items[0]);
    keydown(items[0], 'ArrowDown');
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[2]);
    keydown(items[2], 'End');
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[3]);
    keydown(items[3], 'Home');
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
    keydown(items[0], 'Escape');
    fixture.detectChanges();
    expect(getPanel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('activates custom element menu items with Space exactly once', async () => {
    const fixture = await createHost(KeyboardMenuHost);
    keydown(getTrigger(fixture), 'Enter');
    fixture.detectChanges();
    keydown(document.activeElement as HTMLElement, ' ');
    fixture.detectChanges();
    expect(fixture.componentInstance.selected()).toBe(1);
    expect(getPanel()).toBeNull();
  });

  it('opens submenus with ArrowRight and returns to the parent with ArrowLeft', async () => {
    const fixture = await createHost(KeyboardMenuHost);
    keydown(getTrigger(fixture), 'ArrowDown');
    fixture.detectChanges();
    keydown(document.activeElement as HTMLElement, 'ArrowDown');
    fixture.detectChanges();
    const parentItem = document.activeElement;
    keydown(parentItem as HTMLElement, 'ArrowRight');
    fixture.detectChanges();
    expect(getOverlayRoot().querySelectorAll('.ngs-menu-panel')).toHaveLength(2);
    expect(document.activeElement?.textContent).toContain('Child one');
    keydown(document.activeElement as HTMLElement, 'ArrowLeft');
    fixture.detectChanges();
    expect(getOverlayRoot().querySelectorAll('.ngs-menu-panel')).toHaveLength(1);
    expect(document.activeElement).toBe(parentItem);
  });

  it('closes on Tab without preventing browser focus navigation', async () => {
    const fixture = await createHost(KeyboardMenuHost);
    const trigger = getTrigger(fixture);
    keydown(trigger, 'ArrowUp');
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toBe('Zebra');
    const event = keydown(document.activeElement as HTMLElement, 'Tab');
    fixture.detectChanges();
    expect(event.defaultPrevented).toBe(false);
    expect(getPanel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('continues the real Tab sequence after an open menu', async () => {
    const fixture = await createHost(KeyboardMenuHost);
    getTrigger(fixture).focus();
    await userEvent.keyboard('{Enter}');
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toBe('Alpha');
    await userEvent.tab();
    fixture.detectChanges();
    expect(getPanel()).toBeNull();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.after'));
  });

  it('honors the trigger restore-focus setting on Escape', async () => {
    const fixture = await createHost(KeyboardMenuHost);
    fixture.componentInstance.restoreFocus.set(false);
    fixture.detectChanges();
    const trigger = getTrigger(fixture);
    trigger.focus();
    keydown(trigger, 'Enter');
    fixture.detectChanges();
    keydown(document.activeElement as HTMLElement, 'Escape');
    fixture.detectChanges();
    expect(getPanel()).toBeNull();
    expect(document.activeElement).not.toBe(trigger);
  });

  it('focuses and activates items in lazy menu content', async () => {
    const fixture = await createHost(MenuContentHost);
    keydown(getTrigger(fixture), 'Enter');
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('Ada');
    keydown(document.activeElement as HTMLElement, 'Enter');
    fixture.detectChanges();
    expect(getPanel()).toBeNull();
  });

  it('opens a context menu using Shift+F10', async () => {
    const fixture = await createHost(KeyboardMenuHost);
    const trigger = fixture.nativeElement.querySelector('.context') as HTMLElement;
    trigger.focus();
    keydown(trigger, 'F10', true);
    fixture.detectChanges();
    expect(document.activeElement?.textContent).toContain('Context action');
    keydown(document.activeElement as HTMLElement, 'Escape');
    fixture.detectChanges();
    expect(getPanel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it('keeps a tall menu inside the viewport without shrinking its panel', async () => {
    const fixture = await createHost(MenuProjectionHost);
    fixture.componentInstance.push.set(true);
    fixture.detectChanges();
    getTrigger(fixture).style.position = 'fixed';
    getTrigger(fixture).style.top = '50vh';
    const styles = document.createElement('style');
    styles.textContent = '.custom-menu-panel { min-height: 70vh; max-height: 70vh !important; }';
    document.head.appendChild(styles);
    try {
      openMenu(fixture);
      await fixture.whenStable();
      await expect.poll(() => getPanel().getBoundingClientRect().height).toBeCloseTo(window.innerHeight * 0.7, 0);
      const bounds = getPanel().getBoundingClientRect();
      expect(bounds.top).toBeGreaterThanOrEqual(7);
      expect(bounds.bottom).toBeLessThanOrEqual(window.innerHeight - 7);
    } finally {
      styles.remove();
    }
  });

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
