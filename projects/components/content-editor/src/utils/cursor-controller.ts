export class CursorController {
  private targetElement: HTMLElement;

  /**
   * Creates an instance of CursorController.
   * @param {HTMLElement | string} elementOrSelector - The target HTML element or a CSS selector string to find it.
   * @throws {Error} If the element cannot be found using the selector.
   */
  constructor(elementOrSelector: HTMLElement | string) {
    const element = typeof elementOrSelector === 'string'
      ? document.querySelector<HTMLElement>(elementOrSelector)
      : elementOrSelector;

    if (!element) {
      throw new Error(`CursorController: Element not found for selector "${elementOrSelector}"`);
    }

    // Basic check if the element type might support cursor positioning
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element.isContentEditable)) {
      console.warn(`CursorController: Target element (${element.tagName}) is not an input, textarea, or contenteditable. Cursor positioning may not work as expected.`);
    }

    this.targetElement = element;
  }

  /**
   * Sets the cursor position to the beginning of the element's textContent.
   * Ensures the element is focused before attempting to set the position.
   */
  public setToStart(): void {
    this.targetElement.focus(); // Element must be focused to manipulate selection reliably

    // Short delay can sometimes help ensure focus is registered before selection change
    // Especially relevant in complex UI interactions or frameworks.
    // Use requestAnimationFrame for a slightly better timing than setTimeout(0)
    requestAnimationFrame(() => {
      if (this.isInputOrTextAreaElement(this.targetElement)) {
        // Handle <input> and <textarea> elements
        this.targetElement.selectionStart = 0;
        this.targetElement.selectionEnd = 0;
      } else if (this.targetElement.isContentEditable) {
        // Handle contenteditable elements using Selection API
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(this.targetElement); // Select all textContent within the element
          range.collapse(true); // Collapse the range to its start point
          selection.removeAllRanges(); // Clear any existing selections
          selection.addRange(range); // Add the new collapsed range
        }
      } else {
        console.warn(`CursorController: Cannot set cursor start on a non-editable element (${this.targetElement.tagName}).`);
      }
    });
  }

  /**
   * Sets the cursor position to the end of the element's textContent.
   * Ensures the element is focused before attempting to set the position.
   */
  public setToEnd(): void {
    this.targetElement.focus(); // Element must be focused

    requestAnimationFrame(() => {
      if (this.isInputOrTextAreaElement(this.targetElement)) {
        // Handle <input> and <textarea> elements
        const length = this.targetElement.value.length;
        this.targetElement.selectionStart = length;
        this.targetElement.selectionEnd = length;
      } else if (this.targetElement.isContentEditable) {
        // Handle contenteditable elements using Selection API
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(this.targetElement); // Select all textContent
          range.collapse(false); // Collapse the range to its end point
          selection.removeAllRanges(); // Clear existing selections
          selection.addRange(range); // Add the new collapsed range
        }
      } else {
        console.warn(`CursorController: Cannot set cursor end on a non-editable element (${this.targetElement.tagName}).`);
      }
    });
  }

  /**
   * Type guard to check if the element is an HTMLInputElement or HTMLTextAreaElement.
   * @param element The element to check.
   * @returns {boolean} True if the element is an input or textarea.
   */
  private isInputOrTextAreaElement(element: HTMLElement): element is HTMLInputElement | HTMLTextAreaElement {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
  }

  /**
   * Gets the underlying HTML element being controlled.
   * @returns {HTMLElement} The target element.
   */
  public getElement(): HTMLElement {
    return this.targetElement;
  }
}
