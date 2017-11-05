import { FantasyObservable } from '@cycle/run';
export interface Effect <T extends any, U extends SelectionType> {
  selection: DOMSelection<U>,
  property: Property; 
  value?: T
}

export enum SelectionType {
  Root,
  Single,
  Multi
}

export type Property =  keyof Element | keyof HTMLElement | keyof HTMLInputElement;
export type AnyElement = Element | HTMLElement | HTMLInputElement;

type MouseEventNames = 'mouseup' | 'mousedown' | 'mousemove' | 'click' | 'dblclick';
type InputEventNames = 'input';
type FocusEventNames = 'focus' | 'blur' | 'focusin' | 'focusout'
type AnimationEventNames = 'animationstart' | 'animationend' | 'animationiteration';
type CSSTransitionEventNames = 'transitionstart' | 'transitioncancel' | 'transitionend' | 'transitionrun';

export interface DOMSelection<T extends SelectionType> {
  type: T;
  scope: string;
  selector: string;
}

export interface DOMEventSelection<T extends SelectionType> extends DOMSelection<T> {
  on(name: string): FantasyObservable,
  /*
  on(name: MouseEventNames): Stream<MouseEvent> 
  on(name: InputEventNames): Stream<UIEvent>
  on(name: FocusEventNames): Stream<FocusEvent>
  on(name: AnimationEventNames): Stream<AnimationEvent>
  on(name: CSSTransitionEventNames): Stream<TransitionEvent>
  */
}

export interface RootDOMSelection extends DOMEventSelection<SelectionType.Root> {
  read(property: Property): (with$: FantasyObservable) => FantasyObservable,
  effect<T extends any[]>(property: Property, value?: T): FantasyObservable  
  select: (selector: string) => SingleDOMSelection
  selectAll: (selector: string) => MultiDOMSelection
  isolateSource: (source: RootDOMSelection, scope: string) => RootDOMSelection;
  isolateSink: (sink: FantasyObservable, scope: string) => FantasyObservable
}

export interface SingleDOMSelection extends DOMEventSelection<SelectionType.Single> {
  read(property: Property): (with$: FantasyObservable) => FantasyObservable,
  effect<T extends any[]>(property: Property, value?: T): FantasyObservable
  select(selector: string): SingleDOMSelection
}

export interface MultiDOMSelection extends DOMEventSelection<SelectionType.Multi> {
  read(property: Property): (with$: FantasyObservable) => FantasyObservable,
  effect<T extends any[]>(property: Property, value?: T): FantasyObservable
  selectAll(selector: string): MultiDOMSelection
}