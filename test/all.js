const expect = require('expect.js')

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

		keeper('a')
		expect(parent.children.length).to.equal(4)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('SPAN')
		expect(parent.children[2].nodeName).to.equal('H1')
		expect(parent.children[3].nodeName).to.equal('A')

		keeper('b')
		expect(parent.children.length).to.equal(4)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('P')
		expect(parent.children[2].nodeName).to.equal('PRE')
		expect(parent.children[3].nodeName).to.equal('A')

		keeper('c')
		expect(parent.children.length).to.equal(3)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('H1')
		expect(parent.children[2].nodeName).to.equal('A')

		keeper('z')
		expect(parent.children.length).to.equal(2)
		expect(parent.children[0].nodeName).to.equal('B')
		expect(parent.children[1].nodeName).to.equal('A')

		keeper('a')
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

		keeper('a')
		expect(parent.children.length).to.equal(3)
		expect(parent.children[0].nodeName).to.equal('SPAN')
		expect(parent.children[1].nodeName).to.equal('P')
		expect(parent.children[2].nodeName).to.equal('A')

		keeper('b')
		expect(parent.children.length).to.equal(2)
		expect(parent.children[0].nodeName).to.equal('P')
		expect(parent.children[1].nodeName).to.equal('A')

		keeper('a')
		expect(parent.children.length).to.equal(3)
		expect(parent.children[0].nodeName).to.equal('SPAN')
		expect(parent.children[1].nodeName).to.equal('P')
		expect(parent.children[2].nodeName).to.equal('A')
	})

})
