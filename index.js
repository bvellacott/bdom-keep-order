'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.keepOnParentStart = keepOnParentStart;
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
	return function parentStartKeeper(input) {
		var lastInDom = void 0;
		var addAfterSibling = void 0;
		var i = maps.length;
		for (var _i = 0; _i < maps.length; _i++) {
			lastInDom = removeAndPopulateFragment(parent, input, maps[_i]);
			if (lastInDom) {
				if (addAfterSibling) {
					parent.insertBefore(fragment, addAfterSibling.nextSibling);
				} else {
					parent.insertBefore(fragment, parent.firstChild);
				}
				addAfterSibling = lastInDom || addAfterSibling;
			}
		}
	};
}

function removeAndPopulateFragment(parent, input, map) {
	var lastElementInDom = void 0;

	if (map instanceof Node || typeof map.nodeType === 'number') {
		lastElementInDom = map;
		// this element should always be connected
		if (!doc.contains(map)) {
			fragment.appendChild(map);
		}
	} else if (!map || (typeof map === 'undefined' ? 'undefined' : _typeof(map)) !== 'object' || typeof map.length !== 'number') {
		throw new Error('Each map should be a appendable dom node or an array with a condition as the first item ' + ' and appendable dom nodes as subsequent items');
	} else {
		var removableElement = void 0;
		var i = 1;
		if (match(map[0], input)) {
			for (; i < map.length; i++) {
				lastElementInDom = map[i];
				if (!doc.contains(lastElementInDom)) {
					fragment.appendChild(lastElementInDom);
				}
			}
		} else {
			for (; i < map.length; i++) {
				removableElement = map[i];
				if (doc.contains(removableElement)) {
					parent.removeChild(removableElement);
				}
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
