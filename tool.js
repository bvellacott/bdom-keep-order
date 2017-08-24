const doc = window.document
const { ELEMENT_NODE } = doc
const { Element } = window
 
// This tool uses a single document fragment which makes it strictly 
// synchronous. If you need to use this tool asynchronously, you are
// either doing something wrong or you have the wrong tool 
const fragment = doc.createDocumentFragment()

export function keepOnParentStart(parent, maps) {
	validateParams(parent, maps)
	return function parentStartKeeper(input) {
		let i = maps.length
		while(i--) {
			removeAndPopulateFragment(parent, input, maps[i])
			parent.insertBefore(fragment, parent.firstChild)
		} 
	}
}

export function keepOnParentEnd(parent, maps) {

	validateParams(parent, maps)
	// reverse the map so we can run an optimized loop
	maps = maps.reverse()
	return function parentEndKeeper(input) {
		let i = maps.length
		while(i--) {
			removeAndPopulateFragment(parent, input, maps[i])
			parent.appendChild(fragment)
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
	return function afterSiblingKeeper(input) {
		let i = maps.length
		while(i--) {
			removeAndPopulateFragment(parent, input, maps[i])
			parent.insertBefore(fragment, sibling.nextSibling)
		} 
	}
}

function removeAndPopulateFragment(parent, input, { condition, elements }) {
	if(match(condition, input)) {
		elements.forEach( element => (!doc.contains(element) && fragment.appendChild(element)) )
	}
	else {
		elements.forEach( element => (doc.contains(element) && parent.removeChild(element)) )
	}
}

function validateParams(parent, maps) {
	// validate parameters
	if(!parent || (!(parent instanceof Element) && parent.nodeType !== ELEMENT_NODE)) {	
		throw new Error('The parent node needs to be an element')
	}
	if(!maps || typeof maps !== 'object' || typeof maps.length !== 'number') {
		throw new Error('The ma')
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