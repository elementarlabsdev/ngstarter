import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { TestBed } from '@angular/core/testing';
import { KanbanBoard } from './kanban-board';
import { KanbanItem } from '../types';

describe('KanbanBoard drop', () => {
  it('discards a drop outside the active column', () => {
    const fixture = TestBed.createComponent(KanbanBoard);
    const board = fixture.componentInstance;
    const dropped = vi.fn();
    const transferred = vi.fn();
    board.itemDropped.subscribe(dropped);
    board.itemTransferred.subscribe(transferred);
    const item: KanbanItem = { name: 'Task', position: 0 };
    const source = [item];
    const destination: KanbanItem[] = [];

    board.onDropped({
      previousContainer: { data: source },
      container: { data: destination },
      previousIndex: 0,
      currentIndex: 0,
      isPointerOverContainer: false,
    } as CdkDragDrop<KanbanItem[]>);

    expect(source).toEqual([item]);
    expect(destination).toEqual([]);
    expect(dropped).not.toHaveBeenCalled();
    expect(transferred).not.toHaveBeenCalled();
  });
});
