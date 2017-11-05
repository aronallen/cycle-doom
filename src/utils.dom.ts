import { ScopeTable } from './ScopeTable';
import { Property, SelectionType, DOMSelection } from './types';
export function setter(property: Property, value: any[]) {
  return function(element: Element & {[key: string]: any}) {
    if (typeof element[property] === 'function') {
      (element[property] as Function).apply(element, value);
    } else {
      (element[property] as any) = value[0];
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

export function withinScope(target: Element, scope: string, table: ScopeTable) {
  const element = table.retreive(scope);
  return element.contains(target);
}

export function within(target: Element, parent: Element) {
  let cursor: Element | null = target;
  while (cursor instanceof Element) {
    if (cursor === parent) {
      return true;
    } else {
      cursor = cursor.parentElement;
    }
  }
  return false;
}
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

export function ownerTarget(
  target: Element,
  container: Element,
  selection: DOMSelection<SelectionType>
): Element | null {
  switch(selection.type) {
    case SelectionType.Root:
    case SelectionType.Single:
      const owner = container.querySelector(selection.selector);
      if (owner && within(target, owner)) {
        return owner;
      } else {
        return null;
      }
    case SelectionType.Multi:
      const owners = nodeListToArray(container.querySelectorAll(selection.selector));
      return owners.find(owner => within(target, owner)) || null;
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
