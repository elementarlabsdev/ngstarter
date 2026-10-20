import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { Layout } from './layout';
import { LayoutContent } from '../layout-content/layout-content';
import { LayoutHeader } from '../layout-header/layout-header';
import { LayoutSubheader } from '../layout-subheader/layout-subheader';
import { LayoutFooter } from '../layout-footer/layout-footer';
import { LayoutSidebar } from '../layout-sidebar/layout-sidebar';
import { LayoutAside } from '../layout-aside/layout-aside';
import { LayoutApiService } from '../layout-api.service';
import { LAYOUT_CONTENT } from '../types';

@Component({
  imports: [Layout, LayoutContent, LayoutHeader, LayoutSubheader, LayoutFooter, LayoutSidebar, LayoutAside],
  styles: `:host { --spacing: 0.25rem; }`,
  template: `
    <ngs-layout root layoutId="outer">
      <ngs-layout-header autoHeight>Application</ngs-layout-header>
      <ngs-layout-sidebar>Navigation</ngs-layout-sidebar>
      <ngs-layout-content>
        <ngs-layout absolute layoutId="workspace">
          <ngs-layout-header flex>Workspace</ngs-layout-header>
          @if (showExtra()) {
            <ngs-layout-subheader flex autoHeight>Filters</ngs-layout-subheader>
          }
          @if (showExtra()) {
            <ngs-layout-sidebar>Records</ngs-layout-sidebar>
          }
          @if (showExtra()) {
            <ngs-layout-aside>Inspector</ngs-layout-aside>
          }
          @if (showExtra()) {
            <ngs-layout-footer block autoHeight>Actions</ngs-layout-footer>
          }
          <ngs-layout-content [autoscrollToTop]="false">Content</ngs-layout-content>
        </ngs-layout>
      </ngs-layout-content>
    </ngs-layout>
  `,
})
class Workspace {
  showExtra = signal(true);
}

describe('Layout workspaces', () => {
  it('supports local workspaces without a Router and resolves the nearest content provider', () => {
    const fixture = TestBed.createComponent(Workspace);
    fixture.detectChanges();
    const layouts = fixture.debugElement.queryAll(By.directive(Layout));
    expect(layouts[0].nativeElement.classList.contains('is-root')).toBe(true);
    expect(layouts[1].nativeElement.classList.contains('is-absolute')).toBe(true);
    const contents = fixture.debugElement.queryAll(By.directive(LayoutContent));
    expect(contents[1].injector.get(LAYOUT_CONTENT)).toBe(contents[1].componentInstance);
    expect(contents[1].injector.get(LAYOUT_CONTENT)).not.toBe(contents[0].componentInstance);
    expect(fixture.nativeElement.querySelector('ngs-layout-subheader').textContent).toContain('Filters');
    expect(fixture.nativeElement.querySelector('ngs-layout-footer').classList.contains('as-block')).toBe(true);
    fixture.componentInstance.showExtra.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ngs-layout-subheader')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('ngs-layout-content').length).toBe(2);
  });

  it('keeps workspace regions inside the available viewport without overlap', () => {
    const fixture = TestBed.createComponent(Workspace);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const layouts = element.querySelectorAll('ngs-layout');
    const outer = layouts[0].getBoundingClientRect();
    const inner = layouts[1].getBoundingClientRect();
    const content = layouts[1].querySelector('ngs-layout-content')!.getBoundingClientRect();
    const sidebar = layouts[1].querySelector('ngs-layout-sidebar')!.getBoundingClientRect();
    const aside = layouts[1].querySelector('ngs-layout-aside')!.getBoundingClientRect();
    const footer = layouts[1].querySelector('ngs-layout-footer')!.getBoundingClientRect();
    expect(outer.height).toBe(window.innerHeight);
    expect(inner.height).toBeGreaterThan(0);
    expect(inner.bottom).toBeLessThanOrEqual(outer.bottom);
    expect(sidebar.right).toBeLessThanOrEqual(content.left);
    expect(content.right).toBeLessThanOrEqual(aside.left);
    expect(content.bottom).toBeLessThanOrEqual(footer.top);
    expect(content.height).toBeGreaterThan(0);
  });

  it('toggles only the sidebar belonging to the requested layout', () => {
    const fixture = TestBed.createComponent(Workspace);
    fixture.detectChanges();
    const api = TestBed.inject(LayoutApiService);
    const sidebars = fixture.debugElement.queryAll(By.directive(LayoutSidebar));
    expect(api.isSidebarShown('workspace')).toBe(true);
    api.toggleSidebar('workspace');
    fixture.detectChanges();
    expect(sidebars[1].nativeElement.classList.contains('is-hidden')).toBe(true);
    expect(sidebars[0].nativeElement.classList.contains('is-hidden')).toBe(false);
    api.showSidebar('workspace');
    fixture.detectChanges();
    expect(sidebars[1].nativeElement.classList.contains('is-hidden')).toBe(false);
  });

  it('honors content auto-scroll settings and releases router subscriptions on destroy', () => {
    const events = new Subject<NavigationStart>();
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: { events } }] });
    const fixture = TestBed.createComponent(Workspace);
    fixture.detectChanges();
    const contents = fixture.debugElement.queryAll(By.directive(LayoutContent));
    const outerScroll = vi.fn();
    const innerScroll = vi.fn();
    contents[0].nativeElement.scrollTo = outerScroll;
    contents[1].nativeElement.scrollTo = innerScroll;
    events.next(new NavigationStart(1, '/next'));
    expect(outerScroll).toHaveBeenCalledOnce();
    expect(innerScroll).not.toHaveBeenCalled();
    fixture.destroy();
    events.next(new NavigationStart(2, '/later'));
    expect(outerScroll).toHaveBeenCalledOnce();
  });
});
