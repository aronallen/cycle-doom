import { SelectionContext } from './SelectionContext';
import { fromEvent } from 'most'; 
import { ownerTarget } from './utils';

export function OnSource({
  element,
  selection,
  table
}: SelectionContext) {
  const { type, scope, selector } = selection;
  return function on(event: string) {
    return fromEvent(event, element)
      .filter(event => {
        const container = table.retreive(scope) || element;
        const _ownerTarget = ownerTarget(event.target as Element, container, { selector, scope, type });
        (event as any).ownerTarget = _ownerTarget;
        return _ownerTarget !== null;
    });
  }
} 