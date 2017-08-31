const doc = window.document
const { ELEMENT_NODE } = doc
const { Element, Node } = window
 
const domNodeError = 'Each map should be a appendable dom node or an array with a condition as the first item ' +
	' and appendable dom nodes as subsequent items'
// This tool uses a single document fragment which makes it strictly 
// synchronous. If you need to use this tool asynchronously, you are
// either doing something wrong or you have the wrong tool 
const fragment = doc.createDocumentFragment()

export function keepOnParentStart(parent, maps) {

	validateParent(parent)
	validateMaps(maps)

	const keeper = {
		parent,
		maps,	
		keep(input) {
			let lastInDom
			let addAfterSibling
			let i = keeper.maps.length
			for(let i = 0; i < keeper.maps.length; i++) {
				lastInDom = removeAndPopulateFragment(parent, input, keeper.maps[i], lastInDom)
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
		},
		reset(newMaps) {
			validateMaps(newMaps)

			const oldEls = mapElementsIterator(keeper.maps)
			const newEls = mapElementsIterator(newMaps)

			let oldRes
			let newRes
			for(newRes = newEls.next(); !newRes.done; newRes = newEls.next()) {
				if(!doc.contains(newRes.value)) {
					continue
				}
				for(oldRes = oldEls.next(); !oldRes.done && !oldRes.value.isEqualNode(newRes.value); oldRes = oldEls.next()) {
					if(doc.contains(oldRes.value)) {
						parent.removeChild(oldRes.value)
					}
				}
				if(oldRes.done) {
					break
				}
			}
			keeper.maps = newMaps
		}
	}

	return keeper
}

function removeAndPopulateFragment(parent, input, map, lastElementInDom) {
	if(map instanceof Node || typeof map.nodeType === 'number') {
		// this element should always be connected
		if(shouldReAppend(map, lastElementInDom)) {
			fragment.appendChild(map)
		}
		lastElementInDom = map
	}
	else if(!map || typeof map !== 'object' || typeof map.length !== 'number') {
		throw new Error(domNodeError)
	}
	else {
		let removableElement
		let element
		let i = 1
		if(match(map[0], input)) {
			for(; i < map.length; i++) {
				element = map[i]
				if(shouldReAppend(element, lastElementInDom)) {
					fragment.appendChild(element)
				}
				lastElementInDom = element
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

function shouldReAppend(node, previousNode) {
	return (!doc.contains(node) || 
		!(!doc.previousSibling && !previousNode) ||
		doc.previousSibling !== previousNode)
}

function validateParent(parent) {
	if(!parent || (!(parent instanceof Element) && parent.nodeType !== ELEMENT_NODE)) {	
		throw new Error('The parent node needs to be an element')
	}
}

function validateMaps(maps) {
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

export function* mapElementsIterator(maps) {
	let map
	for(let mi = 0; mi < maps.length; mi++) {
		map = maps[mi]
		if(map instanceof Node || typeof map.nodeType === 'number') {
			yield map
		}
		else if(!map || typeof map !== 'object' || typeof map.length !== 'number') {
			throw new Error(domNodeError)
		}
		else {
			for(let ei = 1; ei < map.length; ei++) {
				yield map[ei]
			}
		}
	}
}