import { FantasyObservable } from '@cycle/run';
import { ScopeTable } from './ScopeTable';
import { SelectionType } from './types';
import { SingleDOMSelection } from './SingleDOMSelection';
import { MultiDOMSelection } from './MultiDOMSelection';
import { RootDOMSelection, Property, Effect } from './types';
import { trim } from './utils';
import { VNode } from 'snabbdom/vnode';
import { from, just, Stream } from 'most';

export function RootDOMSelection(element: Element, selector: string, scope: string, table: ScopeTable, element$: Stream<Element>): RootDOMSelection {
  const type = SelectionType.Root;
  const single = SingleDOMSelection(
    element,
    trim(selector),
    scope,
    table,
    element$
  );
  const multi = MultiDOMSelection(
    element,
    trim(selector),
    scope,
    table,
    element$
  );

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

  function isolateSource(source: RootDOMSelection, scope: string): RootDOMSelection {
    return RootDOMSelection(element, '', scope, table, element$);
  }

  function isolateSink(sink: FantasyObservable, scope: string): FantasyObservable {
    return from(sink).map((node: VNode) => ({
      ...node,
      data: {
        ...node.data,
        scope
      }
    }));
  }

  return {
    ...multi,
    ...single,
    type,
    selector,
    scope,
    effect,
    isolateSource,
    isolateSink
  };
}
