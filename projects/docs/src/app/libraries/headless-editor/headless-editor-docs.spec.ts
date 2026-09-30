import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { userEvent } from 'vitest/browser';
import {
  createNgsHeadlessEditorDocument,
  getNgsHeadlessEditorDocumentText,
  getNgsHeadlessEditorTableCellText,
  getNgsHeadlessEditorTableData
} from '@ngstarter-ui/components/headless-editor';
import { BareEditorExample } from './_examples/bare-editor-example/bare-editor-example';
import { BlocksEditorExample } from './_examples/blocks-editor-example/blocks-editor-example';
import { BubbleMenuExample } from './_examples/bubble-menu-example/bubble-menu-example';
import { ComponentBlockExample } from './_examples/component-block-example/component-block-example';
import { CustomPluginExample } from './_examples/custom-plugin-example/custom-plugin-example';
import { FormsSerializationExample } from './_examples/forms-serialization-example/forms-serialization-example';
import { JsonInspectorExample } from './_examples/json-inspector-example/json-inspector-example';
import { PluginEditorExample } from './_examples/plugin-editor-example/plugin-editor-example';
import { SelectionHistoryExample } from './_examples/selection-history-example/selection-history-example';
import { ToolbarEditorExample } from './_examples/toolbar-editor-example/toolbar-editor-example';
import { TableEditorExample } from './_examples/table-editor-example/table-editor-example';
import { Tables } from './tables/tables';
import { Overview } from './overview/overview';
import { GettingStarted } from './getting-started/getting-started';
import { DocumentModel } from './document-model/document-model';
import { Surface } from './surface/surface';
import { Commands } from './commands/commands';
import { Marks } from './marks/marks';
import { Blocks } from './blocks/blocks';
import { ComponentBlocks } from './component-blocks/component-blocks';
import { Plugins } from './plugins/plugins';
import { SelectionHistory } from './selection-history/selection-history';
import { Serialization } from './serialization/serialization';
import { Api } from './api/api';
import { Mentions } from './mentions/mentions';
import { MentionsEditorExample } from './_examples/mentions-editor-example/mentions-editor-example';

async function render<T>(type: Type<T>) {
  TestBed.configureTestingModule({ imports: [type], providers: [provideRouter([]), provideHttpClient()] });
  const fixture = TestBed.createComponent(type);
  fixture.autoDetectChanges();
  document.body.append(fixture.nativeElement);
  await fixture.whenStable();
  await new Promise(resolve => setTimeout(resolve, 50));
  return fixture;
}

describe('headless editor docs', () => {
  afterEach(() => TestBed.resetTestingModule());

  const examples: [string, Type<unknown>, string][] = [
    ['bare', BareEditorExample, 'completely unstyled'],
    ['toolbar', ToolbarEditorExample, 'Release notes'],
    ['blocks', BlocksEditorExample, 'Deployment checklist'],
    ['component blocks', ComponentBlockExample, 'Callouts are Angular components'],
    ['custom plugin', CustomPluginExample, 'Select a word'],
    ['selection', SelectionHistoryExample, 'consecutive characters'],
    ['forms', FormsSerializationExample, ''],
    ['bubble', BubbleMenuExample, 'floating formatting menu'],
    ['json', JsonInspectorExample, 'Text runs carry'],
    ['plugin', PluginEditorExample, 'custom underline'],
    ['table', TableEditorExample, 'Pricing'],
    ['mentions', MentionsEditorExample, 'Ask a teammate']
  ];

  for (const [name, type, text] of examples) {
    it(`renders the ${name} example`, async () => {
      const fixture = await render(type);
      const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
      expect(surface).not.toBeNull();
      expect(surface.getAttribute('contenteditable')).toBe('true');
      expect(surface.textContent).toContain(text);
    });
  }

  it('toolbar: heading block and active states', async () => {
    const fixture = await render(ToolbarEditorExample);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.surface h2')?.textContent).toBe('Release notes');
    expect(el.querySelector('.surface blockquote')).not.toBeNull();
    expect(el.querySelector('.surface strong')?.textContent).toBe('keyboard shortcuts');
    // caret into the heading -> heading button active
    const heading = el.querySelector('.surface h2')!.firstChild as Text;
    await userEvent.click(el.querySelector('.surface h2')!);
    const range = document.createRange(); range.setStart(heading, 2); range.collapse(true);
    document.getSelection()!.removeAllRanges(); document.getSelection()!.addRange(range);
    await new Promise(r => setTimeout(r, 20)); await fixture.whenStable();
    const headingButton = el.querySelector('[aria-label="Heading"]')!;
    expect(headingButton.classList.contains('active')).toBe(true);
    await userEvent.keyboard('{End}{Enter}Body');
    await fixture.whenStable();
    const blocks = [...el.querySelectorAll('.surface > *')].map(b => b.tagName.toLowerCase());
    expect(blocks.slice(0, 2)).toEqual(['h2', 'p']);
  });

  it('toolbar: Enter twice leaves the quote with real key presses', async () => {
    const fixture = await render(ToolbarEditorExample);
    const el = fixture.nativeElement as HTMLElement;
    const quote = el.querySelector('.surface blockquote') as HTMLElement;
    await userEvent.click(quote);
    const text = quote.firstChild as Text;
    const range = document.createRange(); range.setStart(text, text.length); range.collapse(true);
    document.getSelection()!.removeAllRanges(); document.getSelection()!.addRange(range);
    await new Promise(r => setTimeout(r, 20));
    await userEvent.keyboard('{Enter}{Enter}After');
    await fixture.whenStable();
    const tags = [...el.querySelectorAll('.surface > *')].map(b => b.tagName.toLowerCase());
    expect(tags).toEqual(['h2', 'p', 'blockquote', 'p']);
    expect(el.querySelector('.surface > p:last-child')?.textContent).toBe('After');
  });

  it('table example: edit a cell and add a row from the toolbar', async () => {
    const fixture = await render(TableEditorExample);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.surface th')).toHaveLength(3);
    const buttons = [...el.querySelectorAll('.toolbar button')] as HTMLButtonElement[];
    const rowBelow = buttons.find(button => button.textContent?.trim() === 'Row below')!;
    expect(rowBelow.disabled).toBe(true);

    await userEvent.click(el.querySelector('[data-row="2"][data-column="2"]')!);
    await userEvent.keyboard(' / month');
    await fixture.whenStable();
    expect(rowBelow.disabled).toBe(false);
    expect(el.querySelector('.status')?.textContent).toContain('row 3, column 3');

    await userEvent.click(rowBelow);
    await fixture.whenStable();
    const component = fixture.componentInstance as TableEditorExample;
    const rows = getNgsHeadlessEditorTableData(component.editor.document().blocks[1]).rows;
    expect(rows.length).toBe(4);
    expect(getNgsHeadlessEditorTableCellText(rows[2][2])).toBe('$49 / month');
    // The highlight of "$49" survives typing after it.
    expect(rows[2][2][0].marks.map(mark => mark.type)).toEqual(['backgroundColor']);
  });

  it('table example: the formatting toolbar formats the focused cell', async () => {
    const fixture = await render(TableEditorExample);
    const el = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as TableEditorExample;
    const bold = [...el.querySelectorAll('.toolbar button')].find(button => button.textContent?.trim() === 'B') as HTMLButtonElement;

    await userEvent.click(el.querySelector('[data-row="1"][data-column="0"] .ngs-headless-editor-table-cell-content')!);
    await fixture.whenStable();
    await userEvent.click(bold);
    await userEvent.keyboard(' plan');
    await fixture.whenStable();

    const cell = getNgsHeadlessEditorTableData(component.editor.document().blocks[1]).rows[1][0];
    expect(cell.map(run => [run.text, run.marks.map(mark => mark.type)])).toEqual([['Starter', []], [' plan', ['bold']]]);
    expect(bold.classList.contains('active')).toBe(true);
  });

  it('blocks: divider, bullet and code render', async () => {
    const fixture = await render(BlocksEditorExample);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.surface ul > li').length).toBe(2);
    expect(el.querySelector('.surface pre > code')?.textContent).toBe('npm run build:prod');
    expect(el.querySelector('.surface hr')).not.toBeNull();
    expect(el.querySelectorAll('table[ngs-table] tbody tr').length).toBe(6);
    const removeButton = el.querySelector('table[ngs-table] tbody button') as HTMLButtonElement;
    await userEvent.click(removeButton);
    await fixture.whenStable();
    expect(el.querySelectorAll('table[ngs-table] tbody tr').length).toBe(5);
    expect(el.querySelector('table[ngs-table]')?.textContent).not.toContain('Deployment checklist');
    expect(el.querySelector('.surface h3')).toBeNull();
  });

  it('mentions example renders teammates, emoji and commands through one plugin', async () => {
    const fixture = await render(MentionsEditorExample);
    const component = fixture.componentInstance;
    const surface = fixture.nativeElement.querySelector('[ngsHeadlessEditorSurface]') as HTMLElement;
    for (const [query, selector, expected] of [
      ['@ann', 'app-mention-option', '@Anna Chen '],
      [':smi', 'app-emoji-option', '😊 '],
      ['/sum', 'app-command-option', '/summarize ']
    ]) {
      component.editor.setDocument(createNgsHeadlessEditorDocument(''));
      await fixture.whenStable();
      await userEvent.click(surface);
      await userEvent.keyboard(query);
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(document.querySelector(`.cdk-overlay-container ${selector}`)).not.toBeNull();
      await userEvent.keyboard('{Enter}');
      await fixture.whenStable();
      expect(getNgsHeadlessEditorDocumentText(component.editor.document())).toBe(expected);
      const token = surface.querySelector<HTMLElement>('.ngs-headless-editor-mention')!;
      expect(token.contentEditable).toBe('false');
      expect(getComputedStyle(token).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    }
  });

  it('component block: typing in textarea updates attrs, read-only swaps renderer', async () => {
    const fixture = await render(ComponentBlockExample);
    const el = fixture.nativeElement as HTMLElement;
    const textarea = el.querySelector('.surface textarea') as HTMLTextAreaElement;
    expect(textarea.value).toContain('Maintenance');
    await userEvent.click(textarea);
    await userEvent.keyboard('{End} Soon');
    await fixture.whenStable();
    const callout = (fixture.componentInstance as ComponentBlockExample).editor.document().blocks[1];
    expect(callout.attrs?.['text']).toBe('Maintenance window starts at 22:00 UTC. Soon');
    expect(el.querySelector('.surface textarea')).toBe(textarea);
    (el.querySelector('.toolbar button:nth-child(2)') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(el.querySelector('.surface textarea')).toBeNull();
    expect(el.querySelector('.surface aside .text')?.textContent).toContain('Soon');
  });

  it('custom plugin: link command and paste', async () => {
    const fixture = await render(CustomPluginExample);
    const component = fixture.componentInstance as CustomPluginExample;
    const editor = component.editor;
    const block = editor.document().blocks[0];
    editor.setSelection({ anchor: { blockId: block.id, offset: 0 }, focus: { blockId: block.id, offset: 6 } });
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('.toolbar button') as HTMLButtonElement).click();
    await fixture.whenStable();
    const link = fixture.nativeElement.querySelector('.surface a') as HTMLAnchorElement;
    expect(link?.textContent).toBe('Select');
    expect(link.getAttribute('href')).toBe('https://ngstarter.com');
    expect(component.stats.links()).toBe(1);
    expect(component.stats.words()).toBeGreaterThan(5);
    expect(editor.plugins().length).toBe(4);
    component.removeDraftPlugin();
    expect(editor.plugins().length).toBe(3);
    expect(localStorage.getItem('ngs-headless-editor-plugins-example')).toContain('Select');
    editor.setDocument(createNgsHeadlessEditorDocument('changed'));
    component.installDraftPlugin();
    expect(component.restored()).toBe(true);
    expect(getNgsHeadlessEditorDocumentText(editor.document())).toContain('Select a word');
    component.forgetDraft();
  });

  it('forms: typing marks the body valid and produces HTML', async () => {
    const fixture = await render(FormsSerializationExample);
    const el = fixture.nativeElement as HTMLElement;
    const component = fixture.componentInstance as FormsSerializationExample;
    expect(component.form.controls.body.valid).toBe(false);
    await userEvent.click(el.querySelector('app-rich-text-field .surface')!);
    await userEvent.keyboard('Hello <world>');
    await fixture.whenStable();
    expect(component.form.controls.body.valid).toBe(true);
    expect(component.html()).toBe('<p>Hello &lt;world&gt;</p>');
    component.loadSaved();
    await fixture.whenStable();
    expect(el.querySelector('app-rich-text-field .surface strong')?.textContent).toBe('JSON document');
    component.toggleDisabled();
    await fixture.whenStable();
    expect(el.querySelector('app-rich-text-field .surface')?.getAttribute('contenteditable')).toBe('false');
  });

  it('json inspector applies edited JSON and reports errors', async () => {
    const fixture = await render(JsonInspectorExample);
    const component = fixture.componentInstance as JsonInspectorExample;
    component.draft.set('{"version":1,"blocks":[{"type":"paragraph","content":[{"type":"text","text":"From JSON","marks":[]}]}]}');
    component.apply();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.surface').textContent).toBe('From JSON');
    component.draft.set('{oops');
    component.apply();
    expect(component.error()).toBeTruthy();
  });

  it('selection example: select all + bold', async () => {
    const fixture = await render(SelectionHistoryExample);
    const component = fixture.componentInstance as SelectionHistoryExample;
    component.selectAll();
    component.editor.execute(component.bold);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.surface strong').length).toBe(2);
    component.editor.undo();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.surface strong').length).toBe(0);
  });

  const pages: [string, Type<unknown>, string][] = [
    ['overview', Overview, 'Headless Editor'],
    ['getting started', GettingStarted, 'Getting Started'],
    ['document model', DocumentModel, 'Document Model'],
    ['surface', Surface, 'Surface and Input'],
    ['commands', Commands, 'Commands and Toolbar'],
    ['marks', Marks, 'Marks and Formatting'],
    ['blocks', Blocks, 'Blocks'],
    ['component blocks', ComponentBlocks, 'Component Blocks'],
    ['plugins', Plugins, 'Plugins'],
    ['selection', SelectionHistory, 'Selection and History'],
    ['serialization', Serialization, 'Forms and Serialization'],
    ['tables', Tables, 'Tables'],
    ['api', Api, 'Headless Editor API'],
    ['mentions', Mentions, 'Mentions']
  ];
  for (const [name, type, title] of pages) {
    it(`renders the ${name} page`, async () => {
      const fixture = await render(type);
      expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain(title);
      expect(fixture.nativeElement.textContent.length).toBeGreaterThan(400);
    });
  }
});
