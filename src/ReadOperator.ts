import { Property, SelectionType } from './types';
import { FantasyObservable } from '@cycle/run';
import { SelectionContext } from './SelectionContext';
import { from } from 'most';
import { selectDOM, getter } from './utils';
type Operator = (with$: FantasyObservable) => FantasyObservable;

export function ReadOperator({
  element,
  selection,
  table
}: SelectionContext) {
  const { type, selector, scope } = selection;
  return function read(property: Property): Operator {
    return function <T extends any[]>(stream$: FantasyObservable) {
      return from(stream$)
        .map((args: T) => {
          const selected = selectDOM({ type, selector, scope }, element, table);
          try {
            if (type === SelectionType.Multi) {
              return selected.map(getter(property, args));
            } else {
              return getter(property, args)(selected[0]);
            }
          } catch (e) {
            return e;
          }
        });
    }
  }
}