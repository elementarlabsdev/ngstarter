import { Injectable } from '@angular/core';

export type TextAlignment = 'left' | 'center' | 'right' | 'justify' | 'start' | 'end' | '' | null;
export type ElementAttributes = { [key: string]: string };

@Injectable({
  providedIn: 'root'
})
export class TextHighlightService {

  private savedRange: Range | null = null;

  constructor() { }

  public saveCurrentSelection(): void {
    const selection = window.getSelection();
    const range = this.getCurrentRangeInternal(selection);
    this.savedRange = range ? range.cloneRange() : null;
    // // console.log('TextHighlightService: Выделение сохранено/очищено.');
  }

  public restoreSelection(): void {
    if (!this.savedRange) {
      // // console.warn('TextHighlightService: Нет сохраненного выделения для восстановления.');
      return;
    }
    const selection = window.getSelection();
    if (!selection) {
      // // console.error('TextHighlightService: Не удалось получить window.getSelection() для восстановления.');
      this.savedRange = null;
      return;
    }
    if (this.savedRange.startContainer.isConnected && this.savedRange.endContainer.isConnected) {
      try {
        selection.removeAllRanges();
        selection.addRange(this.savedRange);
        // // console.log('TextHighlightService: Выделение восстановлено.');
      } catch (e) {
        // // console.error('TextHighlightService: Ошибка при восстановлении выделения:', e);
        this.savedRange = null;
      }
    } else {
      // // console.warn('TextHighlightService: Сохраненный диапазон стал невалидным, восстановление невозможно.');
      this.savedRange = null;
    }
  }

  /**
   * Оборачивает текущее выделение указанным тегом, применяя стили, классы и атрибуты.
   * Если выделение уже ТОЧНО СОВПАДАЕТ С ГРАНИЦАМИ существующего тега того же типа,
   * то стили, классы и атрибуты ДОПОЛНЯЮТСЯ/ПЕРЕЗАПИСЫВАЮТСЯ на этом существующем теге.
   * В противном случае всегда создается новая обертка.
   * НЕ пытается "разрезать" элементы.
   */
  public wrapSelection(
    tagName: string,
    styles?: Partial<CSSStyleDeclaration>,
    classNames?: string[],
    attrs?: ElementAttributes
  ): void {
    const selection = window.getSelection();
    const range = this.getCurrentRangeInternal(selection);
    if (!range || !selection) {
      // // console.warn('TextHighlightService (wrapSelection): Нет валидного выделения.');
      return;
    }
    const normalizedTagName = tagName.toLowerCase();

    const exactExistingContainer = this.findExactWrappingElement(range, normalizedTagName);

    if (exactExistingContainer) {
      this.applyStylesAttributesAndClasses(exactExistingContainer, styles, classNames, attrs);
      selection.removeAllRanges();
      const newExactRange = document.createRange();
      newExactRange.selectNodeContents(exactExistingContainer);
      selection.addRange(newExactRange);
      // // console.log(`TextHighlightService (wrapSelection): Модифицирован существующий элемент <${normalizedTagName}>.`);
    } else {
      this.wrapRange(selection, range, normalizedTagName, styles, classNames, attrs);
      // // console.log(`TextHighlightService (wrapSelection): Создана новая обертка <${normalizedTagName}>.`);
    }
  }

  /**
   * "Умное" оборачивание:
   * - Если выделение точно покрывает существующий элемент того же типа -> модифицирует его.
   * - Если выделение частично внутри inline-элемента того же типа -> разделяет его и оборачивает выделенную часть.
   * - В остальных случаях -> создает новую обертку.
   */
  public wrapOrSplitInlineSelection(
    tagName: string,
    styles?: Partial<CSSStyleDeclaration>,
    classNames?: string[],
    attrs?: ElementAttributes
  ): void {
    const selection = window.getSelection();
    const range = this.getCurrentRangeInternal(selection);
    if (!range || !selection) {
      // // console.warn('TextHighlightService (wrapOrSplitInlineSelection): Нет валидного выделения.');
      return;
    }
    const normalizedTagName = tagName.toLowerCase();

    const exactContainer = this.findExactWrappingElement(range, normalizedTagName);
    if (exactContainer) {
      this.applyStylesAttributesAndClasses(exactContainer, styles, classNames, attrs);
      selection.removeAllRanges();
      const newExactRange = document.createRange();
      newExactRange.selectNodeContents(exactContainer);
      selection.addRange(newExactRange);
      // // console.log(`TextHighlightService (wrapOrSplitInlineSelection): Модифицирован существующий <${normalizedTagName}>.`);
      return;
    }

    const containingAncestor = this.findContainingAncestor(range, normalizedTagName);
    if (containingAncestor && this.isInlineElement(containingAncestor)) {
      // // console.log(`TextHighlightService (wrapOrSplitInlineSelection): Попытка разделить inline <${normalizedTagName}>.`);
      this.splitInlineElementAndApplyToSelection(selection, range, containingAncestor, normalizedTagName, styles, classNames, attrs);
      return;
    }

    // // console.log(`TextHighlightService (wrapOrSplitInlineSelection): Создаем новую обертку <${normalizedTagName}>.`);
    this.wrapRange(selection, range, normalizedTagName, styles, classNames, attrs);
  }


  public unwrapSelection(tagName: string): void {
    const selection = window.getSelection();
    const range = this.getCurrentRangeInternal(selection);
    if (!range || !selection) return;

    const normalizedTagName = tagName.toLowerCase();
    const elementToUnwrap = this.findExactWrappingElement(range, normalizedTagName)
      ?? this.findContainingAncestor(range, normalizedTagName);

    if (elementToUnwrap) {
      this.unwrapElementAndReselect(selection, elementToUnwrap);
      // // console.log(`TextHighlightService (unwrapSelection): <${normalizedTagName}> развернут.`);
    } else {
      // // console.warn(`TextHighlightService (unwrapSelection): Не найден <${normalizedTagName}> для разворачивания.`);
    }
  }

  public toggleWrapSelection(
    tagName: string,
    styles?: Partial<CSSStyleDeclaration>,
    classNames?: string[],
    attrs?: ElementAttributes
  ): void {
    const range = this.getCurrentRange();
    if (!range) return;

    const normalizedTagName = tagName.toLowerCase();
    const elementToUnwrap = this.findExactWrappingElement(range, normalizedTagName)
      ?? this.findContainingAncestor(range, normalizedTagName);

    if (elementToUnwrap) {
      this.unwrapSelection(normalizedTagName);
    } else {
      this.wrapOrSplitInlineSelection(normalizedTagName, styles, classNames, attrs);
    }
  }

  public isSelectionWrappedInTag(tagName: string): boolean {
    const range = this.getCurrentRange();
    if (!range) return false;
    const normalizedTagName = tagName.toLowerCase();
    const containingElement = this.findContainingAncestor(range, normalizedTagName);
    return !!containingElement;
  }

  public getCurrentRange(): Range | null {
    const selection = window.getSelection();
    return this.getCurrentRangeInternal(selection);
  }

  public findClosestBlockAncestor(requiredClassName?: string): HTMLElement | null {
    const range = this.getCurrentRange();
    if (!range) return null;

    let node: Node | null = range.commonAncestorContainer;
    const trimmedClassName = requiredClassName?.trim();

    while (node && node !== document.body && node !== document) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (!this.isInlineElement(element)) {
          if (!trimmedClassName || element.classList.contains(trimmedClassName)) {
            return element;
          }
        }
      }
      node = node.parentNode;
    }

    if (document.body && document.body.contains(range.commonAncestorContainer)) {
      if (!this.isInlineElement(document.body)) {
        if (!trimmedClassName || document.body.classList.contains(trimmedClassName)) {
          return document.body;
        }
      }
    }
    return null;
  }

  public setTextAlignment(alignment: TextAlignment): void {
    const blockAncestor = this.findClosestBlockAncestor();
    if (!blockAncestor) return;

    if (alignment && alignment.trim() !== '') {
      blockAncestor.style.textAlign = alignment;
      blockAncestor.setAttribute('data-props-text-alignment', alignment);
    } else {
      blockAncestor.style.textAlign = '';
      blockAncestor.removeAttribute('data-props-text-alignment');
    }
  }

  public unwrapElementByClassAndSelectContents(className: string): void {
    if (!className || !className.trim()) return;
    const trimmedClassName = className.trim();
    const selector = `.${trimmedClassName}`;
    const elementToUnwrap = document.querySelector(selector) as HTMLElement | null;
    if (!elementToUnwrap) return;

    const parent = elementToUnwrap.parentNode;
    if (!parent) return;

    const firstChildToSelect = elementToUnwrap.firstChild;
    const lastChildToSelect = elementToUnwrap.lastChild;

    while (elementToUnwrap.firstChild) {
      parent.insertBefore(elementToUnwrap.firstChild, elementToUnwrap);
    }
    parent.removeChild(elementToUnwrap);

    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();

    if (firstChildToSelect && lastChildToSelect && firstChildToSelect.isConnected && lastChildToSelect.isConnected) {
      try {
        const newRange = document.createRange();
        newRange.setStartBefore(firstChildToSelect);
        newRange.setEndAfter(lastChildToSelect);
        selection.addRange(newRange);
      } catch (e) { /* ... */ }
    }
  }

  public getContainingAncestorByTagName(tagName: string): HTMLElement | null {
    const range = this.getCurrentRange();
    if (!range) return null;
    const normalizedTagName = tagName.toLowerCase();
    return this.findContainingAncestor(range, normalizedTagName);
  }

  public clearSelectionFormatting(): void {
    const selection = window.getSelection();
    const range = this.getCurrentRangeInternal(selection);
    if (!range || !selection) return;

    try {
      const selectedContents = range.extractContents();
      const plainText = selectedContents.textContent || '';
      const textNode = document.createTextNode(plainText);
      range.insertNode(textNode);
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(textNode);
      selection.addRange(newRange);
    } catch (e) {
      selection.removeAllRanges();
    }
  }

  private getCurrentRangeInternal(selection: Selection | null): Range | null {
    if (!selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (range.collapsed || !range.toString().trim()) return null;
    return range;
  }

  private findExactWrappingElement(range: Range, tagName: string): HTMLElement | null {
    const commonAncestor = range.commonAncestorContainer;
    let candidateElement: HTMLElement | null =
      (commonAncestor.nodeType === Node.ELEMENT_NODE && (commonAncestor as HTMLElement).tagName.toLowerCase() === tagName)
        ? commonAncestor as HTMLElement
        : this.findClosestAncestorByTagName(commonAncestor, tagName);

    if (!candidateElement) return null;

    const elementRange = document.createRange();
    try {
      elementRange.selectNodeContents(candidateElement);
      if (range.compareBoundaryPoints(Range.START_TO_START, elementRange) === 0 &&
        range.compareBoundaryPoints(Range.END_TO_END, elementRange) === 0) {
        return candidateElement;
      }
    } catch (e) { /*// console.error("Error in findExactWrappingElement:", e);*/ }
    return null;
  }

  private findContainingAncestor(range: Range, tagName: string): HTMLElement | null {
    let node: Node | null = range.commonAncestorContainer;
    while (node && node !== document.body && node !== document) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.tagName.toLowerCase() === tagName) {
          const elementRange = document.createRange();
          try {
            elementRange.selectNodeContents(element);
            if (range.compareBoundaryPoints(Range.START_TO_START, elementRange) >= 0 &&
              range.compareBoundaryPoints(Range.END_TO_END, elementRange) <= 0) {
              return element;
            }
          } catch(e) { /*// console.error("Error in findContainingAncestor:", e); */ }
        }
      }
      node = node.parentNode;
    }
    return null;
  }

  private findClosestAncestorByTagName(node: Node, tagName: string): HTMLElement | null {
    let currentNode: Node | null = node;
    while (currentNode && currentNode !== document.body && currentNode !== document) {
      if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as HTMLElement).tagName.toLowerCase() === tagName) {
        return currentNode as HTMLElement;
      }
      currentNode = currentNode.parentNode;
    }
    return null;
  }

  private findClosestAncestorByClassName(node: Node, className: string): HTMLElement | null {
    let currentNode: Node | null = node;
    const trimmedClassName = className.trim();
    if (!trimmedClassName) return null;
    while (currentNode && currentNode !== document.body && currentNode !== document) {
      if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as HTMLElement).classList.contains(trimmedClassName)) {
        return currentNode as HTMLElement;
      }
      currentNode = currentNode.parentNode;
    }
    return null;
  }

  private applyStylesAttributesAndClasses(
    element: HTMLElement,
    styles?: Partial<CSSStyleDeclaration>,
    classNames?: string[],
    attrs?: ElementAttributes
  ): void {
    if (styles) {
      for (const styleName in styles) {
        if (Object.prototype.hasOwnProperty.call(styles, styleName)) {
          // @ts-ignore
          if (styles[styleName] !== undefined && isNaN(Number(styleName))) {
            try {
              element.style[styleName as any] = styles[styleName]!;
            } catch (e) { /* ... */ }
          }
        }
      }
    }
    if (classNames && classNames.length > 0) {
      const validClasses = classNames.filter(cn => cn && cn.trim());
      if (validClasses.length > 0) {
        element.classList.add(...validClasses);
      }
    }
    if (attrs) {
      for (const attrName in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, attrName)) {
          const attrValue = attrs[attrName];
          if (attrValue === null) {
            element.removeAttribute(attrName);
          } else if (attrValue !== undefined) {
            element.setAttribute(attrName, attrValue);
          }
        }
      }
    }
  }

  private wrapRange(
    selection: Selection,
    range: Range,
    tagName: string,
    styles?: Partial<CSSStyleDeclaration>,
    classNames?: string[],
    attrs?: ElementAttributes
  ): void {
    try {
      const wrapperElement = document.createElement(tagName);
      this.applyStylesAttributesAndClasses(wrapperElement, styles, classNames, attrs);

      const selectedContents = range.extractContents();
      wrapperElement.appendChild(selectedContents);
      range.insertNode(wrapperElement);

      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(wrapperElement);
      selection.addRange(newRange);
    } catch (e) {
      selection.removeAllRanges();
    }
  }

  private createMarker(id: string): HTMLSpanElement {
    const marker = document.createElement('span');
    marker.id = id;
    marker.style.display = 'none';
    marker.setAttribute('data-selection-marker', 'true');
    return marker;
  }

  private unwrapElementAndReselect(selection: Selection, elementToUnwrap: HTMLElement): void {
    const parent = elementToUnwrap.parentNode;
    if (!parent) return;

    const startMarkerId = `__sel_start_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const endMarkerId = `__sel_end_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    let markersInserted = false;
    const originalRange = this.getCurrentRangeInternal(selection);

    try {
      if (originalRange) {
        const startMarker = this.createMarker(startMarkerId);
        const endMarker = this.createMarker(endMarkerId);
        const rangeEnd = originalRange.cloneRange();
        rangeEnd.collapse(false); rangeEnd.insertNode(endMarker);
        const rangeStart = originalRange.cloneRange();
        rangeStart.collapse(true); rangeStart.insertNode(startMarker);
        markersInserted = true;
        selection.removeAllRanges();
      }
    } catch (e) {
      markersInserted = false;
      if(selection) selection.removeAllRanges();
    }

    if (markersInserted || !originalRange) {
      while (elementToUnwrap.firstChild) {
        parent.insertBefore(elementToUnwrap.firstChild, elementToUnwrap);
      }
      parent.removeChild(elementToUnwrap);
    } else {
      return;
    }

    if (markersInserted) {
      const startMarker = document.getElementById(startMarkerId);
      const endMarker = document.getElementById(endMarkerId);
      if (startMarker?.parentNode && endMarker?.parentNode) {
        try {
          const newRange = document.createRange();
          newRange.setStartAfter(startMarker);
          newRange.setEndBefore(endMarker);
          const currentSelection = window.getSelection();
          if(currentSelection) {
            currentSelection.removeAllRanges();
            currentSelection.addRange(newRange);
          }
        } catch (e) { window.getSelection()?.removeAllRanges(); }
        finally {
          startMarker.parentNode.removeChild(startMarker);
          endMarker.parentNode.removeChild(endMarker);
        }
      } else {
        document.getElementById(startMarkerId)?.remove();
        document.getElementById(endMarkerId)?.remove();
        window.getSelection()?.removeAllRanges();
      }
    } else {
      window.getSelection()?.removeAllRanges();
    }
  }

  private isInlineElement(element: HTMLElement): boolean {
    if (!element) return false;
    const display = window.getComputedStyle(element).display;
    return display.startsWith('inline');
  }

  private splitInlineElementAndApplyToSelection(
    selection: Selection,
    selectedRange: Range,
    existingElement: HTMLElement,
    newTagName: string,
    newWrapperStyles?: Partial<CSSStyleDeclaration>,
    newWrapperClassNames?: string[],
    newWrapperAttrs?: ElementAttributes
  ): void {
    const parent = existingElement.parentNode;
    if (!parent) {
      this.wrapRange(selection, selectedRange, newTagName, newWrapperStyles, newWrapperClassNames, newWrapperAttrs);
      return;
    }

    const newWrapperForSelection = document.createElement(newTagName);
    this.applyStylesAttributesAndClasses(newWrapperForSelection, newWrapperStyles, newWrapperClassNames, newWrapperAttrs);

    const originalElementAttributes: ElementAttributes = {};
    for (let i = 0; i < existingElement.attributes.length; i++) {
      const attr = existingElement.attributes[i];
      originalElementAttributes[attr.name] = attr.value;
    }

    const prefixRange = document.createRange();
    prefixRange.setStart(existingElement, 0); // От начала содержимого existingElement
    try {
      prefixRange.setEnd(selectedRange.startContainer, selectedRange.startOffset);
    } catch (e) {
      // Если selectedRange.startContainer не является потомком existingElement, это может вызвать ошибку.
      // В таком случае, префиксной части нет или она не может быть корректно определена этим способом.
      // console.warn("Error setting prefixRange end:", e);
      prefixRange.setEnd(existingElement, 0); // Схлопываем в начало
    }


    let prefixElementClone: HTMLElement | null = null;
    if (!prefixRange.collapsed) {
      try {
        const prefixFragment = prefixRange.extractContents();
        prefixElementClone = document.createElement(existingElement.tagName);
        for (const attrName in originalElementAttributes) {
          if (Object.prototype.hasOwnProperty.call(originalElementAttributes, attrName)) {
            prefixElementClone.setAttribute(attrName, originalElementAttributes[attrName]);
          }
        }
        prefixElementClone.appendChild(prefixFragment);
      } catch(e) {
        // console.error("Error extracting/creating prefix:", e);
        prefixElementClone = null; // Не удалось создать префикс
      }
    }

    // Извлекаем выделенное содержимое ДО работы с суффиксом, так как selectedRange может стать невалидным
    let selectedFragment: DocumentFragment;
    try {
      if (selectedRange.commonAncestorContainer.isConnected && !selectedRange.collapsed) {
        selectedFragment = selectedRange.extractContents();
      } else {
        selectedFragment = document.createDocumentFragment(); // Пустой, если не удалось извлечь
      }
    } catch(e) {
      // console.error("Error extracting selectedFragment:", e);
      selectedFragment = document.createDocumentFragment();
    }


    let suffixElementClone: HTMLElement | null = null;
    // То, что осталось в existingElement после извлечения префикса и выделенной части, - это суффикс
    if (existingElement.hasChildNodes()) {
      suffixElementClone = document.createElement(existingElement.tagName);
      for (const attrName in originalElementAttributes) {
        if (Object.prototype.hasOwnProperty.call(originalElementAttributes, attrName)) {
          suffixElementClone.setAttribute(attrName, originalElementAttributes[attrName]);
        }
      }
      while (existingElement.firstChild) {
        suffixElementClone.appendChild(existingElement.firstChild);
      }
    }

    newWrapperForSelection.appendChild(selectedFragment);

    const insertBeforeOriginal = existingElement;

    if (prefixElementClone) {
      parent.insertBefore(prefixElementClone, insertBeforeOriginal);
    }
    parent.insertBefore(newWrapperForSelection, insertBeforeOriginal);
    if (suffixElementClone) {
      parent.insertBefore(suffixElementClone, insertBeforeOriginal);
    }

    parent.removeChild(existingElement);

    selection.removeAllRanges();
    const finalRange = document.createRange();
    finalRange.selectNodeContents(newWrapperForSelection);
    selection.addRange(finalRange);
  }

}
