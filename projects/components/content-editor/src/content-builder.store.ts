import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { ContentEditorBlock } from './types';

type ContentBuilderState = {
  focusedBlockId: string | null;
  activeBlockId: string | null;
  blocks: ContentEditorBlock[]
};

const initialState: ContentBuilderState = {
  focusedBlockId: null,
  activeBlockId: null,
  blocks: []
};

export const ContentBuilderStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    setFocusedBlockId(focusedBlockId: string | null): void {
      patchState(store, (state) => ({ focusedBlockId }));
    },
    setActiveBlockId(activeBlockId: string | null): void {
      patchState(store, (state) => ({ activeBlockId }));
    },
    setBlocks(blocks: ContentEditorBlock[]) {
      patchState(store, (state) => ({ blocks }));
    },
    addBlock(dataBlock: ContentEditorBlock, index: number): void {
      patchState(store, (state) => {
        const blocks = [...state.blocks];
        blocks.splice(index, 0, dataBlock);
        return {
          blocks
        }
      });
    },
    deleteBlock(blockId: string, index: number): void {
      patchState(store, (state) => {
        const blocks = [...state.blocks];
        blocks.splice(index, 1);
        return {
          blocks
        }
      });
    },
    updateBlock(blockId: string, data: any): void {
      patchState(store, (state) => {
        const blocks = [...state.blocks];
        const index = blocks.findIndex(block => block.id === blockId);
        if (index !== -1) {
          blocks[index] = {
            ...blocks[index],
            ...data
          };
        }
        return {
          blocks
        }
      });
    },
    moveBlock(fromIndex: number, toIndex: number): void {
      patchState(store, (state) => {
        const newBlocks = [...state.blocks];
        const [movedItem] = newBlocks.splice(fromIndex, 1);
        newBlocks.splice(toIndex, 0, movedItem);
        return {
          ...state,
          blocks: newBlocks,
        };
      });
    },
  }))
);
