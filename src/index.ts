import { fromEvent, empty, from } from 'most';
import { FantasyObservable } from '@cycle/run';
import { VNode } from 'snabbdom/vnode';
import { toVNode } from 'snabbdom/tovnode';
import { init } from 'snabbdom';
import { VNodeWrapper } from '@cycle/dom/src/VNodeWrapper';
import { getValidNode } from '@cycle/dom/src/utils';
import {
  RootDOMSelection,
  SingleDOMSelection,
  MultiDOMSelection,
  DOMSelection,
  SelectionType,
  Effect,
  Property
} from './types';
import { ScopeTable } from './ScopeTable';
import { nodeListToArray, selectDOM, getter, setter } from './utils';
import modules from './modules';
import scopeModule from './scope-module';

function trim(a: string) {
  return a.trim();
}

function combineSelectors(a: string, b: string) {
  return trim(`${trim(a)} ${trim(b)}`);
}

function withinScope(target: Element, scope: string, table: ScopeTable) {
  const element = table.retreive(scope);
  return element.contains(target);
}

function within(target: Element, parent: Element) {
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

function ownerTarget(
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

function SingleDOMSelection(element: Element, selector: string, scope: string, table: ScopeTable): SingleDOMSelection {
  const type = SelectionType.Single;
  function on(event: string) {
    return fromEvent(event, element)
      .filter(event => {
        const container = table.retreive(scope) || element;
        const _ownerTarget = ownerTarget(event.target as Element, container, { selector, scope, type });
        (event as any).ownerTarget = _ownerTarget;
        return _ownerTarget !== null;
    });
  }

  function read(property: Property) {
    return function <T extends any[]>(stream$: FantasyObservable) {
      return from(stream$)
        .map((args: T) => {
          const node = selectDOM({ type, selector, scope }, element, table)[0]
          try {
            return getter(property, args)(node);
          } catch (e) {
            return e;
          }
        });
    }
  }

  function select(_sel: string) {
    return SingleDOMSelection(element,
      combineSelectors(selector, _sel),
      scope,
      table
    );
  }

  function effect<T extends any>(property: Property, value?: T): Effect<T, typeof type> {
    return {
      selection: {
        selector,
        scope,
        type
      },
      property,
      value
    }
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

function MultiDOMSelection(element: Element, selector: string, scope: string, table: ScopeTable): MultiDOMSelection {
  const type = SelectionType.Multi;

  function on(event: string) {
    return fromEvent(event, element)
      .filter(event => {
        if (scope && event.target instanceof Element) {
          return withinScope(event.target, scope, table);
        } else {
          return true;
        }
      })
    ;
  }

  function read(property: Property) {
    return function <T extends any[]>(stream$: FantasyObservable) {
      return from(stream$)
      // select the DOM
      // invoke the getter on the selection
      .map((args: T) => {
        const elements = selectDOM({ type, selector, scope }, element, table);
        return elements.map(getter(property, args));
      })
    }
  }

  function selectAll(_sel: string) {
    return MultiDOMSelection(
      element,
      combineSelectors(selector, _sel),
      scope,
      table
    );
  }

  function effect<T extends any>(property: Property, value?: T): Effect<T, typeof type> {
    return {
      selection: {
        selector,
        scope,
        type
      },
      property,
      value
    }
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

function RootDOMSelection(element: Element, selector: string, scope: string, table: ScopeTable): RootDOMSelection {
  const type = SelectionType.Root;
  const single = SingleDOMSelection(
    element,
    trim(selector),
    scope,
    table
  );
  const multi = MultiDOMSelection(
    element,
    trim(selector),
    scope,
    table
  );

  function effect<T extends any>(property: Property, value?: T): Effect<T, typeof type> {
    return {
      selection: {
        selector,
        scope,
        type
      },
      property,
      value
    }
  }

  function isolateSource(source: RootDOMSelection, scope: string): RootDOMSelection {
    return RootDOMSelection(element, '', scope, table);
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

function unwrapElementFromVNode(vnode: VNode): Element {
  return vnode.elm as Element;
}

export function makeDOOMDriver(container: Element) {
  const table = new ScopeTable();
  return {
    DOM: (sink$: FantasyObservable): RootDOMSelection => {
      const rootElement = getValidNode(container) || document.body;
      const vnodeWrapper = new VNodeWrapper(rootElement);
      const patch = init([
        ...modules,
        scopeModule(table)
      ]);
      from(sink$)
        .map(vnode => vnodeWrapper.call(vnode))
        .scan(patch, toVNode(rootElement))
        .skip(1)
        .map(unwrapElementFromVNode)
        .startWith(rootElement as Element)
      .subscribe({
        next: () => {},
        error: console.error,
        complete: console.warn
      })
      return RootDOMSelection(container, '', '', table);
    },
    DOMEffect: (sink$: FantasyObservable) => {
      sink$.subscribe({
        next(effect: Effect<any, SelectionType>) {
          try {
            selectDOM(effect.selection, container, table)
              .forEach(setter(effect.property, effect.value));
          } catch (error) {
            console.error(error);
          }
        },
        error(){},
        complete(){}
      });
    }
  }
}