'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.keepOnParentStart = keepOnParentStart;
exports.keepOnParentEnd = keepOnParentEnd;
exports.keepBeforeSibling = keepBeforeSibling;
exports.keepAfterSibling = keepAfterSibling;
var doc = window.document;
var ELEMENT_NODE = doc.ELEMENT_NODE;
var _window = window,
    Element = _window.Element,
    Node = _window.Node;

// This tool uses a single document fragment which makes it strictly 
// synchronous. If you need to use this tool asynchronously, you are
// either doing something wrong or you have the wrong tool 

var fragment = doc.createDocumentFragment();

function keepOnParentStart(parent, maps) {

	validateParams(parent, maps);
	// reverse the map so we can run an optimized loop
	maps = maps.reverse();
	return function parentStartKeeper(input) {
		var lastInDom = void 0;
		var addAfterSibling = void 0;
		var i = maps.length;
		while (i--) {
			lastInDom = removeAndPopulateFragment(parent, input, maps[i]);
			if (addAfterSibling) {
				parent.insertBefore(fragment, addAfterSibling.nextSibling);
			} else {
				parent.insertBefore(fragment, parent.firstChild);
			}
			addAfterSibling = lastInDom || addAfterSibling;
		}
	};
}

function keepOnParentEnd(parent, maps) {

	validateParams(parent, maps);
	// reverse the map so we can run an optimized loop
	maps = maps.reverse();
	return function parentEndKeeper(input) {
		var lastInDom = void 0;
		var addAfterSibling = void 0;
		var i = maps.length;
		while (i--) {
			lastInDom = removeAndPopulateFragment(parent, input, maps[i]);
			if (addAfterSibling) {
				parent.insertBefore(fragment, addAfterSibling.nextSibling);
			} else {
				parent.appendChild(fragment);
			}
			addAfterSibling = lastInDom || addAfterSibling;
		}
	};
}

function keepBeforeSibling(sibling, maps) {

	if (!sibling || !(sibling instanceof Element) && sibling.nodeType !== ELEMENT_NODE) {
		throw new Error('The sibling node needs to be an element');
	}
	var parent = sibling.parentNode;
	validateParams(parent, maps);
	// reverse the map so we can run an optimized loop
	maps = maps.reverse();
	return function beforeSiblingKeeper(input) {
		var i = maps.length;
		while (i--) {
			removeAndPopulateFragment(parent, input, maps[i]);
			parent.insertBefore(fragment, sibling);
		}
	};
}

function keepAfterSibling(sibling, maps) {

	if (!sibling || !(sibling instanceof Element) && sibling.nodeType !== ELEMENT_NODE) {
		throw new Error('The sibling node needs to be an element');
	}
	var parent = sibling.parentNode;
	validateParams(parent, maps);
	// no need to reverse the map here, because we can add in reverse order
	return function afterSiblingKeeper(input) {
		var i = maps.length;
		while (i--) {
			removeAndPopulateFragment(parent, input, maps[i]);
			parent.insertBefore(fragment, sibling.nextSibling);
		}
	};
}

function removeAndPopulateFragment(parent, input, _ref) {
	var condition = _ref.condition,
	    elements = _ref.elements;

	var removableElement = void 0;
	var lastElementInDom = void 0;
	var i = elements.length;

	if (match(condition, input)) {
		while (i--) {
			lastElementInDom = elements[i];
			if (!doc.contains(lastElementInDom)) {
				fragment.appendChild(lastElementInDom);
			}
		}
	} else {
		while (i--) {
			removableElement = elements[i];
			if (doc.contains(removableElement)) {
				parent.removeChild(removableElement);
			}
		}
	}

	return lastElementInDom;
}

function validateParams(parent, maps) {

	// validate parameters
	if (!parent || !(parent instanceof Element) && parent.nodeType !== ELEMENT_NODE) {
		throw new Error('The parent node needs to be an element');
	}
	if (!maps || (typeof maps === 'undefined' ? 'undefined' : _typeof(maps)) !== 'object' || typeof maps.length !== 'number') {
		throw new Error('maps needs to be an array of mapping arrays');
	}

	var map = void 0;
	var elements = void 0;
	var condition = void 0;
	var i = maps.length;
	while (i--) {
		map = maps[i];
		if (!map || (typeof map === 'undefined' ? 'undefined' : _typeof(map)) !== 'object' || typeof map.length !== 'number') {
			throw new Error('Each map should be an array with a condition as the first item ' + ' and appendable dom nodes as subsequent items');
			maps[i].elements = elements.reverse();
		} else {
			maps[i] = {
				// remove the first item and place it as the condition
				condition: map.splice(0, 1)[0],
				// reverse the elements list for optimal looping
				elements: map.reverse()
			};
		}
	}
}

function match(condition, input) {
	if (!condition) {
		return false;
	}
	if (typeof condition === 'function') {
		return condition(input);
	}
	return true;
}
