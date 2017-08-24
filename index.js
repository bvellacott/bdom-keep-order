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
    Element = _window.Element;

// This tool uses a single document fragment which makes it strictly 
// synchronous. If you need to use this tool asynchronously, you are
// either doing something wrong or you have the wrong tool 

var fragment = doc.createDocumentFragment();

function keepOnParentStart(parent, maps) {
	validateParams(parent, maps);
	return function parentStartKeeper(input) {
		var i = maps.length;
		while (i--) {
			removeAndPopulateFragment(parent, input, maps[i]);
			parent.insertBefore(fragment, parent.firstChild);
		}
	};
}

function keepOnParentEnd(parent, children) {

	validateParams(parent, maps);
	// reverse the map so we can run an optimized loop
	maps = maps.reverse();
	return function parentStartKeeper(input) {
		var i = maps.length;
		while (i--) {
			removeAndPopulateFragment(parent, input, maps[i]);
			parent.appendChild(fragment);
		}
	};
}

function keepBeforeSibling(sibling, children) {
	if (!sibling || !(sibling instanceof Element) && sibling.nodeType !== ELEMENT_NODE) {
		throw new Error('The sibling node needs to be an element');
	}
	var parent = sibling.parentNode;
	validateParams(parent, maps);
	// reverse the map so we can run an optimized loop
	maps = maps.reverse();
	return function parentStartKeeper(input) {
		var i = maps.length;
		while (i--) {
			removeAndPopulateFragment(parent, input, maps[i]);
			parent.insertBefore(fragment, sibling);
		}
	};
}

function keepAfterSibling(sibling, children) {
	if (!sibling || !(sibling instanceof Element) && sibling.nodeType !== ELEMENT_NODE) {
		throw new Error('The sibling node needs to be an element');
	}
	var parent = sibling.parentNode;
	validateParams(parent, maps);
	// reverse the map so we can run an optimized loop
	maps = maps.reverse();
	return function parentStartKeeper(input) {
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

	if (match(condition, input)) {
		elements.forEach(function (element) {
			return !doc.contains(element) && fragment.appendChild(element);
		});
	} else {
		elements.forEach(function (element) {
			return doc.contains(element) && parent.removeChild(element);
		});
	}
}

function validateParams(parent, maps) {
	// validate parameters
	if (!parent || !(parent instanceof Element) && parent.nodeType !== ELEMENT_NODE) {
		throw new Error('The parent node needs to be an element');
	}
	if (!maps || (typeof maps === 'undefined' ? 'undefined' : _typeof(maps)) !== 'object' || typeof maps.length !== 'number') {
		throw new Error('The ma');
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
