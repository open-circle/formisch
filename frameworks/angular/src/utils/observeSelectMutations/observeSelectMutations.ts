/**
 * Checks whether a mutation can affect which option of a select is available
 * or matches the field input. Angular's control flow renders comment anchors
 * into the DOM, so mutations that only touch comments are ignored.
 *
 * @param mutation The mutation record to check.
 *
 * @returns Whether the mutation is relevant.
 */
function isRelevantMutation(mutation: MutationRecord): boolean {
  // If text content changed, it is relevant unless it belongs to a comment,
  // as an option without a value attribute uses its text as its value
  if (mutation.type === 'characterData') {
    return !(mutation.target instanceof Comment);
  }

  // If child nodes changed, it is relevant if any non-comment node was added
  // or removed
  if (mutation.type === 'childList') {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof Comment)) {
        return true;
      }
    }
    for (const node of mutation.removedNodes) {
      if (!(node instanceof Comment)) {
        return true;
      }
    }
    return false;
  }

  // Otherwise, a value attribute change is relevant if it occurred on an
  // option element
  return mutation.target instanceof HTMLOptionElement;
}

/**
 * Observes the options of a select element for additions, removals, and value
 * changes, and invokes the callback for relevant mutations. A select ignores
 * values written before the matching option exists, so the selection must be
 * re-applied when options render late. Observation is skipped in environments
 * without `MutationObserver` support.
 *
 * @param element The select element to observe.
 * @param onMutation The callback to invoke for relevant mutations.
 *
 * @returns A cleanup function that disconnects the observer, or undefined if
 *   observation is unavailable.
 */
export function observeSelectMutations(
  element: HTMLSelectElement,
  onMutation: () => void
): (() => void) | undefined {
  if (typeof MutationObserver !== 'function') {
    return;
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some(isRelevantMutation)) {
      onMutation();
    }
  });
  observer.observe(element, {
    attributes: true,
    attributeFilter: ['value'],
    characterData: true,
    childList: true,
    subtree: true,
  });
  return () => observer.disconnect();
}
