import { periodic, from, empty, combine, merge, Stream } from 'most';
import { run } from '@cycle/most-run';
import { h } from 'snabbdom/h';
import { makeDOOMDriver } from '../src/index';
import { RootDOMSelection } from '../src/types';
import isolate from '@cycle/isolate';

function counter({ DOM, focus$ = empty() }: { DOM: RootDOMSelection, focus$: Stream<any> }) {

  const increment$ = from(DOM
    .select('div.increment')
    .on('click'))
    .tap(console.log)
    .constant(+1);
  const decrement$ = from(DOM
    .select('div.decrement')
    .on('click'))
    .constant(-1);


  from(
    DOM
      .selectAll('button')
      .read('getBoundingClientRect')(periodic(1000).delay(1))
  ).observe(console.log)
  
  const counter$ = merge(
    increment$,
    decrement$
  )
  .scan((acc, n) => acc + n, 0);

  const effects$ = counter$.filter(count => count === 10)
    .constant(
      DOM
        .select('input')
        .effect('focus')
      )
    .merge(
      counter$.filter(count => count === 20).constant(
        DOM
          .select('input')
          .effect('value', ['Hello World!'])
      ),
      counter$.filter(count => count === 21).constant(
        DOM
          .select('input')
          .effect('setSelectionRange', [3, 6])
    ))
    

  
  return {
    DOM: counter$.map(count => h('div', {}, [
      h('div.increment', [h('button', 'Nested Div'), h('input'), `Increment`]),
      h('div.decrement', [h('button', 'Funny Button'), 'Decrement']),
      h('span', `${count}`)
    ])),
    DOMEffect: effects$
  }
}

function main(sources: { DOM: RootDOMSelection }) {
  const aSinks = isolate(counter)(sources);
  const bSinks = isolate(counter)(sources);
  const vdom$ = combine(
    Array,
    aSinks.DOM,
    bSinks.DOM
  ).map(children => h('div', children));
  return {
    DOM: vdom$,
    DOMEffect: merge(aSinks.DOMEffect, bSinks.DOMEffect)
  }
}

run(
  main,
  {
    ...makeDOOMDriver(document.querySelector('#app1')!)
  }
);