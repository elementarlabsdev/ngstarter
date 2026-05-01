import { InjectionToken } from '@angular/core';

export type ReorderFunction = (
    order: Map<any, number>,
    currentVisualIndex: number,
    newVisualIndex: number,
) => Map<any, number>;

export const tilesSwap: ReorderFunction = (order, currentVisualIndex, newVisualIndex) => {
    const reverseOrder = new Map<number, any>();
    order.forEach((visual, key) => {
        reverseOrder.set(visual, key);
    });

    const keyOfDragged = reverseOrder.get(currentVisualIndex);
    const keyOfTarget = reverseOrder.get(newVisualIndex);

    if (keyOfDragged === undefined || keyOfTarget === undefined) {
        return order;
    }

    const newOrder = new Map(order);
    newOrder.set(keyOfDragged, newVisualIndex);
    newOrder.set(keyOfTarget, currentVisualIndex);

    return newOrder;
};

export const tilesShift: ReorderFunction = (order, currentVisualIndex, newVisualIndex) => {
    const reverseOrder = new Map<number, any>();
    order.forEach((visual, key) => {
        reverseOrder.set(visual, key);
    });

    const keyOfDragged = reverseOrder.get(currentVisualIndex);

    if (keyOfDragged === undefined || currentVisualIndex === newVisualIndex) {
        return order;
    }

    const newOrder = new Map<any, number>();
    const from = currentVisualIndex;
    const to = newVisualIndex;

    if (from < to) { // Dragging down/right
        order.forEach((visual, key) => {
            if (visual > from && visual <= to) {
                newOrder.set(key, visual - 1); // Shift up/left
            } else if (key !== keyOfDragged) {
                newOrder.set(key, visual);
            }
        });
    } else { // Dragging up/left
        order.forEach((visual, key) => {
            if (visual >= to && visual < from) {
                newOrder.set(key, visual + 1); // Shift down/right
            } else if (key !== keyOfDragged) {
                newOrder.set(key, visual);
            }
        });
    }

    // Place the dragged item at the new position
    newOrder.set(keyOfDragged, to);

    return newOrder;
};

export const TILES_REORDER = new InjectionToken<ReorderFunction>(
    'TILES_REORDER',
    {factory: () => tilesShift},
);
