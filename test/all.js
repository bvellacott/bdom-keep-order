const expect = require('expect.js')
require('babel-polyfill')

// set global document if case the tests arent run in the browser
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = (new JSDOM(`
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<title>Document</title>
	</head>
	<body id="root">
	</body>
</html>`));
const doc = window.document
global.window = window

const { 
	keepOnParentStart,
	keepOnParentEnd,
	keepBeforeSibling,
	keepAfterSibling,
} = require('..')

describe('keepers', () => {

	beforeEach(() => {
		doc.getElementById('root').innerHTML = ''
	})

	it('keeps children in order at the start', () => {
		const parent = doc.getElementById('root')

		const randomLink = doc.createElement('a')
		parent.appendChild(randomLink)

		const span = doc.createElement('span')
		const p = doc.createElement('p')
		const pre = doc.createElement('PRE')
		const h1 = doc.createElement('h1')

		const keeper = keepOnParentStart(parent, [
			doc.createElement('b'),
			[ (input) => input === 'a', span ],
			[ (input) => input === 'b', p, pre ],
			[ (input) => input in { c:1, a:1 }, h1 ],
		])

		keeper.keep('a')
		expect(parent.children.length).to.equal(4)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('SPAN')
		expect(parent.children[2].nodeName).to.equal('H1')
		expect(parent.children[3].nodeName).to.equal('A')

		keeper.keep('b')
		expect(parent.children.length).to.equal(4)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('P')
		expect(parent.children[2].nodeName).to.equal('PRE')
		expect(parent.children[3].nodeName).to.equal('A')

		keeper.keep('c')
		expect(parent.children.length).to.equal(3)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('H1')
		expect(parent.children[2].nodeName).to.equal('A')

		keeper.keep('z')
		expect(parent.children.length).to.equal(2)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('A')

		keeper.keep('a')
		expect(parent.children.length).to.equal(4)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('SPAN')
		expect(parent.children[2].nodeName).to.equal('H1')
		expect(parent.children[3].nodeName).to.equal('A')
	})

	it('keeps children in order at the start - with same conditons', () => {
		const parent = doc.getElementById('root')

		const randomLink = doc.createElement('a')
		parent.appendChild(randomLink)

		const span = doc.createElement('span')
		const p = doc.createElement('p')

		const keeper = keepOnParentStart(parent, [
			[ (input) => input === 'a', span ],
			[ (input) => input in { b:1, a:1 }, p ],
		])

		keeper.keep('a')
		expect(parent.children.length).to.equal(3)
		expect(parent.children[0].nodeName).to.equal('SPAN')
		expect(parent.children[1].nodeName).to.equal('P')
		expect(parent.children[2].nodeName).to.equal('A')

		keeper.keep('b')
		expect(parent.children.length).to.equal(2)
		expect(parent.children[0].nodeName).to.equal('P')
		expect(parent.children[1].nodeName).to.equal('A')

		keeper.keep('a')
		expect(parent.children.length).to.equal(3)
		expect(parent.children[0].nodeName).to.equal('SPAN')
		expect(parent.children[1].nodeName).to.equal('P')
		expect(parent.children[2].nodeName).to.equal('A')
	})

	it('reset removes items from dom that aren\'t in the new order and replaces maps', () => {
		const parent = doc.getElementById('root')

		const randomLink = doc.createElement('a')
		parent.appendChild(randomLink)

		const b = doc.createElement('b')
		const span = doc.createElement('span')
		const p = doc.createElement('p')
		const pre = doc.createElement('pre')
		const h1 = doc.createElement('h1')

		let maps = [
			b,
			[ (input) => input === 'a', span ],
			[ (input) => input === 'a', p, pre ],
			[ (input) => input === 'a', h1 ],
		]

		const keeper = keepOnParentStart(parent, maps)

		// validate the initial state
		keeper.keep('a')
		expect(parent.children.length).to.equal(6)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('SPAN')
		expect(parent.children[2].nodeName).to.equal('P')
		expect(parent.children[3].nodeName).to.equal('PRE')
		expect(parent.children[4].nodeName).to.equal('H1')
		expect(parent.children[5].nodeName).to.equal('A')

		// switch a couple of elements round and see if thats handled correctly
		maps[0] = [ (input) => input === 'a', p, pre ]
		maps[2] = b

		keeper.keep('a')
		expect(parent.children.length).to.equal(6)
		expect(parent.children[0].nodeName).to.equal('P')
		expect(parent.children[1].nodeName).to.equal('PRE')
		expect(parent.children[2].nodeName).to.equal('SPAN')
		expect(parent.children[3].nodeName).to.equal('B')
		expect(parent.children[4].nodeName).to.equal('H1')
		expect(parent.children[5].nodeName).to.equal('A')

		// switch them back, but this time don't run keep, but instead reset the map
		maps[2] = [ (input) => input === 'a', p, pre ]
		maps[0] = b

		let newMaps = [
			doc.createElement('div'),
			[ (input) => input === 'a', span, pre ],
			doc.createElement('div'),
			[ (input) => input === 'a', p, h1],
			doc.createElement('div'),
			[ (input) => input === 'a', b],
			doc.createElement('div'),
		]

		keeper.reset(newMaps)

		expect(parent.children.length).to.equal(4)
		expect(doc.contains(b)).to.equal(false)
		expect(doc.contains(span)).to.equal(true)
		expect(doc.contains(p)).to.equal(false)
		expect(doc.contains(pre)).to.equal(true)
		expect(doc.contains(h1)).to.equal(true)

		// finally call keep to render the rest of the nodes into the dom
		keeper.keep('a')

		expect(parent.children.length).to.equal(10)
		expect(parent.children[0].nodeName).to.equal('DIV')
		expect(parent.children[1].nodeName).to.equal('SPAN')
		expect(parent.children[2].nodeName).to.equal('PRE')
		expect(parent.children[3].nodeName).to.equal('DIV')
		expect(parent.children[4].nodeName).to.equal('P')
		expect(parent.children[5].nodeName).to.equal('H1')
		expect(parent.children[6].nodeName).to.equal('DIV')
		expect(parent.children[7].nodeName).to.equal('B')
		expect(parent.children[8].nodeName).to.equal('DIV')
		expect(parent.children[9].nodeName).to.equal('A')
	})
})
