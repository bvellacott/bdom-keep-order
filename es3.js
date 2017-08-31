'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.keepOnParentStart = keepOnParentStart;
exports.mapElementsIterator = mapElementsIterator;

var _marked = /*#__PURE__*/regeneratorRuntime.mark(mapElementsIterator);

var doc = window.document;
var ELEMENT_NODE = doc.ELEMENT_NODE;
var _window = window,
    Element = _window.Element,
    Node = _window.Node;


var domNodeError = 'Each map should be a appendable dom node or an array with a condition as the first item ' + ' and appendable dom nodes as subsequent items';
// This tool uses a single document fragment which makes it strictly 
// synchronous. If you need to use this tool asynchronously, you are
// either doing something wrong or you have the wrong tool 
var fragment = doc.createDocumentFragment();

function keepOnParentStart(parent, maps) {

	validateParent(parent);
	validateMaps(maps);

	var keeper = {
		parent: parent,
		maps: maps,
		keep: function keep(input) {
			var lastInDom = void 0;
			var addAfterSibling = void 0;
			var i = keeper.maps.length;
			for (var _i = 0; _i < keeper.maps.length; _i++) {
				lastInDom = removeAndPopulateFragment(parent, input, keeper.maps[_i], lastInDom);
				if (lastInDom) {
					if (addAfterSibling) {
						parent.insertBefore(fragment, addAfterSibling.nextSibling);
					} else {
						parent.insertBefore(fragment, parent.firstChild);
					}
					addAfterSibling = lastInDom || addAfterSibling;
				}
			}
		},
		reset: function reset(newMaps) {
			validateMaps(newMaps);

			var oldEls = mapElementsIterator(keeper.maps);
			var newEls = mapElementsIterator(newMaps);

			var oldRes = void 0;
			var newRes = void 0;
			for (newRes = newEls.next(); !newRes.done; newRes = newEls.next()) {
				if (!doc.contains(newRes.value)) {
					continue;
				}
				for (oldRes = oldEls.next(); !oldRes.done && !oldRes.value.isEqualNode(newRes.value); oldRes = oldEls.next()) {
					if (doc.contains(oldRes.value)) {
						parent.removeChild(oldRes.value);
					}
				}
				if (oldRes.done) {
					break;
				}
			}
			keeper.maps = newMaps;
		}
	};

	return keeper;
}

function removeAndPopulateFragment(parent, input, map, lastElementInDom) {
	if (map instanceof Node || typeof map.nodeType === 'number') {
		// this element should always be connected
		if (shouldReAppend(map, lastElementInDom)) {
			fragment.appendChild(map);
		}
		lastElementInDom = map;
	} else if (!map || (typeof map === 'undefined' ? 'undefined' : _typeof(map)) !== 'object' || typeof map.length !== 'number') {
		throw new Error(domNodeError);
	} else {
		var removableElement = void 0;
		var element = void 0;
		var i = 1;
		if (match(map[0], input)) {
			for (; i < map.length; i++) {
				element = map[i];
				if (shouldReAppend(element, lastElementInDom)) {
					fragment.appendChild(element);
				}
				lastElementInDom = element;
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

function shouldReAppend(node, previousNode) {
	return !doc.contains(node) || !(!doc.previousSibling && !previousNode) || doc.previousSibling !== previousNode;
}

function validateParent(parent) {
	if (!parent || !(parent instanceof Element) && parent.nodeType !== ELEMENT_NODE) {
		throw new Error('The parent node needs to be an element');
	}
}

function validateMaps(maps) {
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

function mapElementsIterator(maps) {
	var map, mi, ei;
	return regeneratorRuntime.wrap(function mapElementsIterator$(_context) {
		while (1) {
			switch (_context.prev = _context.next) {
				case 0:
					map = void 0;
					mi = 0;

				case 2:
					if (!(mi < maps.length)) {
						_context.next = 23;
						break;
					}

					map = maps[mi];

					if (!(map instanceof Node || typeof map.nodeType === 'number')) {
						_context.next = 9;
						break;
					}

					_context.next = 7;
					return map;

				case 7:
					_context.next = 20;
					break;

				case 9:
					if (!(!map || (typeof map === 'undefined' ? 'undefined' : _typeof(map)) !== 'object' || typeof map.length !== 'number')) {
						_context.next = 13;
						break;
					}

					throw new Error(domNodeError);

				case 13:
					ei = 1;

				case 14:
					if (!(ei < map.length)) {
						_context.next = 20;
						break;
					}

					_context.next = 17;
					return map[ei];

				case 17:
					ei++;
					_context.next = 14;
					break;

				case 20:
					mi++;
					_context.next = 2;
					break;

				case 23:
				case 'end':
					return _context.stop();
			}
		}
	}, _marked, this);
}
