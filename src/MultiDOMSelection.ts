import { FantasyObservable } from '@cycle/run';
import { fromEvent, from, Stream, just } from 'most';
import { SelectionType, Property, Effect, SingleDOMSelection } from './types';
import { ScopeTable } from './ScopeTable';
import { ownerTarget, selectDOM, combineSelectors, getter } from './utils';
import { OnSource } from './OnSource';
import { ReadOperator } from './ReadOperator';
import { MultiDOMSelection } from './types';

export function MultiDOMSelection(element: Element, selector: string, scope: string, table: ScopeTable, element$: Stream<Element>): MultiDOMSelection {
  const type = SelectionType.Multi;
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

  function selectAll(_sel: string) {
    return MultiDOMSelection(
      element,
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
    scope,
    on,
    read,
    effect,
    selectAll,
    type
  };
}