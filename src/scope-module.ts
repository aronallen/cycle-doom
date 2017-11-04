import { ScopeTable } from './ScopeTable';
import { Module } from 'snabbdom/modules/module';
export default function scope(table: ScopeTable): Partial<Module> {
  return {
    create: (_, node) => {
      if (node.data && node.data.scope) {
        table.assign(
          node.data.scope,
          node.elm! as Element
        );
      }
    },
    destroy: (node) => {
      if (node.data && node.data.scope) {
        table.remove(node.data!.scope)
      }
    }
  }
}