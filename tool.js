const doc = window.document
const { ELEMENT_NODE } = doc
const { Element } = window
 
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
		throw new Error('The ma')
	}

	let elements  
	let i = maps.length
	while(i--) {
		elements = maps[i].elements
		if(elements && typeof elements.length === 'number') {
			// reverse the elements list for optimal looping
			maps[i].elements = elements.reverse()
		}
		else if(!elements || typeof elements !== 'object' ||
			!(elements instanceof Element && elements.nodeType === ELEMENT_NODE)) {
			throw new Error('elements needs to be a dom element or an array of dom elements')
		}
		else {
			maps[i].elements = [ elements ]
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