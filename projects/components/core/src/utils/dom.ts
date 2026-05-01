import {ElementRef, inject} from '@angular/core';

export function injectElement<T extends Element = HTMLElement>(): T {
    return inject(ElementRef).nativeElement;
}

export function isElement(node?: Node | Element | EventTarget | null): node is Element {
    return !!node && 'nodeType' in node && node.nodeType === Node.ELEMENT_NODE;
}

export function getActualTarget(event: Event): Node {
    return (event.target ?? (event as any).currentTarget) as Node;
}
