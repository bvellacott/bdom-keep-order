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
	return function parentStartKeeper(input) {
		let lastInDom
		let addAfterSibling
		let i = maps.length
		for(let i = 0; i < maps.length; i++) {
			lastInDom = removeAndPopulateFragment(parent, input, maps[i])
			if(lastInDom) {
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
}

function removeAndPopulateFragment(parent, input, map) {
	let lastElementInDom 

	if(map instanceof Node || typeof map.nodeType === 'number') {
		lastElementInDom = map
		// this element should always be connected
		if(!doc.contains(map)) {
			fragment.appendChild(map)
		}
	}
	else if(!map || typeof map !== 'object' || typeof map.length !== 'number') {
		throw new Error('Each map should be a appendable dom node or an array with a condition as the first item ' +
		' and appendable dom nodes as subsequent items')
	}
	else {
		let removableElement
		let i = 1
		if(match(map[0], input)) {
			for(; i < map.length; i++) {
				lastElementInDom = map[i]
				if(!doc.contains(lastElementInDom)) {
					fragment.appendChild(lastElementInDom)
				}
			}
		}
		else {
			for(; i < map.length; i++) {
				removableElement = map[i]
				if(doc.contains(removableElement)) {
					parent.removeChild(removableElement)
				}
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