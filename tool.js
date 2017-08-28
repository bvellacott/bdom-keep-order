const doc = window.document
const { ELEMENT_NODE } = doc
const { Element, Node } = window
 
// This tool uses a single document fragment which makes it strictly 
// synchronous. If you need to use this tool asynchronously, you are
// either doing something wrong or you have the wrong tool 
const fragment = doc.createDocumentFragment()

export function keepOnParentStart(parent, maps) {

	validateParams(parent, maps)
	// reverse the map so we can run an optimized loop
	maps = maps.reverse()
	return function parentStartKeeper(input) {
		let lastInDom
		let addAfterSibling
		let i = maps.length
		while(i--) {
			lastInDom = removeAndPopulateFragment(parent, input, maps[i])
			if(addAfterSibling) {
				parent.insertBefore(fragment, addAfterSibling.nextSibling)
			}
			else {
				parent.insertBefore(fragment, parent.firstChild)
			}
			addAfterSibling = lastInDom || addAfterSibling
		} 
	}
}

export function keepOnParentEnd(parent, maps) {

	validateParams(parent, maps)
	// reverse the map so we can run an optimized loop
	maps = maps.reverse()
	return function parentEndKeeper(input) {
		let lastInDom
		let addAfterSibling
		let i = maps.length
		while(i--) {
			lastInDom = removeAndPopulateFragment(parent, input, maps[i])
			if(addAfterSibling) {
				parent.insertBefore(fragment, addAfterSibling.nextSibling)
			}
			else {
				parent.appendChild(fragment)
			}
			addAfterSibling = lastInDom || addAfterSibling
		} 
	}
}

export function keepBeforeSibling(sibling, maps) {

	if(!sibling || (!(sibling instanceof Element) && sibling.nodeType !== ELEMENT_NODE)) {
		throw new Error('The sibling node needs to be an element')
	}
	const parent = sibling.parentNode
	validateParams(parent, maps)
	// reverse the map so we can run an optimized loop
	maps = maps.reverse()
	return function beforeSiblingKeeper(input) {
		let i = maps.length
		while(i--) {
			removeAndPopulateFragment(parent, input, maps[i])
			parent.insertBefore(fragment, sibling)
		} 
	}
}

export function keepAfterSibling(sibling, maps) {

	if(!sibling || (!(sibling instanceof Element) && sibling.nodeType !== ELEMENT_NODE)) {
		throw new Error('The sibling node needs to be an element')
	}
	let parent = sibling.parentNode
	validateParams(parent, maps)
	// no need to reverse the map here, because we can add in reverse order
	return function afterSiblingKeeper(input) {
		let i = maps.length
		while(i--) {
			removeAndPopulateFragment(parent, input, maps[i])
			parent.insertBefore(fragment, sibling.nextSibling)
		} 
	}
}

function removeAndPopulateFragment(parent, input, { condition, elements }) {
	let removableElement
	let lastElementInDom 
	let i = elements.length

	if(match(condition, input)) {
		while(i--) {
			lastElementInDom = elements[i]
			if(!doc.contains(lastElementInDom)) {
				fragment.appendChild(lastElementInDom)
			}
		}
	}
	else {
		while(i--) {
			removableElement = elements[i]
			if(doc.contains(removableElement)) {
				parent.removeChild(removableElement)
			}
		}
	}

	return lastElementInDom
}

function validateParams(parent, maps) {

	// validate parameters
	if(!parent || (!(parent instanceof Element) && parent.nodeType !== ELEMENT_NODE)) {	
		throw new Error('The parent node needs to be an element')
	}
	if(!maps || typeof maps !== 'object' || typeof maps.length !== 'number') {
		throw new Error('maps needs to be an array of mapping arrays')
	}

	let map
	let elements  
	let condition 
	let i = maps.length
	while(i--) {
		map = maps[i]
		if(map instanceof Node || typeof map.nodeType === 'number') {
			maps[i] = {
				// this element should always be connected
				condition: true, 
				elements: [ map ], 
			}
		}
		else if(!map || typeof map !== 'object' || typeof map.length !== 'number') {
			throw new Error('Each map should be an array with a condition as the first item ' +
			' and appendable dom nodes as subsequent items')
		}
		else {
			maps[i] = {
				// remove the first item and place it as the condition
				condition: map.splice(0, 1)[0], 
				// reverse the elements list for optimal looping
				elements: map.reverse(),
			}
		}
	}
}

function match(condition, input) {
	if(!condition) {
		return false
	}
	if(typeof condition === 'function') {
		return condition(input)
	}
	return true
}