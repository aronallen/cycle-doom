import { ScopeTable } from './ScopeTable';
import { DOMSelection, SelectionType, Property } from './types';
export function nodeListToArray(nodes: NodeListOf<Element>): Array<Element> {
  return Array.prototype.slice.apply(nodes, []);
}

export function matchesSelection(selection: DOMSelection<SelectionType>, element: Element, table: ScopeTable) {
  const node = table.retreive(selection.scope) || element;
  const selected = node.querySelector(selection.selector);
  if (selected) {
    return true;
  } else {
    return false;
  }
}

export function selectDOM(selection: DOMSelection<SelectionType>, element: Element, table: ScopeTable): Array<Element> {
  const root = selection.scope ? table.retreive(selection.scope) : element;
  switch (selection.type) {
    case SelectionType.Root:
      return [root];
    case SelectionType.Single:
      if (selection.selector) {
        const node = root.querySelector(selection.selector);
        if (node) {
          return [node]
        } else {
          return [];
        }
      } else {
        return [root];
      }
    case SelectionType.Multi:
      return nodeListToArray(
        root.querySelectorAll(selection.selector)
      );
  }
}

export function setter(property: Property, value: any) {
  return function(element: any) {
    if (typeof element[property] === 'function') {
      (element[property] as Function).apply(element, value);
    } else {
      (element[property] as any) = value;
    }
  }
}

export function getter<T extends any[]>(property: Property, args: T) {
  return function (node: any) {
    if (node) {
      if (typeof node[property] === 'function') {
        return (node[property] as Function).apply(node, args);
      } else {
        return node[property];
      }
    } else {
      throw new Error('Selection is not in DOM');
    }
  }
}