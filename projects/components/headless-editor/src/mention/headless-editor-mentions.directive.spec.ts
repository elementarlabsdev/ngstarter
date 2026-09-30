import { Component, inject, input, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { Menu, MenuItem } from '@ngstarter-ui/components/menu';
import { basicTextEditorPlugin } from '../basic-text.plugin';
import { NgsHeadlessEditor, provideNgsHeadlessEditor } from '../headless-editor';
import { NgsHeadlessEditorSurface } from '../headless-editor-surface.directive';
import { getNgsHeadlessEditorDocumentText } from '../model';
import { withHeadlessEditorPlugin } from '../plugin';
import { tableEditorPlugin, NGS_HEADLESS_EDITOR_INSERT_TABLE } from '../table/table.plugin';
import { getNgsHeadlessEditorTableData } from '../table/table.model';
import { NgsHeadlessEditorMentions } from './headless-editor-mentions.directive';
import { mentionEditorPlugin, NgsHeadlessEditorMentionOption } from './mention.plugin';
import { NgsHeadlessEditorMentionSearch } from './mention.options';

interface Person extends NgsHeadlessEditorMentionOption { readonly team: string; }
const people: readonly Person[] = [
  { id: 'anna', label: 'Anna Chen', team: 'Design' },
  { id: 'alex', label: 'Alex Morgan', team: 'Engineering' },
  { id: 'sam', label: 'Sam Rivera', team: 'Product' }
];
let searchPeople: NgsHeadlessEditorMentionSearch<Person>;

function deferredSearch() {
  let resolve!: (options: readonly Person[]) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<readonly Person[]>((accept, fail) => { resolve = accept; reject = fail; });
  return { promise, resolve, reject };
}

@Component({
  selector: 'test-mention-option',
  template: '<span class="custom-option">{{ option().label }} · {{ option().team }}</span><span>{{ active() ? "active" : "" }}</span>'
})
class CustomOption {
  readonly option = input.required<Person>();
  readonly active = input(false);
}

@Component({
  selector: 'test-mentions-host',
  imports: [NgsHeadlessEditorSurface, NgsHeadlessEditorMentions, Menu, MenuItem],
  providers: [provideNgsHeadlessEditor(
    withHeadlessEditorPlugin(basicTextEditorPlugin()),
    withHeadlessEditorPlugin(tableEditorPlugin()),
    withHeadlessEditorPlugin(mentionEditorPlugin({ options: query => searchPeople(query), optionComponent: CustomOption }))
  )],
  template: `
    <div ngsHeadlessEditorSurface [disabled]="disabled()" [ngsHeadlessEditorMentions]="custom ? menu : null" #mentions="ngsHeadlessEditorMentions"></div>
    <ngs-menu #menu>
      @for (person of mentions.suggestions(); track person.id; let index = $index) {
        <ngs-menu-item [attr.id]="mentions.optionId(index)" [selected]="mentions.activeIndex() === index"
          (click)="mentions.select(person)">Template: {{ person.label }}</ngs-menu-item>
      }
    </ngs-menu>`
})
class MentionsHost {
  readonly editor = inject(NgsHeadlessEditor);
  readonly mentions = viewChild.required(NgsHeadlessEditorMentions);
  custom = false;
  readonly disabled = signal(false);
}

describe('NgsHeadlessEditorMentions', () => {
  let fixture: ComponentFixture<MentionsHost>;
  let host: MentionsHost;
  let surface: HTMLElement;

  async function settle() {
    await fixture.whenStable();
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await fixture.whenStable();
  }
  const items = () => [...document.querySelectorAll<HTMLElement>('.cdk-overlay-container ngs-menu-item')];

  beforeEach(async () => {
    searchPeople = async query => people.filter(person => person.label.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    TestBed.configureTestingModule({ imports: [MentionsHost] });
    fixture = TestBed.createComponent(MentionsHost);
    document.body.append(fixture.nativeElement);
    fixture.autoDetectChanges();
    host = fixture.componentInstance;
    await settle();
    surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]');
    await userEvent.click(surface);
  });
  afterEach(() => TestBed.resetTestingModule());

  it('passes each query without the trigger and accepts only the latest response without filtering', async () => {
    const requests: { query: string; result: ReturnType<typeof deferredSearch> }[] = [];
    searchPeople = query => {
      const result = deferredSearch();
      requests.push({ query, result });
      return result.promise;
    };
    await userEvent.keyboard('@');
    await settle();
    await userEvent.keyboard('a');
    await settle();
    await userEvent.keyboard('l');
    await settle();
    expect(requests.map(request => request.query)).toEqual(['', 'a', 'al']);
    expect(host.mentions().loading()).toBe(true);
    expect(items()).toHaveLength(0);
    requests[2].result.resolve([people[2], people[0]]);
    await settle();
    expect(host.mentions().suggestions()).toEqual([people[2], people[0]]);
    expect(items()[0].textContent).toContain('Sam Rivera');
    expect(host.mentions().loading()).toBe(false);
    requests[0].result.resolve(people);
    requests[1].result.reject(new Error('Outdated request failed'));
    await settle();
    expect(host.mentions().suggestions()).toEqual([people[2], people[0]]);
    expect(host.mentions().error()).toBeNull();
  });

  it('clears previous suggestions while searching and recovers after a rejected search', async () => {
    await userEvent.keyboard('@');
    await settle();
    expect(items()).toHaveLength(3);
    const pending = deferredSearch();
    searchPeople = () => pending.promise;
    await userEvent.keyboard('a');
    await settle();
    expect(items()).toHaveLength(0);
    expect(host.mentions().loading()).toBe(true);
    const failure = new Error('Backend unavailable');
    pending.reject(failure);
    await settle();
    expect(host.mentions().error()).toBe(failure);
    expect(host.mentions().loading()).toBe(false);
    searchPeople = async () => [people[1]];
    await userEvent.keyboard('l');
    await settle();
    expect(items()).toHaveLength(1);
    expect(host.mentions().error()).toBeNull();
  });

  it('does not reopen a dismissed query when its pending search finishes', async () => {
    const pending = deferredSearch();
    searchPeople = () => pending.promise;
    await userEvent.keyboard('@');
    await settle();
    await userEvent.keyboard('{Escape}');
    pending.resolve(people);
    await settle();
    expect(host.mentions().open()).toBe(false);
    expect(items()).toHaveLength(0);
  });

  it('ignores a pending response after the query disappears or the surface is destroyed', async () => {
    const first = deferredSearch();
    searchPeople = () => first.promise;
    await userEvent.keyboard('@');
    await settle();
    await userEvent.keyboard('{Backspace}');
    await settle();
    first.resolve(people);
    await settle();
    expect(host.mentions().suggestions()).toEqual([]);
    expect(host.mentions().loading()).toBe(false);
    const second = deferredSearch();
    searchPeople = () => second.promise;
    await userEvent.keyboard('@');
    await settle();
    const mentions = host.mentions();
    fixture.destroy();
    second.resolve(people);
    await Promise.resolve();
    expect(mentions.suggestions()).toEqual([]);
    expect(items()).toHaveLength(0);
  });

  it('renders the globally configured option component without moving focus', async () => {
    await userEvent.keyboard('@');
    await settle();
    expect(items()).toHaveLength(3);
    expect(items()[0].querySelector('.custom-option')?.textContent).toBe('Anna Chen · Design');
    expect(document.activeElement).toBe(surface);
    expect(surface.getAttribute('aria-activedescendant')).toBe(items()[0].id);
    await userEvent.keyboard('al');
    await settle();
    expect(items()).toHaveLength(1);
    expect(items()[0].textContent).toContain('Alex Morgan');
  });

  it('selects by keyboard, preserves plain typing and undoes insertion in one step', async () => {
    await userEvent.keyboard('@{ArrowDown}{Enter}');
    await settle();
    expect(getNgsHeadlessEditorDocumentText(host.editor.document())).toBe('@Alex Morgan ');
    expect(surface.querySelector('.ngs-headless-editor-mention')?.getAttribute('data-mention-id')).toBe('alex');
    expect(items()).toHaveLength(0);
    await userEvent.keyboard('hello');
    await settle();
    expect(surface.querySelector('.ngs-headless-editor-mention')?.textContent).toBe('@Alex Morgan');
    host.editor.undo();
    host.editor.undo();
    await settle();
    expect(getNgsHeadlessEditorDocumentText(host.editor.document())).toBe('@');
  });

  it('accepts a custom menu template and pointer selection without losing the caret', async () => {
    host.custom = true;
    await settle();
    await userEvent.keyboard('@ann');
    await settle();
    expect(items()[0].textContent).toContain('Template: Anna Chen');
    await userEvent.click(items()[0]);
    await settle();
    expect(getNgsHeadlessEditorDocumentText(host.editor.document())).toBe('@Anna Chen ');
    expect(document.activeElement).toBe(surface);
  });

  it('selects a plugin-provided component option by pointer', async () => {
    await userEvent.keyboard('@al');
    await settle();
    await userEvent.click(items()[0].querySelector('.custom-option')!);
    await settle();
    expect(getNgsHeadlessEditorDocumentText(host.editor.document())).toBe('@Alex Morgan ');
    expect(document.activeElement).toBe(surface);
  });

  it('dismisses Escape until the query changes and closes on empty results or read-only', async () => {
    await userEvent.keyboard('@{Escape}');
    await settle();
    expect(items()).toHaveLength(0);
    await userEvent.keyboard('a');
    await settle();
    expect(items()).toHaveLength(3);
    await userEvent.keyboard('zz');
    await settle();
    expect(items()).toHaveLength(0);
    await userEvent.keyboard('{Backspace}{Backspace}');
    await settle();
    expect(items()).toHaveLength(3);
    host.editor.setReadOnly(true);
    await settle();
    expect(items()).toHaveLength(0);
  });

  it('inserts mentions in a table cell and records them in the parent history', async () => {
    host.editor.execute(NGS_HEADLESS_EDITOR_INSERT_TABLE, { rows: 1, columns: 1, header: false });
    await settle();
    await userEvent.keyboard('@ann');
    await settle();
    expect(items()).toHaveLength(1);
    await userEvent.keyboard('{Tab}');
    await settle();
    const table = () => host.editor.document().blocks.find(block => block.type === 'table')!;
    const cell = () => getNgsHeadlessEditorTableData(table()).rows[0][0];
    expect(cell().map(run => run.text).join('')).toBe('@Anna Chen ');
    expect(cell()[0].marks[0].attrs?.['id']).toBe('anna');
    expect(getNgsHeadlessEditorTableData(table()).rows).toHaveLength(1);
    host.editor.undo();
    await settle();
    expect(cell().map(run => run.text).join('')).toBe('@ann');
  });

  it('closes during IME composition and removes overlay DOM on destruction', async () => {
    await userEvent.keyboard('@');
    await settle();
    expect(items()).toHaveLength(3);
    surface.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
    await settle();
    expect(items()).toHaveLength(0);
    surface.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    await settle();
    fixture.destroy();
    expect(items()).toHaveLength(0);
  });

  it('closes for a disabled surface and restores consumer ARIA attributes', async () => {
    surface.setAttribute('aria-autocomplete', 'none');
    await userEvent.keyboard('@');
    await settle();
    expect(items()).toHaveLength(3);
    host.disabled.set(true);
    await settle();
    expect(items()).toHaveLength(0);
    expect(surface.getAttribute('aria-autocomplete')).toBe('none');
  });
});
