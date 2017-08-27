# bdom-keep-order - a tool to add/remove sibling elements whilst keeping them in order

## Motivation:
React handles fast dom updates by virtual dom comparison. This tool is part of an aim to eliminate the need for that and write fast and small single page apps utilising only the standard dom, by solving the very specific problem of keeping sibling elements in order by holding on to them even while they're not attached to the dom and adding them back in when needed. 

A good example is routing. When a route matches a component should show. and when it doesn't it should be detached from the dom. If you have many elements in a list that show on same routes you run into the problem of losing the order of the components and you will need to keep the order in memory and then add/remove the elements accordingly. That's exactly what this tool does.

## Installation
```bash
npm install --save bdom-keep-order
```

## Usage
```js
    import { keepOnParentStart } from 'bdom-keep-order'

    const parent = document.createElement('ul')
    document.getElementsByTagName('body')[0].appendChild(parent)

    this.keeper = keepOnParentStart(parent, [
      { condition: show => show === 'show a', 
        elements: document.createTextNode('SHOWING A') },
      { condition: show => show === 'show b', 
        elements: document.createTextNode('SHOWING B') },
      { condition: show => show === 'show a' || show === 'show b', 
        elements: document.createTextNode('SHOW ON A AND B') },
    ])

    this.keeper('show a')
    // SHOWING A
    // SHOW ON A AND B

    this.keeper('show b')
    // SHOWING B
    // SHOW ON A AND B

    this.keeper('show z')
    // * nothing rendered *

```

## build
```bash
npm run build
```

## test
```js
npm test
```