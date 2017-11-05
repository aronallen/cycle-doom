import { fromEvent, empty, from } from 'most';
import { FantasyObservable } from '@cycle/run';
import { VNode } from 'snabbdom/vnode';
import { toVNode } from 'snabbdom/tovnode';
import { init } from 'snabbdom';
import { VNodeWrapper } from '@cycle/dom/src/VNodeWrapper';
import { getValidNode } from '@cycle/dom/src/utils';
import { ScopeTable } from './ScopeTable';
import { RootDOMSelection } from './RootDOMSelection';
import { Effect, SelectionType } from './types';
import modules from './modules';
import scopeModule from './scope-module';
import { selectDOM, setter } from './utils';


function unwrapElementFromVNode(vnode: VNode): Element {
  return vnode.elm as Element;
}

export function makeDOOMDriver(container: Element) {
  const table = new ScopeTable();
  return {
    DOM: (sink$: FantasyObservable) => {
      const rootElement = getValidNode(container) || document.body;
      const vnodeWrapper = new VNodeWrapper(rootElement);
      const patch = init([
        ...modules,
        scopeModule(table)
      ]);
      const elements$ = from(sink$)
        .map(vnode => vnodeWrapper.call(vnode))
        .scan(patch, toVNode(rootElement))
        .skip(1)
        .map(unwrapElementFromVNode)
        .startWith(rootElement as Element)
        .multicast();
      
      elements$.subscribe({
        next: () => {},
        error: console.error,
        complete: console.warn
      })
      return RootDOMSelection(container, '', '', table, elements$);
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