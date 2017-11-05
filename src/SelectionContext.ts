import { DOMSelection, SelectionType } from './types';
import { ScopeTable } from './ScopeTable';
export type SelectionContext = {
  element: Element;
  selection: DOMSelection<SelectionType>;
  table: ScopeTable
};