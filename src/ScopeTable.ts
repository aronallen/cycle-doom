export class ScopeTable {
  elements: {[scope: string]: Element } = {}
  assign = (scope: string, element: Element) => {
    this.elements[scope] = element;
  }
  remove = (scope: string) => {
    delete this.elements[scope];
  }
  retreive = (scope: string): Element => {
    return this.elements[scope];
  }
}