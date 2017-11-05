import { FantasyObservable } from '@cycle/run';
import { fromEvent, from, Stream, just } from 'most';
import { SelectionType, Property, Effect, SingleDOMSelection } from './types';
import { ScopeTable } from './ScopeTable';
import { ownerTarget, selectDOM, combineSelectors, getter } from './utils';
import { OnSource } from './OnSource';
import { ReadOperator } from './ReadOperator';

export function SingleDOMSelection(element: Element, selector: string, scope: string, table: ScopeTable, element$: Stream<Element>): SingleDOMSelection {
  const type = SelectionType.Single;
  const context = {
    element,
    selection: {
      selector,
      scope,
      type,
    },
    table
  };
  const on = OnSource(context);
  const read = ReadOperator(context);

  function select(_sel: string) {
    return SingleDOMSelection(element,
      combineSelectors(selector, _sel),
      scope,
      table,
      element$
    );
  }

  function effect<T extends any>(property: Property, value?: T): FantasyObservable {
    return just({
      selection: {
        selector,
        scope,
        type
      },
      property,
      value
    })
  }

  return {
    selector,
    on,
    read,
    effect,
    select,
    scope,
    type
  }
};
