# The DOOM Driver

This is my take on the DOM Driver.

The purpose of this project is to contain ALL side-effects in the Driver. To make @cycle/dom WebWorker safe.

This includes getting and setting properties on Elements or Events, invoking methods on Elements or Events.

I am not saying this should be the ONLY way to retreive and assign values to DOM-land instances, it becomes relevant when developing multi-threaded applications, where it is impossible to reference DOM-land instances from a foreign thread.

### One Driver, Two Sinks.

The idea here is to have a DOMEffect Sink and a DOM Sink.
The DOMEffect Sink receives Effects on certain selections, and performs them.
Effects can be invoking methods (such as blur), or assigning values without patching (such as value).

### Isolation

I simplified isolation a good deal, this should be able to run inside and outside of a worker, since the isolation scope is purely data. I am not handling the more advanced isolation concepts that `@cycle/dom` has.

### select and selectAll

I wanted to get closer to how the underlying DOM selections work, so now it is possible just to make a listener for a specific selection, or to preform an Effect on a singular or range of elements.

### DOMSource.on

I wanted to get closer to what names people are familiar with in other JS frameworks. Should work as DOMSource.events in `@cycle/dom`


### DOMSource.read

DOMSource.read is not a source per-say, it is an operator, that reads a DOM property (or invokes a DOM method) and gives you the result. You need to provide a stream to time when to invoke the method.
Currently invocation will be attempted regardless if the selection is in the DOM or not. If it fails to read the property (or invoke the method) an error will be thrown.

### DOMSource.effect

Generates an stream of effect on the current selection the 1st argument is the property or method identifier like `setSelectionRange` the 2nd argument is the values that will be applied or assing to that property (depending on if it is a function or not). This is in the source, but it notably does not return anything but a description of the Effect you wish to emit. The effect will be bound to your current isolation scope, and whatever preceding selection, and must be a returned as a DOMEffect sink.

### TODO

1. This Driver has not been tested, and is most likely to be buggy.
2. Currently it is not possible to configure eventListeners with event options (useCapture, preventDefault, stopPropagation) This needs to be implemented
3. There is no way to know when a patch has happened (DOM.elements() in `@cycle/dom`), I need to implement this.
4. For all sources that return Streams there will be a third argument called the QueryTemplate. The QueryTemplate will explicitly define which properties you desire to use in that Stream. This will make it easier to serialize the synthetic Event and Element objects as they traverse thread-boundries, and it has some benefits when testing, as you are explicitly declare which values and expected types you need for your Stream
5. Add window and document on RootDOMSource as a special case of DOMSource