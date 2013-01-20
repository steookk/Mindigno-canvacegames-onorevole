/*! Canvace Client Library - v0.2.5 - 2013-01-10
* http://www.canvace.com/
* Copyright (c) 2013 Canvace Srl */

var Canvace = (function () {
"use strict";
var Canvace = {};


if (typeof Array.prototype.forEach !== "function") {
	Array.prototype.forEach = function (fn, scope) {
		for (var i = 0, len = this.length; i < len; ++i) {
			fn.call(scope, this[i], i, this);
		}
	};
}

if (typeof Array.isArray !== "function") {
	Array.isArray = function (arg) {
		return (Object.prototype.toString.call(arg) === "[object Array]");
	};
}

/**
 * Static class which provides utility methods to eliminate the differences
 * across browsers.
 *
 * @class Canvace.Polyfill
 * @static
 */
Canvace.Polyfill = (function () {
	var prefixes = ["webkit", "moz", "ms", "o"];

	var getSinglePrefixedProperty = function (object, name) {
		var capitalName = name.charAt(0).toUpperCase() + name.substr(1);
		for (var i in prefixes) {
			var prefixedName = prefixes[i] + capitalName;
			if (prefixedName in object) {
				return object[prefixedName];
			}
		}
		return object[name];
	};

	return {
		vendorPrefixes: prefixes,

		/**
		 * Returns a reference to a possibly browser-prefixed property of a
		 * given object.
		 *
		 * @example
		 *	// Get a prefixed property from the `window` object.
		 *	var requestAnimationFrame = Canvace.Polyfill.getPrefixedProperty("requestAnimationFrame");
		 *	
		 *	// Get a prefixed property from a DOM element.
		 *	var canvas = document.getElementById("canvas");
		 *	var requestFullscreen = Canvace.Polyfill.getPrefixedProperty(canvas, ["requestFullscreen", "requestFullScreen"]);
		 *
		 * @method getPrefixedProperty
		 * @param [object] {Object} An optional reference to the object holding
		 * the requested property. Defaults to the `window` object.
		 * @param property {mixed} The property name to retrieve. This can be a
		 * `String` (the property name) or an `Array` of `String`s (variants of
		 * the same property name to try in order).
		 * @return A reference to the requested property, or `undefined`.
		 */
		getPrefixedProperty: function (object, property) {
			if (arguments.length < 2) {
				property = object;
				object = window;
			}

			if (Array.isArray(property) && (property.length > 1)) {
				return getSinglePrefixedProperty(object, property.shift()) || Canvace.Polyfill.getPrefixedProperty(object, property);
			}

			return getSinglePrefixedProperty(object, property.toString());
		}
	};
})();

Canvace.MultiSet = function () {
	var elements = {};
	var nextId = 0;
	var count = 0;

	function add(element) {
		var id = nextId++;
		elements[id] = element;
		count++;
		return function () {
			if (elements.hasOwnProperty(id)) {
				delete elements[id];
				count--;
				return true;
			} else {
				return false;
			}
		};
	}

	(function (elements) {
		for (var i in elements) {
			add(elements[i]);
		}
	})(arguments);

	/**
	 * Inserts an element into the container in amortized constant time. The
	 * element can be of any type (numbers, strings, objects, etc.) and can be
	 * inserted many times.
	 *
	 * The `add` function returns a function that removes the element. The
	 * returned function is idempotent: it does not have any effect when called
	 * again after the first time.
	 *
	 * Example:
	 *
	 *	var ms = new Canvace.MultiSet(1, 2);
	 *	var remove = ms.add(3); // ms now contains three elements: 1, 2 and 3
	 *	remove(); // ms now contains two elements: 1 and 2
	 *	remove(); // no effect, ms still contains 1 and 2
	 *
	 * The returned function returns a boolean value indicating whether the
	 * element was present and could be removed or not. `false` indicates the
	 * element was not present because it had already been removed by a previous
	 * call.
	 *
	 * Example:
	 *
	 *	var ms = new Canvace.MultiSet();
	 *	var remove = ms.add(3);
	 *	if (remove()) {
	 *		alert('removed!');
	 *	}
	 *	if (remove()) {
	 *		alert('this is never alerted');
	 *	}
	 *
	 * @method add
	 * @param element {Any} The element to be inserted in the `MultiSet`.
	 * @return {Function} A function that removes the inserted element.
	 */
	this.add = add;

	/**
	 * Iterates over the container and calls the specified function `action` for
	 * each iterated element.
	 *
	 * The `action` function receives two arguments: the element and a function
	 * that removes it if called. The removing function stays valid forever,
	 * even after the whole `forEach` call is over, and is idempotent: it does
	 * not have any effects after it is called once.
	 *
	 * The following example inserts some numbers into the container and then
	 * removes only the numbers equal to 3:
	 *
	 *	var ms = new Canvace.MultiSet(1, 3, 7, 6, 3, 4, 3, 3, 5);
	 *	ms.forEach(function (element, remove) {
	 *		if (element === 3) {
	 *			remove();
	 *		}
	 *	});
	 *	// ms now contains 1, 7, 6, 4, 5
	 *
	 * Elements with repetitions are iterated as many times as they are
	 * repeated. For example, in the previous snippet the number 3 is iterated
	 * (and removed) four times.
	 *
	 * Note that the order of iteration is undefined as it depends on the order
	 * of iteration over object properties implemented by the underlying
	 * JavaScript engine. This is typically the insertion order, which means
	 * `MultiSet.forEach` enumerates the elements in the same order they are
	 * inserted by `MultiSet.add`, but you must not depend on that assumption.
	 *
	 * The iteration is interrupted if the `action` function returns `false`.
	 * The following example adds some numbers to the container, then iterates
	 * over it and interrupts when it encounters the number 3:
	 *
	 *	var ms = new Canvace.MultiSet(1, 2, 3, 4);
	 *	ms.forEach(function (element) {
	 *		if (element === 3) {
	 *			return false;
	 *		}
	 *	});
	 *
	 * The number 4 is not enumerated.
	 *
	 * `MultiSet.forEach` returns `false` if the iteration completed and `true`
	 * if it was interrupted, which is suitable for implementing finding
	 * algorithms.
	 *
	 * @method forEach
	 * @param action {Function} The callback function that gets called for each
	 * element of the multiset. It receives the current element and a callback
	 * function suitable for deleting it from the `MultiSet`.
	 * @return {Boolean} `true` if `action` returned `false`, `false` if it did
	 * not and all the elements were enumerated.
	 */
	this.forEach = function (action) {
		var makeRemover = function (id) {
			return function () {
				if (elements.hasOwnProperty(id)) {
					delete elements[id];
					count--;
					return true;
				} else {
					return false;
				}
			};
		};

		for (var id in elements) {
			if (elements.hasOwnProperty(id)) {
				if (action(elements[id], makeRemover(id)) === false) {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * Iterates over the container and calls the specified function `action` for
	 * each iterated element.
	 *
	 * The `action` function receives one argument, the current element. Any
	 * return value is ignored.
	 *
	 * This method is similar to the `forEach` method except it can be faster on
	 * some browsers because it does not generate a closure (the element's
	 * removal function) at each iterated element and does not analyze the
	 * return value of the callback function. Infact, the iterated elements
	 * cannot be removed and the iteration cannot be interrupted.
	 *
	 * You usually use the `forEach` method, but you may also use `fastForEach`
	 * if your callback function does not use its second argument (the removal
	 * function) and never returns `false`.
	 *
	 * Note that the order of iteration is undefined as it depends on the order
	 * of iteration over object properties implemented by the underlying
	 * JavaScript engine. This is typically the insertion order, which means
	 * `MultiSet.fastForEach` enumerates the elements in the same order they are
	 * inserted by `MultiSet.add`, but you must not depend on that assumption.
	 *
	 * @method fastForEach
	 * @param action {Function} The callback function that gets called for each
	 * element of the multiset. It receives the current element as an argument.
	 * The return value is ignored.
	 */
	this.fastForEach = function (action) {
		for (var id in elements) {
			if (elements.hasOwnProperty(id)) {
				action(elements[id]);
			}
		}
	};

	/**
	 * Returns the number of elements currently contained.
	 *
	 * If an element is inserted more than once, it counts as many times as it
	 * is inserted.
	 *
	 * This method operates in constant time.
	 *
	 * @method count
	 * @return {Number} The number of contained elements.
	 * @example
	 *	var ms = new Canvace.MultiSet(1, 2, 2, 3, 3);
	 *	alert(ms.count()); // alerts 5
	 */
	this.count = function () {
		return count;
	};

	/**
	 * Indicates whether the container is empty or not.
	 *
	 * @method isEmpty
	 * @return {Boolean} `true` if the container is empty, `false` otherwise.
	 */
	this.isEmpty = function () {
		return !count;
	};

	/**
	 * Empties the container: every element is removed and the count is reset to
	 * zero.
	 *
	 * This method operates in constant time.
	 *
	 * @method clear
	 * @example
	 *	var ms = new Canvace.MultiSet(1, 2, 3, 4, 5);
	 *	ms.clear();
	 *	alert(ms.count()); // alerts 0
	 */
	this.clear = function () {
		elements = {};
		count = 0;
	};
};

Canvace.List = function () {
	var head = null;
	var tail = null;
	var count = 0;

	/**
	 * Provides access to list elements.
	 *
	 * This class cannot be instantiated directly, instances are returned by
	 * methods of the outer class.
	 *
	 * @class Canvace.List.Accessor
	 * @example
	 *	var list = new Canvace.List();
	 *	list.addTail(1);
	 *	list.addTail(2);
	 *	list.addTail(3);
	 *	for (var a = list.getHead(); a; a = a.next()) {
	 *		alert(a.element());
	 *	}
	 */
	function Accessor(node) {
		if (!node) {
			return null;
		}

		/**
		 * Returns the accessed element.
		 *
		 * @method element
		 * @return {Any} The accessed element.
		 * @example
		 *	var list = new Canvace.List();
		 *	var accessor = list.addTail('Hello, world!');
		 *	alert(accessor.element()); // alerts "Hello, world!"
		 */
		this.element = function () {
			return node.element;
		};

		/**
		 * Returns an `Accessor` for accessing the previous element of the list,
		 * or `null` if this `Accessor` represents the first element.
		 *
		 * An exception is thrown if the element represented by this accessor
		 * has been removed by this or any other accessor.
		 *
		 * @method previous
		 * @return {Canvace.List.Accessor} An `Accessor` for accessing the
		 * previous element, or `null` if this `Accessor` represents the
		 * first element.
		 * @example
		 *	var list = new Canvace.List();
		 *	list.addTail(1);
		 *	list.addTail(2);
		 *	list.addTail(3);
		 *	// the following reverse loop alerts, in order: 3, 2, 1
		 *	for (var a = list.getTail(); a; a = a.previous()) {
		 *		alert(a.element());
		 *	}
		 */
		this.previous = function () {
			if ('removed' in node) {
				throw {
					message: 'no previous element, this element has been removed',
					element: node.element
				};
			} else {
				return new Accessor(node.previous);
			}
		};

		/**
		 * Returns an `Accessor` for accessing the next element of the list, or
		 * `null` if this `Accessor` represents the last element.
		 *
		 * An exception is thrown if the element represented by this accessor
		 * has been removed by this or any other accessor.
		 *
		 * @method next
		 * @return {Canvace.List.Accessor} An `Accessor` for accessing the
		 * next element, or `null` if this `Accessor` represents the last
		 * element.
		 * @example
		 *	var list = new Canvace.List();
		 *	list.addTail(1);
		 *	list.addTail(2);
		 *	list.addTail(3);
		 *	// the following loop alerts, in order: 1, 2, 3
		 *	for (var a = list.getHead(); a; a = a.next()) {
		 *		alert(a.element());
		 *	}
		 */
		this.next = function () {
			if ('removed' in node) {
				throw {
					message: 'no next element, this element has been removed',
					element: node.element
				};
			} else {
				return new Accessor(node.next);
			}
		};

		/**
		 * Removes the element from the list.
		 *
		 * @method remove
		 * @return {Boolean} `true` if the element was successfully removed,
		 * `false` otherwise. `false` is returned if this method is called more
		 * than once, thus trying to remove the same element multiple times:
		 * only the first call returns `true`.
		 * @example
		 *	var list = new Canvace.List();
		 *	list.addTail(1);
		 *	list.addTail(2);
		 *	list.addTail(3);
		 *	for (var a = list.getHead(); a; a = a.next()) {
		 *		if (a.element() === 2) {
		 *			a.remove();
		 *		}
		 *	}
		 *	// the element 2 has been removed
		 */
		this.remove = function () {
			if ('removed' in node) {
				return false;
			} else {
				if (node.previous) {
					node.previous.next = node.next;
				}
				if (node.next) {
					node.next.previous = node.previous;
				}
				if (node === head) {
					head = node.next;
				}
				if (node === tail) {
					tail = node.previous;
				}
				node.removed = true;
				return true;
			}
		};
	}

	/**
	 * Adds the specified element to the list before the current head element.
	 *
	 * An `Accessor` to the new element is returned.
	 *
	 * @method addHead
	 * @for Canvace.List
	 * @param element {Any} The element to add.
	 * @return {Canvace.List.Accessor} An `Accessor` to the added element.
	 */
	this.addHead = function (element) {
		head = {
			element: element,
			previous: null,
			next: head
		};
		if (!tail) {
			tail = head;
		}
		count++;
		return new Accessor(head);
	};

	/**
	 * Returns an `Accessor` to the head element, or `null` if the list does not
	 * contain any elements.
	 *
	 * @method getHead
	 * @return {Canvace.List.Accessor} An `Accessor` to the current head
	 * element, or `null` if the list is empty.
	 */
	this.getHead = function () {
		return new Accessor(head);
	};

	/**
	 * Adds the specified element to the list after the current tail element.
	 *
	 * An `Accessor` to the new element is returned.
	 *
	 * @method addTail
	 * @param element {Any} The element to add.
	 * @return {Canvace.List.Accessor} An `Accessor` to the added element.
	 */
	this.addTail = function (element) {
		tail = {
			element: element,
			previous: tail,
			next: null
		};
		if (!head) {
			head = tail;
		}
		count++;
		return new Accessor(tail);
	};

	/**
	 * Returns an `Accessor` to the tail element, or `null` if the list does not
	 * contain any elements.
	 *
	 * @method getTail
	 * @return {Canvace.List.Accessor} An `Accessor` to the current tail
	 * element, or `null` if the list is empty.
	 */
	this.getTail = function () {
		return new Accessor(tail);
	};

	/**
	 * Returns the number of elements currently in the list.
	 *
	 * @method count
	 * @return {Number} The number of elements in the list.
	 */
	this.count = function () {
		return count;
	};

	/**
	 * Returns a boolean value indicating whether the list is empty or not.
	 *
	 * @method isEmpty
	 * @return {Boolean} `true` is the list is empty, `false` otherwise.
	 */
	this.isEmpty = function () {
		return !count;
	};

	/**
	 * Removes all the elements from the list.
	 *
	 * This method operates in constant time.
	 *
	 * @method clear
	 */
	this.clear = function () {
		head = null;
		tail = null;
		count = 0;
	};

	/**
	 * Iterates over the contained elements, from the first to the last.
	 *
	 * This method is faster than manually iterating using `List.getHead` and
	 * subsequent `Accessor.next` calls because it does not instantiate
	 * accessors: the elements are returned directly.
	 *
	 * For each enumerated element the specified `action` callback function is
	 * called and is passed the element.
	 *
	 * The iteration can be interrupted by returning `false` in the callback
	 * function.
	 *
	 * @method forEach
	 * @param action {Function} A user-defined callback function that gets
	 * called for each iterated element. The function receives the current
	 * element as an argument. If the function returns `false` the iteration is
	 * interrupted.
	 * @return {Boolean} `true` if the callback function returned `false` and
	 * the iteration was interrupted, `false` otherwise.
	 */
	this.forEach = function (action) {
		for (var node = head; node; node = node.next) {
			if (action(node.element) === false) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Iterates over the contained elements in reverse order, from the last to
	 * the first.
	 *
	 * This method is faster than manually iterating using `List.getTail` and
	 * subsequent `Accessor.previous` calls because it does not instantiate
	 * accessors: the elements are returned directly.
	 *
	 * For each enumerated element the specified `action` callback function is
	 * called and is passed the element.
	 *
	 * The iteration can be interrupted by returning `false` in the callback
	 * function.
	 *
	 * @method forEachReverse
	 * @param action {Function} A user-defined callback function that gets
	 * called for each iterated element. The function receives the current
	 * element as an argument. If the function returns `false` the iteration is
	 * interrupted.
	 * @return {Boolean} `true` if the callback function returned `false` and
	 * the iteration was interrupted, `false` otherwise.
	 */
	this.forEachReverse = function (action) {
		for (var node = tail; node; node = node.previous) {
			if (action(node.element) === false) {
				return true;
			}
		}
		return false;
	};
};

Canvace.Heap = function (compare, same) {
	if (!same) {
		same = function (first, second) {
			return first === second;
		};
	}

	var heap = [];

	function left(i) {
		return i * 2 + 1;
	}

	function right(i) {
		return i * 2 + 2;
	}

	function parent(i) {
		return Math.floor((i - 1) / 2);
	}

	function smaller(i, j) {
		return compare(heap[i], heap[j]) < 0;
	}

	function swap(i, j) {
		var temp = heap[i];
		heap[i] = heap[j];
		heap[j] = temp;
	}

	function heapify(i) {
		var l = left(i);
		var r = right(i);
		var min = i;
		if ((heap.length > l) && smaller(l, i)) {
			min = l;
		}
		if ((heap.length > r) && smaller(r, min)) {
			min = r;
		}
		if (min > i) {
			swap(i, min);
			heapify(min);
		}
	}

	function find(element, index, callback) {
		if (index < heap.length) {
			if (same(element, heap[index])) {
				if (typeof callback === "function") {
					callback(index);
				}
				return true;
			} else if (compare(element, heap[index]) < 0) {
				return false;
			} else {
				return find(element, left(index), callback) ||
					find(element, right(index), callback);
			}
		} else {
			return false;
		}
	}

	/**
	 * Inserts the specified element into the heap and resorts the heap using
	 * standard algorithms until its properties hold again.
	 *
	 * This method operates in logarithmic time.
	 *
	 * @method push
	 * @param element {Any} The element to be inserted.
	 */
	this.push = function (element) {
		var index = heap.length;
		heap.push(element);
		var parentIndex = parent(index);
		while (index && smaller(index, parentIndex)) {
			swap(index, parentIndex);
			index = parentIndex;
			parentIndex = parent(index);
		}
	};

	/**
	 * Extracts the lowest priority element from the heap in logarithmic time
	 * using standard algorithms.
	 *
	 * The element's priority is determined by comparison with other elements
	 * using the `compare` function specified during construction.
	 *
	 * @method pop
	 * @return {Any} The extracted element.
	 */
	this.pop = function () {
		var result = heap[0];
		var last = heap.pop();
		if (heap.length) {
			heap[0] = last;
			heapify(0);
		}
		return result;
	};

	/**
	 * Returns the lowest priority element without extracting it from the heap.
	 *
	 * The element's priority is determined by comparison with other elements
	 * using the `compare` function specified during construction.
	 *
	 * The return value is undefined if the heap does not contain any elements.
	 *
	 * This method operates in constant time.
	 *
	 * @method peek
	 * @return {Any} The lowest priority element, or `undefined` if the heap is
	 * empty.
	 */
	this.peek = function () {
		if (heap.length > 0) {
			return heap[0];
		}
	};

	/**
	 * Searches the specified element in the heap and returns a boolean value
	 * indicating whether it was found.
	 *
	 * The specified element does not have to be exactly the same physical
	 * object as the one previously inserted in the heap, it only has to
	 * represent the same element; the actual comparison to determine whether
	 * the two objects represent the same element is done by using the `same`
	 * function specified at construction time.
	 *
	 * This method operates in linear time.
	 *
	 * @method contains
	 * @param element {Any} A `same`-equivalent element to look for.
	 * @return {Boolean} `true` if the element was found in the heap, `false`
	 * otherwise.
	 */
	this.contains = function (element) {
		return find(element, 0);
	};

	/**
	 * Searches the specified element in the heap and returns it if it can be
	 * found.
	 *
	 * The return value is defined _only_ if the element is found, otherwise
	 * this method does not return anything. You can test whether an element was
	 * found or not using the `typeof` operator and checking against the string
	 * `"undefined"`, as in the following example:
	 *
	 *	var result = heap.find(...);
	 *	if (typeof result !== 'undefined') {
	 *		// the element has been found in the heap
	 *		// and is contained in the `result` variable
	 *	} else {
	 *		// the element was NOT found in the heap
	 *	}
	 *
	 * The specified element does not have to be exactly the same physical
	 * object as the one previously inserted in the heap, it only has to
	 * represent the same element; the actual comparison to determine whether
	 * the two objects represent the same element is done by using the `same`
	 * function specified at construction time.
	 *
	 * This method operates in linear time.
	 *
	 * @method find
	 * @param element {Any} A `same`-equivalent element to look for.
	 * @return {Mixed} The original element that was inserted into the heap, or
	 * nothing if no element was found.
	 */
	this.find = function (element) {
		var result;
		if (find(element, 0, function (index) {
			result = heap[index];
		})) {
			return result;
		}
	};

	/**
	 * Decreases the specified element's priority and resorts the heap using
	 * standard algorithms; as a consequence, the specified element will
	 * typically move higher within the heap (which means gaining a lower
	 * priority and being extracted earlier).
	 *
	 * This method has no effect if the heap does not contain the specified
	 * element.
	 *
	 * @method decreaseKey
	 * @param element {Any} The element whose key/priority has to be decreased.
	 *
	 * This argument doesn't need to be exactly the same physical object as the
	 * previously inserted element: it only has to represent the same element;
	 * the actual comparison to determine whether the two objects represent the
	 * same element is done by using the `same` function specified at
	 * construction time.
	 * @param decrease {Function} A user-specified function that does the actual
	 * decreasing.
	 *
	 * This is called during the execution of `decreaseKey` and receives one
	 * argument, the element whose key is being decreased; note that the
	 * original element contained in the heap, not the possibly alternate
	 * version specified to the `element` argument, is passed to the `decrease`
	 * callback function.
	 *
	 * The main purpose of the `decrease` function is to decrease the key so
	 * that changes are reflected by subsequent `compare` and `same` calls.
	 *
	 * The return value of the `decrease` function is ignored.
	 */
	this.decreaseKey = function (element, decrease) {
		return find(element, 0, function (index) {
			decrease(heap[index]);
			var parentIndex = parent(index);
			while (index && smaller(index, parentIndex)) {
				swap(index, parentIndex);
				index = parentIndex;
				parentIndex = parent(index);
			}
		});
	};

	/**
	 * Returns the number of elements inserted in the heap so far.
	 *
	 * @method count
	 * @return {Number} The number of elements in the heap.
	 */
	this.count = function () {
		return heap.length;
	};

	/**
	 * Indicates whether the heap is empty or not.
	 *
	 * @method isEmpty
	 * @return {Boolean} `true` if the heap is empty, `false` otherwise.
	 */
	this.isEmpty = function () {
		return !heap.length;
	};

	/**
	 * Empties the heap. This method operates in constant time.
	 *
	 * @method clear
	 */
	this.clear = function () {
		heap = [];
	};
};

Canvace.StateMachine = function (states, initialState) {
	var actions = (function () {
		var set = {};
		for (var stateName in states) {
			if (states.hasOwnProperty(stateName)) {
				for (var action in states[stateName]) {
					if (states[stateName].hasOwnProperty(action)) {
						set[action] = true;
					}
				}
			}
		}
		return set;
	})();

	var currentState, currentStateName;

	function setState(name) {
		if (!(name in states)) {
			throw 'invalid state "' + name + '"';
		}
		currentState = states[name];
		currentStateName = name;
	}

	setState(initialState);

	(function ($this) {
		var makeState = function (action) {
			return function () {
				if (action in currentState) {
					if (typeof currentState[action] === 'string') {
						var newStateName = currentState[action];
						setState(newStateName);
						return newStateName;
					} else if (typeof currentState[action] === 'function') {
						var result = currentState[action].apply(currentState, arguments);
						if (typeof result === 'string') {
							setState(result);
							return result;
						} else {
							return currentStateName;
						}
					} else {
						throw 'invalid transition "' + action + '" for state "' + currentStateName + '"';
					}
				} else {
					return currentStateName;
				}
			};
		};

		for (var action in actions) {
			if (actions.hasOwnProperty(action)) {
				$this[action] = makeState(action);
			}
		}
	})(this);

	/**
	 * Indicates the current state.
	 *
	 * @method getCurrentState
	 * @return {String} The name of the current state.
	 */
	this.getCurrentState = function () {
		return currentStateName;
	};
};

Canvace.ParametricStateMachine = function (transitions, states, initialState) {
	var currentState, currentStateName;

	function setState(name) {
		if (typeof name !== 'string') {
			if (0 in name) {
				var parameters = name;
				name = name[0];
				if (!(name in states)) {
					throw 'invalid state "' + name + '"';
				}
				if (typeof states[name] !== 'function') {
					currentState = states[name];
				} else {
					parameters.shift();
					currentState = states[name].apply(currentState, parameters);
				}
				currentStateName = name;
			} else {
				throw 'invalid transition: ' + name;
			}
		} else {
			if (!(name in states)) {
				throw 'invalid state "' + name + '"';
			}
			if (typeof states[name] !== 'function') {
				currentState = states[name];
			} else {
				currentState = states[name].call(currentState);
			}
			currentStateName = name;
		}
	}

	setState(initialState);

	(function ($this) {
		var makeState = function (transition) {
			$this[transition] = function () {
				if (transition in currentState) {
					if (typeof currentState[transition] !== 'function') {
						setState(currentState[transition]);
					} else {
						var result = currentState[transition].apply(currentState, arguments);
						if (typeof result !== 'undefined') {
							setState(result);
						}
					}
				}
				return currentStateName;
			};
		};

		for (var i in transitions) {
			makeState(transitions[i]);
		}
	})(this);

	/**
	 * Indicates the current state.
	 *
	 * @method getCurrentState
	 * @return {String} The name of the current state.
	 */
	this.getCurrentState = function () {
		return currentStateName;
	};
};

Canvace.Astar = function (epsilon) {
	if (typeof epsilon !== 'number') {
		epsilon = 0;
	} else if (epsilon < 0) {
		throw 'the epsilon parameter must be positive';
	}

	/**
	 * This is not an actual inner class, it just documents what graph nodes
	 * must implement in order to be suitable for the `Astar.findPath` method.
	 *
	 * Objects providing these properties and methods are usable as graph nodes
	 * and may be passed as arguments to `Astar.findPath`.
	 *
	 * @class Canvace.Astar.Node
	 * @static
	 */

	/**
	 * A unique ID assigned to the node. Different nodes in the graph must have
	 * different IDs.
	 *
	 * @property id
	 * @type String
	 */

	/**
	 * The heuristically estimated cost to walk up to the target node.
	 *
	 * @property heuristic
	 * @type Number
	 */

	/**
	 * A map object whose keys are edge labels and whose values are functions.
	 * Each function returns the neighbor graph `Node` connected to this node
	 * through the edge.
	 *
	 * @property neighbors
	 * @type Object
	 */

	/**
	 * A function that receives one `String` argument, an edge label, and
	 * returns its cost.
	 *
	 * @property distance
	 * @type Function
	 */

	/**
	 * Finds a path between two nodes of a graph. A path is always found if one
	 * exists, otherwise `null` is returned.
	 *
	 * The found path is always _admissible_, which means its cost is either
	 * optimal (the least possible one) or is at most `1 + epsilon` times the
	 * optimal one, where `epsilon` is the parameter specified to the `Astar`
	 * constructor.
	 *
	 * The `startNode` and `targetNode` are `Astar.Node`-like objects
	 * representing the first and last node of the path to find, respectively;
	 * `Astar.Node`-like means they have to provide the same properties and
	 * methods described by the documentation of the `Astar.Node` pseudo-class.
	 *
	 * `Astar.Node` objects allow to specify a directed graph with weighted and
	 * labeled edges. Edge weights are real numbers and are used to compute the
	 * cost of a path. Edge labels are strings and are then used to describe the
	 * path as an array of edges to walk.
	 *
	 * The computed path, if one exists, is returned as an array of strings.
	 * `null` is returned if the target node is unreachable from the starting
	 * node.
	 *
	 * @method findPath
	 * @for Canvace.Astar
	 * @param startNode {Canvace.Astar.Node} The starting node.
	 * @param targetNode {Canvace.Astar.Node} The node to reach.
	 * @return {String[]} An array of edge labels that identify the edges that
	 * form the computed path, or `null` if no path can be found.
	 */
	this.findPath = function (startNode, targetNode) {
		var closedSet = {};
		var openScore = {};
		var backLink = {};

		var heap = new Canvace.Heap(function (u, v) {
			var fu = openScore[u.id] + u.heuristic * (1 + epsilon);
			var fv = openScore[v.id] + v.heuristic * (1 + epsilon);
			if (fu < fv) {
				return -1;
			} else if (fu > fv) {
				return 1;
			} else {
				return 0;
			}
		}, function (u, v) {
			return u.id === v.id;
		});

		var makeDecreaser = function (node) {
			openScore[node.id] = cost;
			backLink[node.id] = {
				parent: currentNode,
				edge: edge
			};
		};

		var node;
		openScore[startNode.id] = 0;
		heap.push(startNode);
		while (!heap.isEmpty()) {
			var currentNode = heap.pop();
			var score = openScore[currentNode.id];
			delete openScore[currentNode.id];
			if (currentNode.heuristic) {
				closedSet[currentNode.id] = true;
				for (var edge in currentNode.neighbors) {
					if (currentNode.neighbors.hasOwnProperty(edge)) {
						node = currentNode.neighbors[edge]();
						if (!closedSet.hasOwnProperty(node.id)) {
							var cost = score + currentNode.distance(edge);
							if (openScore.hasOwnProperty(node.id)) {
								if (cost < openScore[node.id]) {
									heap.decreaseKey(node, makeDecreaser(node));
								}
							} else {
								openScore[node.id] = cost;
								backLink[node.id] = {
									parent: currentNode,
									edge: edge
								};
								heap.push(node);
							}
						}
					}
				}
			} else {
				var path = [];
				for (node = currentNode; backLink.hasOwnProperty(node.id); node = backLink[node.id].parent) {
					path.push(backLink[node.id].edge);
				}
				return path.reverse();
			}
		}
		return null;
	};
};

Canvace.mobileBrowser = (function(a){return(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)));})(navigator.userAgent||navigator.vendor||window.opera);

if (typeof window.KeyEvent === "undefined") {
	window.KeyEvent = {
		DOM_VK_CANCEL: 3,
		DOM_VK_HELP: 6,
		DOM_VK_BACK_SPACE: 8,
		DOM_VK_TAB: 9,
		DOM_VK_CLEAR: 12,
		DOM_VK_RETURN: 13,
		DOM_VK_ENTER: 14,
		DOM_VK_SHIFT: 16,
		DOM_VK_CONTROL: 17,
		DOM_VK_ALT: 18,
		DOM_VK_PAUSE: 19,
		DOM_VK_CAPS_LOCK: 20,
		DOM_VK_KANA: 21,
		DOM_VK_HANGUL: 21,
		DOM_VK_EISU: 22,
		DOM_VK_JUNJA: 23,
		DOM_VK_FINAL: 24,
		DOM_VK_HANJA: 25,
		DOM_VK_KANJI: 25,
		DOM_VK_ESCAPE: 27,
		DOM_VK_CONVERT: 28,
		DOM_VK_NONCONVERT: 29,
		DOM_VK_ACCEPT: 30,
		DOM_VK_MODECHANGE: 31,
		DOM_VK_SPACE: 32,
		DOM_VK_PAGE_UP: 33,
		DOM_VK_PAGE_DOWN: 34,
		DOM_VK_END: 35,
		DOM_VK_HOME: 36,
		DOM_VK_LEFT: 37,
		DOM_VK_UP: 38,
		DOM_VK_RIGHT: 39,
		DOM_VK_DOWN: 40,
		DOM_VK_SELECT: 41,
		DOM_VK_PRINT: 42,
		DOM_VK_EXECUTE: 43,
		DOM_VK_PRINTSCREEN: 44,
		DOM_VK_INSERT: 45,
		DOM_VK_DELETE: 46,
		DOM_VK_0: 48,
		DOM_VK_1: 49,
		DOM_VK_2: 50,
		DOM_VK_3: 51,
		DOM_VK_4: 52,
		DOM_VK_5: 53,
		DOM_VK_6: 54,
		DOM_VK_7: 55,
		DOM_VK_8: 56,
		DOM_VK_9: 57,
		DOM_VK_COLON: 58,
		DOM_VK_SEMICOLON: 59,
		DOM_VK_LESS_THAN: 60,
		DOM_VK_EQUALS: 61,
		DOM_VK_GREATER_THAN: 62,
		DOM_VK_QUESTION_MARK: 63,
		DOM_VK_AT: 64,
		DOM_VK_A: 65,
		DOM_VK_B: 66,
		DOM_VK_C: 67,
		DOM_VK_D: 68,
		DOM_VK_E: 69,
		DOM_VK_F: 70,
		DOM_VK_G: 71,
		DOM_VK_H: 72,
		DOM_VK_I: 73,
		DOM_VK_J: 74,
		DOM_VK_K: 75,
		DOM_VK_L: 76,
		DOM_VK_M: 77,
		DOM_VK_N: 78,
		DOM_VK_O: 79,
		DOM_VK_P: 80,
		DOM_VK_Q: 81,
		DOM_VK_R: 82,
		DOM_VK_S: 83,
		DOM_VK_T: 84,
		DOM_VK_U: 85,
		DOM_VK_V: 86,
		DOM_VK_W: 87,
		DOM_VK_X: 88,
		DOM_VK_Y: 89,
		DOM_VK_Z: 90,
		DOM_VK_WIN: 91,
		DOM_VK_CONTEXT_MENU: 93,
		DOM_VK_SLEEP: 95,
		DOM_VK_NUMPAD0: 96,
		DOM_VK_NUMPAD1: 97,
		DOM_VK_NUMPAD2: 98,
		DOM_VK_NUMPAD3: 99,
		DOM_VK_NUMPAD4: 100,
		DOM_VK_NUMPAD5: 101,
		DOM_VK_NUMPAD6: 102,
		DOM_VK_NUMPAD7: 103,
		DOM_VK_NUMPAD8: 104,
		DOM_VK_NUMPAD9: 105,
		DOM_VK_MULTIPLY: 106,
		DOM_VK_ADD: 107,
		DOM_VK_SEPARATOR: 108,
		DOM_VK_SUBTRACT: 109,
		DOM_VK_DECIMAL: 110,
		DOM_VK_DIVIDE: 111,
		DOM_VK_F1: 112,
		DOM_VK_F2: 113,
		DOM_VK_F3: 114,
		DOM_VK_F4: 115,
		DOM_VK_F5: 116,
		DOM_VK_F6: 117,
		DOM_VK_F7: 118,
		DOM_VK_F8: 119,
		DOM_VK_F9: 120,
		DOM_VK_F10: 121,
		DOM_VK_F11: 122,
		DOM_VK_F12: 123,
		DOM_VK_F13: 124,
		DOM_VK_F14: 125,
		DOM_VK_F15: 126,
		DOM_VK_F16: 127,
		DOM_VK_F17: 128,
		DOM_VK_F18: 129,
		DOM_VK_F19: 130,
		DOM_VK_F20: 131,
		DOM_VK_F21: 132,
		DOM_VK_F22: 133,
		DOM_VK_F23: 134,
		DOM_VK_F24: 135,
		DOM_VK_NUM_LOCK: 144,
		DOM_VK_SCROLL_LOCK: 145,
		DOM_VK_CIRCUMFLEX: 160,
		DOM_VK_EXCLAMATION: 161,
		DOM_VK_DOUBLE_QUOTE: 162,
		DOM_VK_HASH: 163,
		DOM_VK_DOLLAR: 164,
		DOM_VK_PERCENT: 165,
		DOM_VK_AMPERSAND: 166,
		DOM_VK_UNDERSCORE: 167,
		DOM_VK_OPEN_PAREN: 168,
		DOM_VK_CLOSE_PAREN: 169,
		DOM_VK_ASTERISK: 170,
		DOM_VK_PLUS: 171,
		DOM_VK_PIPE: 172,
		DOM_VK_HYPHEN_MINUS: 173,
		DOM_VK_OPEN_CURLY_BRACKET: 174,
		DOM_VK_CLOSE_CURLY_BRACKET: 175,
		DOM_VK_TILDE: 176,
		DOM_VK_COMMA: 188,
		DOM_VK_PERIOD: 190,
		DOM_VK_SLASH: 191,
		DOM_VK_BACK_QUOTE: 192,
		DOM_VK_OPEN_BRACKET: 219,
		DOM_VK_BACK_SLASH: 220,
		DOM_VK_CLOSE_BRACKET: 221,
		DOM_VK_QUOTE: 222,
		DOM_VK_META: 224,
		DOM_VK_ALTGR: 225,
		DOM_KEY_LOCATION_STANDARD: 0,
		DOM_KEY_LOCATION_LEFT: 1,
		DOM_KEY_LOCATION_RIGHT: 2,
		DOM_KEY_LOCATION_NUMPAD: 3,
		DOM_KEY_LOCATION_MOBILE: 4,
		DOM_KEY_LOCATION_JOYSTICK: 5
	};
}

/**
 * Helper class that eases cross-browser keyboard input management.
 *
 * @class Canvace.Keyboard
 * @constructor
 * @param element {HTMLElement} A DOM element used to capture keyboard input.
 * @param [preventDefaultActions] {Boolean} Indicates whether default actions
 * must be automatically prevented by the `Keyboard` class for handled keys.
 * Unhandled keys keep their default behavior.
 *
 * This argument defaults to `true`.
 */
Canvace.Keyboard = function (element, preventDefaultActions) {
	function Handlers() {
		var handlers = {};
		function register(keyCode, handler) {
			if (!(keyCode in handlers)) {
				handlers[keyCode] = new Canvace.MultiSet();
			}
			return handlers[keyCode].add(handler);
		}
		this.register = function (keyCode, handler) {
			if (typeof keyCode === 'number') {
				return register(keyCode, handler);
			} else {
				var removers = [];
				for (var i in keyCode) {
					removers.push(register(keyCode[i], handler));
				}
				return function () {
					for (var i in removers) {
						removers();
					}
				};
			}
		};
		this.fire = function (keyCode) {
			if (keyCode in handlers) {
				handlers[keyCode].fastForEach(function (handler) {
					handler(keyCode);
				});
				return true;
			} else {
				return false;
			}
		};
	}

	var keys = {};
	var prevent = {};
	var keyDownHandlers = new Handlers();
	var keyUpHandlers = new Handlers();
	var keyPressHandlers = new Handlers();

	if ((preventDefaultActions === true) || (typeof preventDefaultActions === 'undefined')) {
		element.addEventListener('keydown', function (event) {
			var code = event.charCode || event.keyCode;
			if (keys[code]) {
				if (prevent[code]) {
					event.preventDefault();
				}
			} else {
				keys[code] = true;
				if (keyDownHandlers.fire(code)) {
					prevent[code] = true;
					event.preventDefault();
				}
			}
		}, false);
		element.addEventListener('keypress', function (event) {
			if (keyPressHandlers.fire(event.charCode || event.keyCode)) {
				event.preventDefault();
			}
		}, false);
		element.addEventListener('keyup', function (event) {
			var code = event.charCode || event.keyCode;
			delete keys[code];
			delete prevent[code];
			if (keyUpHandlers.fire(code)) {
				event.preventDefault();
			}
		}, false);
	} else {
		element.addEventListener('keydown', function (event) {
			var code = event.charCode || event.keyCode;
			if (!keys[code]) {
				keys[code] = true;
				keyDownHandlers.fire(code);
			}
		}, false);
		element.addEventListener('keypress', function (event) {
			keyPressHandlers.fire(event.charCode || event.keyCode);
		}, false);
		element.addEventListener('keyup', function (event) {
			var code = event.charCode || event.keyCode;
			delete keys[code];
			keyUpHandlers.fire(code);
		}, false);
	}

	/**
	 * Indicates whether the key identified by the specified virtual key code is
	 * currently pressed. You can safely use DOM\_VK\_XXX codes from the
	 * `KeyEvent` global object: Canvace normalizes it across browsers.
	 *
	 * @method isKeyDown
	 * @param keyCode {Number} The virtual key code to test.
	 * @return {Boolean} `true` if the specified key is currently pressed,
	 * `false` otherwise.
	 */
	this.isKeyDown = function (keyCode) {
		return keyCode in keys;
	};

	/**
	 * Indicates whether the specified keys are currently pressed. This method
	 * accepts any number of arguments and each argument is a virtual key code.
	 * You can safely use the DOM\_VK\_XXX codes from the `KeyEvent` global
	 * object: Canvace normalizes it across browsers.
	 *
	 * @method areKeysDown
	 * @param [keyCodes]* {Number} Any number of virtual key codes.
	 * @return {Boolean} `false` if any of the specified keys is not currently
	 * pressed, `true` otherwise. If no keys are specified `true` is returned.
	 */
	this.areKeysDown = function () {
		for (var i in arguments) {
			if (!keys[arguments[i]]) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Registers a key handler that gets called when the specified key or keys
	 * are pressed.
	 *
	 * This method returns a function that unregister the registered handler.
	 * The returned function does not receive any arguments, does not return
	 * anything and is idempotent: it does not have any effects when called
	 * again after the first time.
	 *
	 * The same event handler can be registered more than once, in which case it
	 * actually gets called more than once each time the event occurs.
	 *
	 * Event handlers are NOT necessarily called in the same order they are
	 * registered.
	 *
	 * @method onKeyDown
	 * @param keyCode {Mixed} The virtual key code or an array of virtual key
	 * codes.
	 *
	 * You can safely use DOM\_VK\_XXX codes from the `KeyEvent` global object:
	 * Canvace normalizes it across browsers.
	 * @param handler {Function} A user-defined function that gets called when
	 * the event occurs. It receives one argument, the virtual key code.
	 * @return {Function} A function that unregisters the registered handler.
	 *
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 *
	 * If the same handler was registered more than once, the returned function
	 * only removes its own registration.
	 */
	this.onKeyDown = keyDownHandlers.register;

	/**
	 * Registers a key handler that gets called when the specified key is
	 * depressed or all of the specified keys are depressed, depending on
	 * whether you specify one or more key codes.
	 *
	 * This method returns a function that unregisters the registered handler.
	 * The returned function does not receive any arguments, does not return
	 * anything and is idempotent: it does not have any effects when called
	 * again after the first time.
	 *
	 * The same event handler can be registered more than once, in which case it
	 * actually gets called more than once each time the event occurs.
	 *
	 * Event handlers are NOT necessarily called in the same order they are
	 * registered.
	 *
	 * @method onKeyUp
	 * @param keyCode {Mixed} The virtual key code or an array of virtual key
	 * codes.
	 *
	 * You can safely use DOM\_VK\_XXX codes from the `KeyEvent` global object:
	 * Canvace normalizes it across browsers.
	 * @param handler {Function} A user-defined function that gets called when
	 * the event occurs. It receives one argument, the virtual key code.
	 * @return {Function} A function that unregisters the registered handler.
	 *
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 *
	 * If the same handler was registered more than once, the returned function
	 * only removes its own registration.
	 */
	this.onKeyUp = function (keyCode, handler) {
		if (typeof keyCode !== 'number') {
			return keyUpHandlers.register(keyCode, function () {
				for (var i in keyCode) {
					if (keys[keyCode[i]]) {
						return;
					}
				}
				return handler.apply(this, arguments);
			});
		} else {
			return keyUpHandlers.register(keyCode, handler);
		}
	};

	/**
	 * Registers a key handler that gets called after the specified key or keys
	 * are pressed.
	 *
	 * The only difference between the "keyDown" and "keyPress" events of this
	 * class is that, in case a key is held down, the latter is fired multiple
	 * times while the former is fired only once.
	 *
	 * The only difference between the "keyUp" and "keyPress" events of this
	 * class is that the handlers for the latter gets all called before the
	 * handlers for the former.
	 *
	 * This method returns a function that unregister the registered handler.
	 * The returned function does not receive any arguments, does not
	 * return anything and is idempotent: it does not have any effects when
	 * called again after the first time.
	 *
	 * The same event handler can be registered more than once, in which case it
	 * actually gets called more than once each time the event occurs.
	 *
	 * Event handlers are NOT necessarily called in the same order they are
	 * registered.
	 *
	 * @method onKeyPress
	 * @param keyCode {Mixed} The virtual key code or an array of virtual key
	 * codes.
	 *
	 * You can safely use DOM\_VK\_XXX codes from the `KeyEvent` global object:
	 * Canvace normalizes it across browsers.
	 * @param handler {Function} A user-defined function that gets called when
	 * the event occurs. It receives one argument, the virtual key code.
	 * @return {Function} A function that unregisters the registered handler.
	 *
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 *
	 * If the same handler was registered more than once, the returned function
	 * only removes its own registration.
	 */
	this.onKeyPress = keyPressHandlers.register;
};

Canvace.Mouse = function (element) {
	var moveHandlers = new Canvace.MultiSet();
	var downHandlers = new Canvace.MultiSet();
	var upHandlers = new Canvace.MultiSet();
	var dragHandlers = new Canvace.MultiSet();
	var wheelHandlers = new Canvace.MultiSet();

	var dragging = false;
	var x0, y0;

	element.addEventListener('mousedown', function (event) {
		var x = event.clientX - element.style.left;
		var y = event.clientY - element.style.top;
		dragging = true;
		x0 = x;
		y0 = y;
		downHandlers.fastForEach(function (handler) {
			handler(x, y);
		});
	}, false);
	element.addEventListener('mousemove', function (event) {
		var x = event.clientX - element.style.left;
		var y = event.clientY - element.style.top;
		moveHandlers.fastForEach(function (handler) {
			handler(x, y);
		});
		if (dragging) {
			dragHandlers.fastForEach(function (handler) {
				handler(x0, y0, x, y);
			});
			x0 = x;
			y0 = y;
		}
	}, false);
	element.addEventListener('mouseup', function (event) {
		var x = event.clientX - element.style.left;
		var y = event.clientY - element.style.top;
		dragging = false;
		upHandlers.fastForEach(function (handler) {
			handler(x, y);
		});
	}, false);

	if (typeof element.onwheel !== "undefined") {
		element.addEventListener('wheel', function (event) {
			var x = event.clientX - element.style.left;
			var y = event.clientY - element.style.top;
			wheelHandlers.fastForEach(function (handler) {
				handler(x, y, -event.deltaX, -event.deltaY);
			});
		}, false);
	} else if (typeof element.onmousewheel !== "undefined") {
		element.addEventListener('mousewheel', function (event) {
			var x = event.clientX - element.style.left;
			var y = event.clientY - element.style.top;
			wheelHandlers.fastForEach(function (handler) {
				handler(x, y, event.wheelDeltaX, event.wheelDeltaY);
			});
		}, false);
	}

	// TODO capture touch events

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time the mouse is moved over the HTML element.
	 *
	 * The specified function receives two arguments, `x` and `y`, indicating
	 * the coordinates of the mouse pointer relative to the element's left top
	 * corner. The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 *
	 * Multiple handlers may be registered. The same handler may also be
	 * registered more than once, in which case it gets called as many times as
	 * it was registered every time the mouse is moved.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onMove
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives two arguments (the coordinates of the mouse pointer)
	 * and its return value is ignored.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onMove = function (handler) {
		return moveHandlers.add(handler);
	};

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time a mouse button is pressed over the HTML element.
	 *
	 * The specified function receives two arguments, `x` and `y`, indicating
	 * the coordinates of the mouse pointer relative to the element's left top
	 * corner. The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 *
	 * Multiple handlers may be registered. The same handler may also be
	 * registered more than once, in which case it gets called as many times as
	 * it was registered every time a mouse button is pressed.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onDown
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives two arguments (the coordinates of the mouse pointer)
	 * and its return value is ignored.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onDown = function (handler) {
		return downHandlers.add(handler);
	};

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time a mouse button is depressed over the HTML element.
	 *
	 * The specified function receives two arguments, `x` and `y`, indicating
	 * the coordinates of the mouse pointer relative to the element's left top
	 * corner. The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 *
	 * Multiple handlers may be registered. The same handler may also be
	 * registered more than once, in which case it gets called as many times as
	 * it was registered every time a mouse button is depressed.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onUp
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives two arguments (the coordinates of the mouse pointer)
	 * and its return value is ignored.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onUp = function (handler) {
		return upHandlers.add(handler);
	};

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time the mouse is dragged over the HTML element.
	 *
	 * The specified function receives two arguments, `x` and `y`, indicating
	 * the coordinates of the mouse pointer relative to the element's left top
	 * corner. The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 * Multiple handlers may be registered.
	 *
	 * The same handler may also be registered more than once, in which case it
	 * gets called as many times as it was registered every time the mouse is
	 * dragged.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onDrag
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives two arguments (the coordinates of the mouse pointer)
	 * and its return value is ignored.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onDrag = function (handler) {
		return dragHandlers.add(handler);
	};

	/**
	 * Registers the specified user-defined event handler that is invoked every
	 * time the mouse wheel is used to scroll over the HTML element.
	 *
	 * The specified function receives four arguments, `x`, `y`, `dX` and `dY`,
	 * indicating the coordinates of the mouse pointer relative to the element's
	 * left top corner and the relative wheel movement in the X and Y
	 * directions. The return value is ignored.
	 *
	 * This method returns a function that unregisters the registered handler.
	 *
	 * Multiple handlers may be registered. The same handler may also be
	 * registered more than once, in which case it gets called as many times as
	 * it was registered every time the mouse is moved.
	 *
	 * If a handler is registered more than once, the function returned by this
	 * method only removes its own registration.
	 *
	 * @method onWheel
	 * @param handler {Function} A user-defined handler function. The specified
	 * function receives three arguments (the `x` and `y` coordinates of the
	 * mouse pointer, and the relative `dX` and `dY` movement of the mouse
	 * wheel) and its return value is ignored.
	 * The `dX` and `dY` arguments respectively assume positive values in case
	 * of a rightwards or upwards movement, and negative values in case of a
	 * leftwards or downwards movement.
	 * @return {Function} A function that unregisters the registered handler.
	 * The returned function does not receive any arguments and does not return
	 * anything.
	 */
	this.onWheel = function (handler) {
		return wheelHandlers.add(handler);
	};
};

Canvace.Loader = function (basePath, onLoadProgress, onLoadComplete, onLoadError) {
	var thisObject = this;

	var loadProgress = onLoadProgress || function () {};
	var loadComplete = onLoadComplete || function () {};
	var loadError    = onLoadError    || function () {};

	/**
	 * Sets the load progress callback function.
	 *
	 * @method onProgress
	 * @chainable
	 * @param callback {Function} The callback function.
	 */
	this.onProgress = function (callback) {
		if (typeof callback === "function") {
			loadProgress = callback;
		}
		return thisObject;
	};

	/**
	 * Sets the load complete callback function. It receives a reference to this
	 * loader.
	 *
	 * @method onComplete
	 * @chainable
	 * @param callback {Function} The callback function.
	 */
	this.onComplete = function (callback) {
		if (typeof callback === "function") {
			loadComplete = callback;
		}
		return thisObject;
	};

	/**
	 * Sets the load error callback function.
	 *
	 * @method onError
	 * @chainable
	 * @param callback {Function} The callback function.
	 */
	this.onError = function (callback) {
		if (typeof callback === "function") {
			loadError = callback;
		}
		return thisObject;
	};

	var audio = new Canvace.Audio();

	var imageset = {};
	var imagesLoaded = false;
	var imagesProgress = 0.0;

	var soundset = {};
	var soundsLoaded = false;
	var soundsProgress = 0.0;

	var updateProgress = function () {
		loadProgress((imagesProgress + soundsProgress) / 2.0);
	};

	var loadFinished = function () {
		if (imagesLoaded && soundsLoaded) {
			loadComplete(thisObject);
		}
	};

	var loadImages = function (data) {
		var totalCount = 0;
		var id;

		for (id in data.tiles) {
			totalCount += data.tiles[id].frames.length;
		}

		for (id in data.entities) {
			totalCount += data.entities[id].frames.length;
		}

		var progress = (function () {
			var count = 0;

			return function () {
				imagesProgress = (100.0 * ++count / Math.max(1, totalCount));
				updateProgress();

				if (count >= totalCount) {
					imagesLoaded = true;
					loadFinished();
				}
			};
		}());

		if (totalCount === 0) {
			progress();
			return thisObject;
		}

		function batchImages(descriptor) {
			var loadIt = function (id) {
				var image = new Image();
				image.addEventListener("load", progress, false);
				image.setAttribute("src", [basePath, id].join("/"));
				imageset[id] = image;
			};

			for (var i in descriptor.frames) {
				loadIt(descriptor.frames[i].id);
			}
		}

		for (id in data.tiles) {
			batchImages(data.tiles[id]);
		}

		for (id in data.entities) {
			batchImages(data.entities[id]);
		}

		return thisObject;
	};

	/**
	 * Loads an image from the exported image set.
	 *
	 * @method getImage
	 * @param id {Number} The ID of the image to load.
	 * @param [callback] {Function} An optional callback function to invoke when
	 * the loading of the image is complete.
	 * @return {HTMLImageElement} The HTML image element representing the loaded
	 * image.
	 */
	this.getImage = function (id, callback) {
		if (id in imageset) {
			return imageset[id];
		}

		var image = new Image();
		if (typeof callback === "function") {
			image.addEventListener("load", callback, false);
		}
		image.setAttribute("src", [basePath, id].join("/"));
		return imageset[id] = image;
	};

	var loadSounds = function (sources) {
		var totalCount = Object.keys(sources).length;

		var progress = (function () {
			var count = 0;

			return function () {
				soundsProgress = (100.0 * ++count / Math.max(1, totalCount));
				updateProgress();

				if (count >= totalCount) {
					soundsLoaded = true;
					loadFinished();
				}
			};
		}());

		if (totalCount === 0) {
			progress();
			return thisObject;
		}

		var triggerError = function (i) {
			return function () {
				loadError(i);
			};
		};

		for (var i in sources) {
			var suitable = false;

			for (var j in sources[i]) {
				try {
					var info = Canvace.Loader.getSourceInfo(sources[i][j]);
					var source = [basePath, info.url].join("/");

					if (audio.canPlayType(info.mimeType)) {
						suitable = true;
						soundset[i] = audio.load(source, progress, triggerError(i));
						break;
					}
				} catch (e) {
					loadError(e);
				}
			}

			if (!suitable) {
				loadError(i);
				progress();
			}
		}

		return thisObject;
	};

	/**
	 * Returns a `Canvace.Audio.SourceNode` representing the audio asset
	 * identified by the specified name. This name corresponds to one of the
	 * names specified to the `loadAssets` method. This method must be called
	 * after the sounds have been loaded by the `loadAssets` method.
	 *
	 * @method getSound
	 * @param name {String} A name identifying an audio asset.
	 * @return {Canvace.Audio.SourceNode} An object that can be used to play
	 * the sound back if the specified name is known, `null` otherwise.
	 */
	this.getSound = function (name) {
		if (name in soundset) {
			return soundset[name];
		}
		return null;
	};

	/**
	 * Asynchronously loads all the images associated with the given Canvace
	 * stage and all the given sounds.
	 *
	 * @example
	 *	var soundResources = null;
	 *	
	 *	// Explicit description of the sources, complete with MIME type and URL
	 *	soundResources = {
	 *		"first-sound": [{
	 *			mimeType: "audio/mp3",
	 *			url: "first.mp3"
	 *		}, {
	 *			mimeType: "application/ogg",
	 *			url: "first.ogg"
	 *		}],
	 *		"second-sound": [{
	 *			mimeType: "audio/mp3",
	 *			url: "second.mp3"
	 *		}, {
	 *			mimeType: "application/ogg",
	 *			url: "second.ogg"
	 *		}]
	 *	};
	 *	
	 *	// Implicit description of the sources, with just the URL specified
	 *	soundResources = {
	 *		"first-sound": ["first.mp3", "first.ogg"],
	 *		"second-sound": ["second.mp3", "second.ogg"]
	 *	};
	 *	
	 *	var xhr = new XMLHttpRequest();
	 *	xhr.addEventListener("load", function () {
	 *		var loader = new Canvace.Loader("media");
	 *		loader.loadAssets(JSON.parse(xhr.responseText), soundResources);
	 *	}, false);
	 *	xhr.open("GET", "stage.json", true);
	 *	xhr.responseType = "text";
	 *	xhr.send();
	 *
	 * @method loadAssets
	 * @param [imagesData] {Object} The JSON data output by the Canvace
	 * Development Environment.
	 * @param [soundsData] {Object} A map where the keys indicate the name of
	 * the sound to load, and the values are `Array`s of source descriptors,
	 * which are either `Object`s (each containing the string properties
	 * "mimeType" and "url") or `String`s (indicating the URL of the
	 * resource to load, in which case the loader tries to infer the MIME type
	 * from the file extension). Object and String source descriptors can be
	 * mixed.
	 * These objects represent the audio file sources that will be tried in
	 * order, falling back to the next one if the browser doesn't support
	 * playing the specified MIME type.
	 */
	this.loadAssets = function (imagesData, soundsData) {
		imagesLoaded = (typeof imagesData === "undefined" || typeof imagesData === "null");
		soundsLoaded = (typeof soundsData === "undefined" || typeof soundsData === "null");

		if (imagesLoaded && soundsLoaded) {
			loadFinished();
			return;
		}

		if (!imagesLoaded) {
			loadImages(imagesData);
		}

		if (!soundsLoaded) {
			loadSounds(soundsData);
		}
	};
};

Canvace.Loader.guessMimeType = function (source) {
	var mimeMap = [
		[/\.aac$/i, "audio/aac"],
		[/\.mp3$/i, "audio/mp3"],
		[/\.ogg$/i, "application/ogg"]
	];

	for (var i in mimeMap) {
		if (mimeMap[i][0].test(source)) {
			return mimeMap[i][1];
		}
	}

	throw "Couldn't guess the MIME type from the resource URL";
};

Canvace.Loader.getSourceInfo = function (source) {
	if (typeof source === "string") {
		return {
			url: source,
			mimeType: Canvace.Loader.guessMimeType(source)
		};
	}

	if (typeof source === "object") {
		if (source.hasOwnProperty("url") && source.hasOwnProperty("mimeType")) {
			return source;
		}
	}

	throw "Invalid source specified";
};

/**
 * Plays a sound represented by an audio asset previously loaded by the
 * loader. The audio asset is identified by the `name` argument, that must
 * correspond to a name passed to the `loadAssets` method.
 *
 * This method only _starts_ playing the sound, and immediately returns. It
 * works by simply calling the `play` method of the `Canvace.Audio.SourceNode`
 * interface.
 *
 * This method has no effect if the sound is already playing.
 *
 * The sound can optionally be looped: when `true` is specified to the
 * optional `loop` argument, the sound will play continuously.
 *
 * @method playSound
 * @param name {String} A name identifying the audio asset.
 * @param [loop] {Boolean} An optional boolean value that indicates whether
 * the sound must be looped. It defaults to `false` when not specified.
 * @return {Canvace.Audio.SourceNode} An object that can be used to play
 * the sound back if the specified name is known, `null` otherwise.
 */
Canvace.Loader.prototype.playSound = function (name, loop) {
	var sound = this.getSound(name);
	if (null !== sound) {
		sound.setLooping(!!loop);
		sound.play();
	}
	return sound;
};
Canvace.View = function (data, canvas) {
	var mat = data.matrix;
	var inv = (function () {
		var det = mat[0][0] * mat[1][1] * mat[2][2] +
			mat[0][1] * mat[1][2] * mat[2][0] +
			mat[0][2] * mat[1][0] * mat[2][1] -
			mat[0][2] * mat[1][1] * mat[2][0] -
			mat[0][1] * mat[1][0] * mat[2][2] -
			mat[0][0] * mat[1][2] * mat[2][1];
		return [
			[(mat[1][1] * mat[2][2] - mat[2][1] * mat[1][2]) / det,
				(mat[0][2] * mat[2][1] - mat[2][2] * mat[0][1]) / det,
				(mat[0][1] * mat[1][2] - mat[1][1] * mat[0][2]) / det],
			[(mat[1][2] * mat[2][0] - mat[2][2] * mat[1][0]) / det,
				(mat[0][0] * mat[2][2] - mat[2][0] * mat[0][2]) / det,
				(mat[0][2] * mat[1][0] - mat[1][2] * mat[0][0]) / det],
			[(mat[1][0] * mat[2][1] - mat[2][0] * mat[1][1]) / det,
				(mat[0][1] * mat[2][0] - mat[2][1] * mat[0][0]) / det,
				(mat[0][0] * mat[1][1] - mat[1][0] * mat[0][1]) / det]
		];
	})();

	var x0 = data.x0;
	var y0 = data.y0;
	var width = canvas.width;
	var height = canvas.height;

	/**
	 * Computes the projected `x`, `y` and `z` coordinates of an element by
	 * right-multiplying an `(i, j, k)` vector by the projection matrix.
	 *
	 * Note that the computed `x` and `y` coordinates do not correspond to the
	 * actual on-screen coordinates because they vary depending on the X and Y
	 * offsets of the specific element.
	 *
	 * This method only calculates a "generic" projection, but the
	 * `projectElement` is more useful in that it calculates the actual
	 * coordinates.
	 *
	 * The computed coordinates are returned as an array containing three
	 * elements, respectively X, Y and Z.
	 *
	 * @method project
	 * @param i {Number} The I coordinate to project.
	 * @param j {Number} The J coordinate to project.
	 * @param k {Number} The K coordinate to project.
	 * @return {Array} An array containing the calculated `x`, `y` and `z`,
	 * respectively.
	 */
	this.project = function (i, j, k) {
		return [
			mat[0][0] * i + mat[0][1] * j + mat[0][2] * k,
			mat[1][0] * i + mat[1][1] * j + mat[1][2] * k,
			Math.round(mat[2][0] * i + mat[2][1] * j + mat[2][2] * k)
		];
	};

	/**
	 * Computes the projected `x`, `y` and `z` coordinates of the specified
	 * element by right-multiplying an `(i, j, k)` vector by the projection
	 * matrix and adding the X and Y offsets of the element.
	 *
	 * This method does not take into account the viewport offset (`drag` calls
	 * will not affect the result of `projectElement`).
	 *
	 * The computed coordinates are returned as an array containing three
	 * elements, respectively X, Y and Z.
	 *
	 * @method projectElement
	 * @param element {Object} A tile or entity descriptor. This object must
	 * have the same layout as tile and entity descriptors documented in
	 * Canvace's Output Format Guide. You can specify tiles and entities you
	 * find in JSON data output by the Canvace Development Environment.
	 * @param i {Number} The I coordinate to project.
	 * @param j {Number} The J coordinate to project.
	 * @param k {Number} The K coordinate to project.
	 * @return {Array} An array containing the calculated `x`, `y` and `z`,
	 * respectively.
	 */
	this.projectElement = function (element, i, j, k) {
		return [
			Math.round(mat[0][0] * i + mat[0][1] * j + mat[0][2] * k + element.offset.x),
			Math.round(mat[1][0] * i + mat[1][1] * j + mat[1][2] * k + element.offset.y),
			Math.round(mat[2][0] * i + mat[2][1] * j + mat[2][2] * k)
		];
	};

	/**
	 * Inverts the specified `x` and `y` projected coordinates returning the
	 * corresponding original `(i, j, k)` coordinates assuming that the
	 * projected point is located at the specified `k` coordinate in the
	 * original 3D space. This means that the `k` value in the returned
	 * `(i, j, k)` vector corresponds to the specified `k` value.
	 *
	 * This method is useful for implementing picking algorithms.
	 *
	 * The computed `(i, j, k)` vector is returned as an array of three
	 * elements, the `i`, `j` and `k` values respectively.
	 *
	 * @method unproject
	 * @param x {Number} The projected X value.
	 * @param y {Number} The projected Y value.
	 * @param k {Number} The K coordinate where the projected point is assumed
	 * to be.
	 * @return {Array} An array containing three elements, the `i`, `j` and `k`
	 * values, respectively.
	 */
	this.unproject = function (x, y, k) {
		var z = (k + inv[2][0] * (x0 - x) + inv[2][1] * (y0 - y)) / inv[2][2];
		var i = inv[0][0] * (x - x0) + inv[0][1] * (y - y0) + inv[0][2] * z;
		var j = inv[1][0] * (x - x0) + inv[1][1] * (y - y0) + inv[1][2] * z;
		return [i, j, k];
	};

	/**
	 * Inverts the specified `x` and `y` projected coordinates returning the
	 * integer `(i, j, k)` coordinates of the cell where the projected point is
	 * located, assuming they are located at layer `k`. The specified `k` value
	 * is simply returned as is in the resulting `(i, j, k)` vector.
	 *
	 * The resulting vector is returned as an object containing three integer
	 * fields: `i`, `j` and `k`.
	 *
	 * The only difference between this method and `unproject` is that the
	 * former always returns integer values (resulting from rounding) while the
	 * latter may return real values.
	 *
	 * @method getCell
	 * @param x {Number} The projected point's X coordinate.
	 * @param y {Number} The projected point's Y coordinate.
	 * @param k {Number} The K coordinate in the original 3D space where the
	 * projected point is assumed to be located.
	 * @return {Object} an object containing three properties, `i`, `j` and `k`.
	 */
	this.getCell = function (x, y, k) {
		var z = (k - inv[2][0] * (x - x0) - inv[2][1] * (y - y0)) / inv[2][2];
		var i = Math.round(inv[0][0] * (x - x0) + inv[0][1] * (y - y0) + inv[0][2] * z);
		var j = Math.round(inv[1][0] * (x - x0) + inv[1][1] * (y - y0) + inv[1][2] * z);
		return {
			i: i,
			j: j,
			k: k
		};
	};

	/**
	 * Returns the viewport's origin as an object containing two properties, `x`
	 * and `y`.
	 *
	 * @method getOrigin
	 * @return {Object} The viewport's origin as an object containing two
	 * properties, `x` and `y`.
	 */
	this.getOrigin = function () {
		return {
			x: x0,
			y: y0
		};
	};

	/**
	 * Returns the viewport width.
	 *
	 * @method getWidth
	 * @return {Number} The viewport width.
	 */
	this.getWidth = function () {
		return width;
	};

	/**
	 * Returns the viewport height.
	 *
	 * @method getHeight
	 * @return {Number} The viewport height.
	 */
	this.getHeight = function () {
		return height;
	};

	var dragHandlers = new Canvace.MultiSet();

	/**
	 * Drags the viewport by the specified `dx` and `dy` offsets.
	 *
	 * @method drag
	 * @param dx {Number} The drag offset along the X axis.
	 * @param dy {Number} The drag offset along the Y axis.
	 */
	this.drag = function (dx, dy) {
		x0 += dx;
		y0 += dy;
		dragHandlers.fastForEach(function (handler) {
			handler(x0, y0);
		});
	};

	/**
	 * Drags the viewport so that the origin be located at the specified `x` and
	 * `y` coordinates.
	 *
	 * @method dragTo
	 * @param x {Number} The new origin's X coordinate.
	 * @param y {Number} The new origin's Y coordinate.
	 */
	this.dragTo = function (x, y) {
		x0 = x;
		y0 = y;
		dragHandlers.fastForEach(function (handler) {
			handler(x0, y0);
		});
	};

	/**
	 * Register an event handler invoked every time the viewport's origin
	 * changes. This happens because of `drag` and `dragTo` calls.
	 *
	 * Multiple handlers may be registered. A handler may be registered more
	 * than once, in which case it gets called as many times as it was
	 * registered.
	 *
	 * This method returns a function that unregisters the registered handler.
	 * If a handler was registered more than once, the returned function only
	 * removes its own registration, while other instances of the handler stay
	 * registered.
	 *
	 * @method onDrag
	 * @param handler {Function} A function that is invoked every time the
	 * viewport is dragged. The function receives two arguments, `x0` and `y0`,
	 * representing the new coordinates of the viewport's origin.
	 * @return {Function} A function that unregisters the handler. The returned
	 * function does not receive any arguments.
	 */
	this.onDrag = function (handler) {
		return dragHandlers.add(handler);
	};

	/**
	 * Manages the synchronization of the view on some specified entity instance
	 * of a stage, making the view always point at that entity.
	 *
	 * This class can be instantiated for a `View` using its
	 * `createSynchronizer` method. For more information on how it works, see
	 * the `createSynchronizer` method's reference.
	 *
	 * @class Canvace.View.Synchronizer
	 */
	function Synchronizer(targetAreaWidth, targetAreaHeight, delay) {
		/**
		 * "Ticks" the synchronizer, which tries to move the view according to
		 * the delay parameter so that the target entity fits into the target
		 * area.
		 *
		 * This method is typically called from within the `tick` callback
		 * function of a `RenderLoop`.
		 *
		 * @method tick
		 * @param target {Canvace.Stage.Instance} The entity instance to target.
		 */
		this.tick = function (target) {
			var x1 = x0;
			var y1 = y0;
			var frameWidth = (width - targetAreaWidth) / 2;
			var frameHeight = (height - targetAreaHeight) / 2;
			var targetRectangle = target.getProjectedRectangle();
			if (x0 + targetRectangle.x + targetRectangle.width > width - frameWidth) {
				x1 = width - targetRectangle.x - targetRectangle.width - frameWidth;
			}
			if (x0 + targetRectangle.x < frameWidth) {
				x1 = frameWidth - targetRectangle.x;
			}
			if (y0 + targetRectangle.y + targetRectangle.height > height - frameHeight) {
				y1 = height - targetRectangle.y - targetRectangle.height - frameHeight;
			}
			if (y0 + targetRectangle.y < frameHeight) {
				y1 = frameHeight - targetRectangle.y;
			}
			x0 = x0 + (x1 - x0) * (1 - delay);
			y0 = y0 + (y1 - y0) * (1 - delay);
			dragHandlers.fastForEach(function (handler) {
				handler(x0, y0);
			});
		};
	}

	/**
	 * Creates a `Synchronizer` object responsible for synchronizing the view so
	 * that it is always pointed to a specified entity.
	 *
	 * A synchronizer is defined by a "target area" and a delay parameter. The
	 * target area is a rectangular area centered in the viewport where the
	 * synchronizer constantly tries to fit the target entity by moving the
	 * view.
	 *
	 * The target entity may sometimes reside out of the target area because of
	 * the delay parameter, which indicates a delay in the movement of the view
	 * toward a fitting position. The delay parameter is a floating point number
	 * in the range `[0, 1)` where 0 indicates no delay (the target entity
	 * always resides withint the target area) and 1 indicates maximum delay
	 * (the view never moves and never reaches a fitting position).
	 *
	 * @for Canvace.View
	 * @method createSynchronizer
	 * @param targetAreaWidth {Number} The width of the target area.
	 * @param targetAreaHeight {Number} The height of the target area.
	 * @param delay {Number} The delay parameter.
	 * @return {Canvace.View.Synchronizer} A `Synchronizer` object responsible
	 * for synchronizing this `View`.
	 */
	this.createSynchronizer = function (targetAreaWidth, targetAreaHeight, delay) {
		return new Synchronizer(targetAreaWidth, targetAreaHeight, delay);
	};
};

Canvace.FrameTable = function (data) {
	var tileSet = {};
	var entitySet = {};

	var table = {};
	var nextId = 0;

	var synchronizers = [];

	function gcd(a, b) {
		var t;
		while (b) {
			t = b;
			b = a % b;
			a = t;
		}
		return a;
	}

	function Animation(frames) {
		var makeFrameIdGetter = function (frame) {
			return function () {
				return frame.id;
			};
		};

		if (frames.length < 2) {
			return makeFrameIdGetter(frames[0]);
		} else {
			var partialUnit = 0;
			var fullDuration = 0;
			for (var i in frames) {
				if ('duration' in frames[i]) {
					partialUnit = gcd(partialUnit, frames[i].duration);
					fullDuration += frames[i].duration;
				} else {
					return makeFrameIdGetter(frames[i]);
				}
			}

			var table = {};
			var unit = 0;

			var synchronize = function (period) {
				table = {};
				unit = gcd(partialUnit, period);
				var frameIndex = 0;
				var frameTime = 0;
				for (var time = 0; time < fullDuration; time += unit, frameTime += unit) {
					if (frameTime > frames[frameIndex].duration) {
						frameIndex++;
						frameTime = 0;
					}
					table[time] = frames[frameIndex].id;
				}
			};

			synchronize(partialUnit);
			synchronizers.push(synchronize);

			return function (timestamp) {
				return table[Math.floor((timestamp % fullDuration) / unit) * unit];
			};
		}
	}

	this.registerTile = function (id) {
		if (data.tiles.hasOwnProperty(id)) {
			table[tileSet[id] = nextId++] = new Animation(data.tiles[id].frames);
		} else {
			throw 'invalid tile ID: ' + id;
		}
	};

	this.registerEntity = function (id) {
		if (data.entities.hasOwnProperty(id)) {
			table[entitySet[id] = nextId++] = new Animation(data.entities[id].frames);
		} else {
			throw 'invalid entity ID: ' + id;
		}
	};

	this.getTileAnimation = function (tileId) {
		return table[tileSet[tileId]];
	};

	this.getEntityAnimation = function (entityId) {
		return table[entitySet[entityId]];
	};

	this.synchronize = function (period) {
		for (var i in synchronizers) {
			synchronizers[i](period);
		}
	};
};

Canvace.Buckets = (function () {
	var widthFactor = 1;
	var heightFactor = 1;

	var $this = function (view, data) {
		var actualWidth = view.getWidth();
		var actualHeight = view.getHeight();
		var width = Math.round(actualWidth * widthFactor);
		var height = Math.round(actualHeight * heightFactor);
		var frameTable = new Canvace.FrameTable(data);

		(function () {
			var id;
			for (id in data.tiles) {
				frameTable.registerTile(id);
			}
			for (id in data.entities) {
				frameTable.registerEntity(id);
			}
		})();

		function Bucket() {
			var sections = {};
			var minS = 0, maxS = 0;
			this.add = function (p, width, height, getFrame) {
				minS = Math.min(minS, p[2]);
				maxS = Math.max(maxS, p[2]);
				if (!sections[p[2]]) {
					sections[p[2]] = new Canvace.MultiSet();
				}
				return sections[p[2]].add({
					p: p,
					width: width,
					height: height,
					getFrame: getFrame
				});
			};
			this.forEach = function (action) {
				for (var s = minS; s <= maxS; s++) {
					if (sections.hasOwnProperty(s)) {
						sections[s].fastForEach(action);
					}
				}
			};
		}

		var buckets = {};

		function MockElement() {
			this.updatePosition = function () {};
			this.remove = function () {};
			this.replace = function () {};
		}

		/**
		 * Represents an entity.
		 *
		 * This class cannot be instantiated directly, instances are returned by
		 * the `Buckets.addEntity` method.
		 *
		 * @class Canvace.Buckets.Entity
		 */
		function Element(element, getAnimation, i, j, k) {
			if (!element.frames.length) {
				return new MockElement();
			}

			var p = view.projectElement(element, i, j, k);
			var bi = Math.floor(p[1] / height);
			var bj = Math.floor(p[0] / width);

			var animation = getAnimation();

			var removers = [];
			var removed = false;

			function addToBucket(i, j) {
				var key = i + ' ' + j;
				if (!buckets.hasOwnProperty(key)) {
					buckets[key] = new Bucket();
				}
				removers.push(buckets[key].add(p, element.width, element.height, animation));
			}

			function addToBuckets() {
				addToBucket(bi - 1, bj - 1);
				addToBucket(bi - 1, bj);
				addToBucket(bi, bj - 1);
				addToBucket(bi, bj);
				var bi1 = Math.floor((p[1] + element.height) / height);
				var bj1 = Math.floor((p[0] + element.width) / width);
				if (bi1 > bi) {
					addToBucket(bi + 1, bj - 1);
					addToBucket(bi + 1, bj);
				}
				if (bj1 > bj) {
					addToBucket(bi - 1, bj + 1);
					addToBucket(bi, bj + 1);
				}
				if ((bi1 > bi) && (bj1 > bj)) {
					addToBucket(bi + 1, bj + 1);
				}
			}

			addToBuckets();

			function remove() {
				for (var index in removers) {
					removers[index]();
				}
				removers = [];
				removed = true;
				return true;
			}

			/**
			 * Returns the entity's projected position, which is its `(i, j, k)`
			 * position left-multiplied by the projection matrix.
			 *
			 * The position is returned as an object containing three fields,
			 * `x`, `y` and `z`, containing the `i`, `j` and `k` projected
			 * coordinates, respectively.
			 *
			 * @method getProjectedPosition
			 * @return {Object} The projected position as an object containing
			 * three `x`, `y` and `z` fields.
			 */
			this.getProjectedPosition = function () {
				return {
					x: p[0] - element.offset.x,
					y: p[1] - element.offset.y,
					z: p[2]
				};
			};

			/**
			 * Returns the 2D rectangular area corresponding to the entity's
			 * bounds.
			 *
			 * The rectangle is returned as an object containing four fields:
			 * the `x` and `y` coordinates of the origin and the `width` and
			 * `height`.
			 *
			 * The coordinates of the origin are calculated by left-multiplying
			 * the `(i, j, k)` position vector of the entity by the projection
			 * matrix and adding the entity's offset. The width and height are
			 * simply copied from the entity descriptor.
			 *
			 * @method getProjectedRectangle
			 * @return {Object} An object that describes the projected rectangle
			 * and contains four fields: `x`, `y`, `width` and `height`.
			 */
			this.getProjectedRectangle = function () {
				return {
					x: p[0],
					y: p[1],
					z: p[2],
					width: element.width,
					height: element.height
				};
			};

			/**
			 * Updates the entity's position and possibly some internal data
			 * structures so that the entity is enumerated correctly by the
			 * `forEachElement` method after it is repositioned.
			 *
			 * The specified `i`, `j` and `k` values may be real numbers.
			 *
			 * @method updatePosition
			 * @param i {Number} The new I coordinate.
			 * @param j {Number} The new J coordinate.
			 * @param k {Number} The new K coordinate.
			 */
			this.updatePosition = function (i1, j1, k1) {
				if (!removed) {
					var p1 = view.projectElement(element, i = i1, j = j1, k = k1);
					var bi1 = Math.floor(p[1] / height);
					var bj1 = Math.floor(p[0] / width);
					if ((p1[2] !== p[2]) || (bi1 !== bi) || (bj1 !== bj)) {
						remove();
						removed = false;
						p[0] = p1[0], p[1] = p1[1], p[2] = p1[2];
						bi = bi1, bj = bj1;
						addToBuckets();
					} else {
						p[0] = p1[0], p[1] = p1[1], p[2] = p1[2];
					}
				}
			};

			/**
			 * Removes the entity so that it is not enumerated by the
			 * `Buckets.forEachElement` method any more.
			 *
			 * This method is idempotent: it does not have any effects when it is
			 * called again after the first time.
			 *
			 * @method remove
			 * @return {Boolean} `true`.
			 */
			this.remove = remove;

			/**
			 * Replaces the entity with another one identified by the specified
			 * ID. This entity is removed as if the `remove` method was called,
			 * and this `Entity` object becomes useless and should be discarded.
			 *
			 * @method replace
			 * @param id {Number} The new entity's ID.
			 * @return {Canvace.Buckets.Entity} A new `Entity` object
			 * representing the new entity.
			 */
			this.replace = function (id) {
				if (!removed) {
					if (!(id in data.entities)) {
						throw {
							message: 'invalid entity ID',
							id: id
						};
					}

					remove();
					var entity = data.entities[id];

					return new Element(entity, function () {
						return frameTable.getEntityAnimation(id);
					}, i, j, k);
				}
			};
		}

		var eraser = {};

		function addTile(id, i, j, k) {
			if (!(id in data.tiles)) {
				throw {
					message: 'invalid tile ID',
					id: id
				};
			}

			var tile = data.tiles[id];

			var remover = new Element(tile, function () {
				return frameTable.getTileAnimation(id);
			}, i, j, k).remove;

			if (tile.mutable) {
				if (!eraser[k]) {
					eraser[k] = {};
				}
				if (!eraser[k][i]) {
					eraser[k][i] = {};
				}
				var removed = false;
				return eraser[k][i][j] = function () {
					remover();
					if (removed) {
						return false;
					} else {
						delete eraser[k][i][j];
						removed = true;
						return true;
					}
				};
			} else {
				return remover;
			}
		}

		/**
		 * Adds a tile to the buckets and returns a function that removes it.
		 *
		 * If the tile was configured as mutable in the Canvace Development
		 * Environment it can also be removed using the `removeTile` method or
		 * replaced using the `replaceTile` method.
		 *
		 * The returned function does not receive any arguments and always
		 * returns `true`, and can remove the tile even if it was not configured
		 * as mutable.
		 *
		 * @method addTile
		 * @for Canvace.Buckets
		 * @param id {Number} The tile's ID.
		 * @param i {Number} The integer I position where the tile is located.
		 * @param j {Number} The integer J position where the tile is located.
		 * @param k {Number} The integer K position where the tile is located.
		 * @return {Function} A function that removes the inserted tile. The
		 * function does not receive any arguments, always returns `true` and is
		 * idempotent: it does not have any effets when called again after the
		 * first time.
		 */
		this.addTile = addTile;

		/**
		 * Adds an entity to the buckets. The specified I, J and K coordinates
		 * can be real values.
		 *
		 * @method addEntity
		 * @param id {Number} The entity's ID.
		 * @param i {Number} The I coordinate where the entity is located.
		 * @param j {Number} The J coordinate where the entity is located.
		 * @param k {Number} The K coordinate where the entity is located.
		 * @return {Canvace.Buckets.Entity} An `Entity` object representing the
		 * inserted entity.
		 */
		this.addEntity = function (id, i, j, k) {
			if (!(id in data.entities)) {
				throw {
					message: 'invalid entity ID',
					id: id
				};
			}

			var entity = data.entities[id];

			return new Element(entity, function () {
				return frameTable.getEntityAnimation(id);
			}, i, j, k);
		};

		/**
		 * Removes the mutable tile located at the (integer) coordinates
		 * `(i, j, k)`.
		 *
		 * Note that a tile is not removed by this method if it is not mutable, even
		 * though it is located at the specified coordinates.
		 *
		 * @method removeTile
		 * @param i {Number} The tile's I coordinate.
		 * @param j {Number} The tile's J coordinate.
		 * @param k {Number} The tile's K coordinate.
		 * @return {Boolean} `true` on success, `false` on failure.
		 */
		this.removeTile = function (i, j, k) {
			return eraser[k] && eraser[k][i] && eraser[k][i][j] && eraser[k][i][j]() || false;
		};

		/**
		 * Replaces the mutable tile located at the specified `i`, `j` and `k`
		 * integer coordinates with another tile.
		 *
		 * This method has no effect if no mutable tile is found at the
		 * specified coordinates; this includes both the following cases: no
		 * mutable tile found and no tile at all.
		 *
		 * When a mutable tile is found and successfully removed, the specified
		 * tile is inserted at its location and a function to remove it is
		 * returned (similarly to the `addTile` method).
		 *
		 * @method replaceTile
		 * @param i {Number} The I coordinate where the tile to replace is
		 * located.
		 * @param j {Number} The J coordinate where the tile to replace is
		 * located.
		 * @param k {Number} The K coordinate where the tile to replace is
		 * located.
		 * @param newTileId {Number} The new tile's ID.
		 * @return {Function} A function that removes the inserted tile, or
		 * `undefined` if a mutable tile could not be found at the specified
		 * position.
		 *
		 * The returned function does not receive any arguments, always returns
		 * `true` and is idempotent: it does not have any effets when called
		 * again after the first time.
		 */
		this.replaceTile = function (i, j, k, newTileId) {
			if (eraser[k] && eraser[k][i] && eraser[k][i][j] && eraser[k][i][j]()) {
				return addTile(newTileId, i, j, k);
			}
		};

		/**
		 * TODO
		 *
		 * @method synchronize
		 * @param period {Number} TODO
		 */
		this.synchronize = frameTable.synchronize;

		/**
		 * Invokes the given callback function for each element within the viewport.
		 *
		 * The specified `action` callback function receives three arguments, `x`,
		 * `y` and `id`, indicating the element's projected X coordinate, projected
		 * Y coordinate and image ID, respectively.
		 *
		 * @method forEachElement
		 * @param timestamp {Number} A timestamp expressed in milliseconds. This
		 * is necessary in order to return the correct image IDs for animated
		 * elements.
		 * @param action {Function} A callback function to invoke for each
		 * enumerated element.
		 */
		this.forEachElement = function (timestamp, action) {
			var origin = view.getOrigin();
			var i = Math.floor(-origin.y / height);
			var j = Math.floor(-origin.x / width);
			var key = i + ' ' + j;
			if (buckets.hasOwnProperty(key)) {
				buckets[key].forEach(function (element) {
					if ((element.p[0] < -origin.x + actualWidth) &&
						(element.p[1] < -origin.y + actualHeight) &&
						(element.p[0] + element.width >= -origin.x) &&
						(element.p[1] + element.height >= -origin.y))
					{
						action(element.p[0], element.p[1], element.getFrame(timestamp));
					}
				});
			}
		};
	};

	/**
	 * Tweaking the size factor parameters allows to trade between speed and
	 * memory occupation of the game.
	 *
	 * The default and minimum value for both parameters is 1. Specifying higher
	 * values causes a lower memory fingerprint and higher execution times of
	 * the `forEachElement` method.
	 *
	 * @method setBucketSizeFactors
	 * @static
	 * @param widthFactorValue {Number} The bucket width factor parameter. The
	 * default and minimum value is 1.
	 * @param heightFactorValue {Number} The bucket height factor parameter. The
	 * default and minimum value is 1.
	 */
	$this.setBucketSizeFactors = function (widthFactorValue, heightFactorValue) {
		if (widthFactorValue < 1) {
			throw 'illegal width factor: ' + widthFactorValue;
		}
		if (heightFactorValue < 1) {
			throw 'illegal height factor: ' + heightFactorValue;
		}
		widthFactor = widthFactorValue;
		heightFactor = heightFactorValue;
	};

	return $this;
})();

Canvace.Renderer = function (canvas, loader, view, buckets, preProcess, postProcess) {
	var width = canvas.width;
	var height = canvas.height;
	var context = canvas.getContext('2d');

	/**
	 * Returns the `View` object used by this renderer. It is the same `view`
	 * parameter passed to the constructor.
	 *
	 * @method getView
	 * @return {Canvace.View} The `View` object used by this renderer.
	 */
	this.getView = function () {
		return view;
	};

	/**
	 * Returns the `Buckets` object used by this renderer. It is the same
	 * `buckets` parameter passed to the constructor.
	 *
	 * @method getBuckets
	 * @return {Canvace.Buckets} The `Buckets` object used by this renderer.
	 */
	this.getBuckets = function () {
		return buckets;
	};

	/**
	 * Synchronizes the underlying `Buckets` object on the specified period. The
	 * call is simply forwarded to its `synchronize` method.
	 *
	 * @method synchronize
	 * @param period {Number} The period value the buckets must be synchronized
	 * to.
	 */
	this.synchronize = buckets.synchronize;

	/**
	 * Returns the context object of the specified HTML5 canvas. This is the
	 * same context used by the renderer.
	 *
	 * @method getContext
	 * @return {CanvasRenderingContext2D} The HTML5 canvas 2D context.
	 */
	this.getContext = function () {
		return context;
	};

	/**
	 * Renders the stage to the canvas.
	 *
	 * @method render
	 * @param counter {Number} A timestamp expressed in milliseconds. This is
	 * necessary in order to render the correct frame for animated elements.
	 */
	this.render = function (counter) {
		var origin = view.getOrigin();
		context.setTransform(1, 0, 0, 1, origin.x, origin.y);
		context.clearRect(-origin.x, -origin.y, width, height);

		if (typeof preProcess === "function") {
			preProcess(context);
		}

		buckets.forEachElement(counter, function (x, y, id) {
			context.drawImage(loader.getImage(id), x, y);
		});

		if (typeof postProcess === "function") {
			postProcess(context);
		}
	};
};

Canvace.TileMap = function (data, buckets) {
	var map = data.map;

	/**
	 * This class wraps a tile descriptor.
	 *
	 * @class Canvace.TileMap.Tile
	 */
	function Tile(id) {
		var tile = data.tiles[id];

		/**
		 * Indicates whether this descriptor describes a walkable tile or not.
		 *
		 * @method isWalkable
		 * @return {Boolean} `true` if this tile is walkable, `false` otherwise.
		 */
		this.isWalkable = function () {
			return tile.walkable;
		};

		/**
		 * Returns the tile's custom properties as set in the Canvace
		 * Development Environment.
		 *
		 * The original `properties` object is returned, so that modifications
		 * actually affect the tile's properties.
		 *
		 * @method getProperties
		 * @return {Object} The tile's `properties` field containing the custom
		 * properties the user set in the Canvace Development Environment.
		 */
		this.getProperties = function () {
			return tile.properties;
		};
	}

	/**
	 * Enumerates the numbers of the layers currently in the tile map.
	 *
	 * For each enumerated layer the `action` callback function is called and
	 * receives a numeric argument, the layer number.
	 *
	 * The enumeration is interrupted if the callback function returns `false`;
	 * any other return value is ignored.
	 *
	 * In case the enumeration is interrupted, `true` is returned by the
	 * `forEachLayer` method, otherwise `false` is returned.
	 *
	 * @method forEachLayer
	 * @for Canvace.TileMap
	 * @param action {Function} A user-defined callback function that gets
	 * called for each enumerated layer.
	 *
	 * The function receives one argument, the layer number.
	 * @return {Boolean} `true` if the `action` callback function returned
	 * `false`, `false` otherwise.
	 */
	this.forEachLayer = function (action) {
		for (var k in map) {
			if (action(parseInt(k, 10)) === false) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Enumerates the tiles currently in the map.
	 *
	 * For each enumerated tile the `action` callback function is called and
	 * receives three integer arguments, the `i`, `j` and `k` coordinates of the
	 * tile. The tile itself can then be retrieved as a `TileMap.Tile` object by
	 * calling the `TileMap.getAt` method.
	 *
	 * The enumeration is interrupted if the callback function returns `false`;
	 * any other return value is ignored.
	 *
	 * In case the enumeration is interrupted, `true` is returned by the
	 * `forEachTile` method, otherwise `false` is returned.
	 *
	 * @method forEachTile
	 * @param action {Function} A user-defined callback function that gets
	 * called for each enumerated tile.
	 *
	 * The function receives three integer arguments: the `i`, `j` and `k`
	 * coordinates of the tile, respectively.
	 * @return {Boolean} `true` if the `action` callback function returned
	 * `false`, `false` otherwise.
	 */
	this.forEachTile = function (action) {
		for (var k in map) {
			k = parseInt(k, 10);
			for (var i in map[k]) {
				i = parseInt(i, 10);
				for (var j in map[k][i]) {
					j = parseInt(j, 10);
					if (action(i, j, k) === false) {
						return true;
					}
				}
			}
		}
		return false;
	};

	/**
	 * Enumerates the tiles in the specified layer of the map.
	 *
	 * For each enumerated tile the `action` callback function is called and
	 * receives two integer arguments, the `i` and `j` coordinates of the tile.
	 * The tile itself can then be retrieved as a `TileMap.Tile` object by
	 * calling the `TileMap.getAt` method.
	 *
	 * An exception is thrown if the `k` argument does not represent a valid
	 * layer of the map. This includes empty layers: if a tile map contains
	 * tiles at layers `0` and `2` but none at layer `1` you cannot specify `1`
	 * for the `k` argument because the map does not contain the layer `1`.
	 *
	 * The enumeration is interrupted if the callback function returns `false`;
	 * any other return value is ignored.
	 *
	 * In case the enumeration is interrupted, `true` is returned by the
	 * `forEachTileInLayer` method, otherwise `false` is returned.
	 *
	 * @method forEachTileInLayer
	 * @param k {Number} The layer number.
	 * @param action {Function} A user-defined callback function that gets
	 * called for each enumerated tile.
	 *
	 * The function receives two integer arguments: the `i` and `j` coordinates
	 * of the tile, respectively.
	 * @return {Boolean} `true` if the `action` callback function returned
	 * `false`, `false` otherwise.
	 */
	this.forEachTileInLayer = function (k, action) {
		if (!(k in map)) {
			throw 'invalid layer number: ' + k;
		}
		for (var i in map[k]) {
			i = parseInt(i, 10);
			for (var j in map[k][i]) {
				j = parseInt(j, 10);
				if (action(i, j) === false) {
					return true;
				}
			}
		}
		return false;
	};

	/**
	 * Returns a `Tile` object that describes the tile identified by the
	 * specified ID.
	 *
	 * This method throws an exception if the ID is not valid, i.e. it is not
	 * present in the JSON data output by the Canvace Development Environment.
	 *
	 * @method getTile
	 * @param id {Number} A tile ID.
	 * @return {Canvace.TileMap.Tile} A `Tile` object describing the specified
	 * tile.
	 */
	this.getTile = function (id) {
		if (id in data.tiles) {
			return new Tile(id);
		} else {
			throw 'invalid tile id: ' + id;
		}
	};

	/**
	 * Returns the ID of the tile located at the specified `(i, j, k)` position
	 * of the map, or `false` if no tile is located at that position.
	 *
	 * @method getAt
	 * @param i {Number} An integer I coordinate.
	 * @param j {Number} An integer J coordinate.
	 * @param k {Number} An integer K coordinate.
	 * @return {Number} The requested tile ID, or `false` if no tile is found.
	 */
	this.getAt = function (i, j, k) {
		return map[k] && map[k][i] && map[k][i][j] || false;
	};

	/**
	 * Puts the specified tile in the specified position of the map. If a
	 * mutable tile is already present in that position, it is first removed. If
	 * a non-mutable tile is present, the operation fails.
	 *
	 * A boolean value is returned indicating whether the operation succeeded or
	 * not.
	 *
	 * @method putAt
	 * @param i {Number} The I coordinate of the map cell.
	 * @param j {Number} The J coordinate of the map cell.
	 * @param k {Number} The K coordinate of the map cell.
	 * @param id {Number} The new tile's ID.
	 * @return {Boolean} `true` if the specified tile was successfully placed at
	 * the specified position, `false` if that position is already occupied by a
	 * non-mutable tile.
	 */
	this.putAt = function (i, j, k, id) {
		if (!(id in data.tiles)) {
			throw {
				message: 'invalid tile ID',
				id: id
			};
		}
		if ((k in map) && (i in map[k]) && (j in map[k][i])) {
			if (buckets.replaceTile(i, j, k, id)) {
				map[k][i][j] = id;
			} else {
				return false;
			}
		} else {
			if (!(k in map)) {
				map = {};
			}
			if (!(i in map[k])) {
				map[k] = {};
			}
			map[k][i][j] = id;
			buckets.addTile(id, i, j, k);
			return true;
		}
	};

	/**
	 * Constructs an object that satisfies the `Astar.Node` requirements and
	 * represents a tile of the map as a node of a graph. The returned object
	 * allows to traverse a graph where each node represents a walkable tile and
	 * each edge allows to walk from a tile to another adjacent tile.
	 *
	 * The returned graph is characterized by a _target node_ and each node also
	 * provides a heuristic estimate of the distance between the target node and
	 * itself. This makes the graph usable with the `Astar` class.
	 *
	 * The target node is the tile identified by the coordinates `i1`, `j1` and
	 * `k`.
	 *
	 * @method getGraphNode
	 * @param i {Number} The I coordinate of the requested node.
	 * @param j {Number} The J coordinate of the requested node.
	 * @param k {Number} The number of the layer containing both the requested
	 * and the target node.
	 * @param i1 {Number} The I coordinate of the target node.
	 * @param j1 {Number} The J coordinate of the target node.
	 * @return {Canvace.Astar.Node} A node object that satisfies the
	 * `Astar.Node` requirements and can be passed to the `Astar.findPath`
	 * method.
	 */
	this.getGraphNode = function (i, j, k, i1, j1) {
		return (function makeNode(i, j) {
			function bind(i, j) {
				return function () {
					return makeNode(i, j);
				};
			}
			var di = Math.abs(i1 - i);
			var dj = Math.abs(j1 - j);
			var node = {
				id: i + ' ' + j + ' ' + k,
				heuristic: Math.sqrt(Math.pow(Math.min(di, dj), 2) * 2) +
					Math.max(di, dj) - Math.min(di, dj),
				neighbors: {},
				distance: function (index) {
					if (parseInt(index, 10) % 2) {
						return 1;
					} else {
						return Math.sqrt(2);
					}
				}
			};
			(function () {
				function walkable(i, j) {
					return (i in map[k]) && (j in map[k][i]) &&
						data.tiles[map[k][i][j]].walkable;
				}
				for (var index = 0; index < 9; index++) {
					var i1 = i + [-1, -1, -1, 0, 0, 0, 1, 1, 1][index];
					var j1 = j + [-1, 0, 1, -1, 0, 1, -1, 0, 1][index];
					if ((i1 !== i) && (j1 !== j) && walkable(i1, j1)) {
						if ((index % 2) || walkable(i, j1) && walkable(i1, j)) {
							node.neighbors[index] = bind(i1, j1);
						}
					}
				}
			})();
			return node;
		})(i, j);
	};

	/**
	 * Detects collisions between a rectangular area and non-walkable tiles of
	 * a specified map layer.
	 *
	 * A vector is returned indicating two I and J values that must be added to
	 * the coordinates of the rectangular area in order to resume a regular
	 * configuration where the area does not collide with the tiles.
	 *
	 * In case there is not any collision, the returned vector is `(0, 0)`.
	 *
	 * The rectangular area is specified by the `i`, `j`, `di` and `dj`
	 * arguments.
	 *
	 * The implementation of this method assumes the rectangular area represents
	 * a moving entity (though not necessarily a Canvace entity) which is
	 * characterized by its own velocity and acceleration vectors; these vectors
	 * are used in the collision algorithm in that it assumes the moving entity
	 * cannot have compenetrated a tile along the I or J axis more than a
	 * certain amount that is computed using the velocity and acceleration
	 * vectors. This is necessary in order to obtain a functional physics
	 * algorithm.
	 *
	 * If the rectangular area actually is the bounding box of a Canvace entity,
	 * you can specify the I and J components of its actual velocity and
	 * acceleration vectors to the `vi`, `vj`, `ai` and `aj` arguments. Use the
	 * `getAcceleration` method of the `Stage.Instance` class to get the
	 * acceleration vector; the velocity vector can be retrieved by adding the
	 * two vectors returned by the `getVelocity` and `getUniformVelocity` of the
	 * `Stage.Instance` class. This is actually what the `testTileCollision`
	 * method of the `Stage.Instance` class does.
	 *
	 * This method can be used to implement in-layer, bounding box based, entity
	 * vs. tiles collisions. If the rectangular area represents the bounding box
	 * of an entity, its origin's `i` and `j` coordinates can be obtained using
	 * the `Stage.Instance.getPosition` method, while the `di` and `dj` span
	 * values are usually constant and must be arbitrarily determined by the
	 * developer.
	 *
	 * `rectangleCollision` method is typically invoked for one or more entities
	 * or other rectangular areas each time a stage is ticked. To compute the
	 * maximum amount a rectangle can overlap one or more tiles along the I and
	 * J axes, the `rectangleCollision` algorithm also needs to know the time
	 * span (in milliseconds) between the current timestamp and the last time it
	 * was called.
	 *
	 * @method rectangleCollision
	 * @param k {Number} The number of the layer containing the tiles against
	 * which the collision must be tested.
	 * @param i {Number} The I coordinate of the origin of the rectangular area.
	 * This may be a real number.
	 * @param j {Number} The J coordinate of the origin of the rectangular area.
	 * This may be a real number.
	 * @param di {Number} The span of the rectangular area along the I axis.
	 * This may be a real number.
	 * @param dj {Number} The span of the rectangular area along the J axis.
	 * This may be a real number.
	 * @param vi {Number} The I component of the velocity vector. This may be a
	 * real number.
	 * @param vj {Number} The J component of the velocity vector. This may be a
	 * real number.
	 * @param ai {Number} The I component of the acceleration vector. This may
	 * be a real number.
	 * @param aj {Number} The J component of the acceleration vector. This may
	 * be a real number.
	 * @param dt {Number} The time span, in milliseconds, between the current
	 * time and the last time this method was called for the same entity or
	 * rectangular area.
	 *
	 * You can specify 0 if the method is being invoked for the first time, but
	 * it will assume that there are no collisions.
	 * @param [collides] {Function} An optional user-defined callback function
	 * that is invoked by the `rectangleCollision` method for every tile that
	 * collides with the specified rectangle.
	 *
	 * The function receives two arguments, the tile's walkable flag and its
	 * properties, and must return a boolean value indicating whether the tile
	 * must be taken into account as a colliding tile. If the function returns
	 * `false` the tile is _not_ taken into account.
	 * @return {Object} An object containing two number fields, `i` and `j`,
	 * specifying the I and J components of the computed vector.
	 */
	this.rectangleCollision = function (k, i, j, di, dj, vi, vj, ai, aj, dt, collides) {
		var viu = 0;
		var vio = 0;
		var vju = 0;
		var vjo = 0;

		var map = data.map;
		if (k in data.map) {
			var tiles = data.tiles;

			var solidTileAt = (function () {
				if (typeof collides !== 'function') {
					return function (i, j) {
						return (i in map[k]) && (j in map[k][i]) && !tiles[map[k][i][j]].walkable;
					};
				} else {
					return function (i, j) {
						var tile = tiles[map[k][i][j]];
						return (i in map[k]) && (j in map[k][i]) && collides(tile.walkable, tile.properties);
					};
				}
			})();

			var i0 = Math.floor(i);
			var j0 = Math.floor(j);
			var i1 = Math.ceil(i + di) - 1;
			var j1 = Math.ceil(j + dj) - 1;

			for (var j2 = j0; j2 <= j1; j2++) {
				if (solidTileAt(i0, j2)) {
					if ((i0 === i1) || !solidTileAt(i0 + 1, j2)) {
						viu = i0 + 1 - i;
					}
				}
				if (solidTileAt(i1, j2)) {
					if ((i0 === i1) || !solidTileAt(i1 - 1, j2)) {
						vio = i1 - i - di;
					}
				}
			}

			for (var i2 = i0; i2 <= i1; i2++) {
				if (solidTileAt(i2, j0)) {
					if ((j0 === j1) || !solidTileAt(i2, j0 + 1)) {
						vju = j0 + 1 - j;
					}
				}
				if (solidTileAt(i2, j1)) {
					if ((j0 === j1) || !solidTileAt(i2, j1 - 1)) {
						vjo = j1 - j - dj;
					}
				}
			}
		}

		var v = {};

		if (viu && vio) {
			v.i = 0;
		} else if (viu) {
			v.i = viu;
		} else {
			v.i = vio;
		}
		if (vju && vjo) {
			v.j = 0;
		} else if (vju) {
			v.j = vju;
		} else {
			v.j = vjo;
		}

		/*
		var dt2 = dt * dt * 0.5;
		if (Math.abs(v.i) > Math.abs(vi * dt + ai * dt2) + 0.001) {
			v.i = 0;
		}
		if (Math.abs(v.j) > Math.abs(vj * dt + aj * dt2) + 0.001) {
			v.j = 0;
		}
		*/

		return v;
	};
};

Canvace.Stage = function (data, canvas) {
	var view = new Canvace.View(data, canvas);
	var buckets = new Canvace.Buckets(view, data);

	var entities = {};
	var instances = new Canvace.MultiSet();
	var instancesWithPhysics = new Canvace.MultiSet();

	function assertObject(object, properties, fallback) {
		for (var key in properties) {
			if (properties.hasOwnProperty(key)) {
				var value;
				if (key in object) {
					value = object[key];
				} else if (key in fallback) {
					value = fallback[key];
				} else {
					return false;
				}
				if (typeof properties[key] !== 'object') {
					if (value !== properties[key]) {
						return false;
					}
				} else if ((typeof value !== 'object') ||
					!assertObject(value, properties[key], {}))
				{
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Represents an entity (not an instance).
	 *
	 * This class cannot be instantiated directly, instances are returned by
	 * various methods of the `Stage` class and subclasses.
	 *
	 * @class Canvace.Stage.Entity
	 */
	function Entity(id) {
		var entity = data.entities[id = parseInt(id, 10)];
		if (!(id in entities)) {
			entities[id] = this;
		}

		/**
		 * Returns the numeric ID of the entity.
		 *
		 * @method getId
		 * @return {Number} The numeric ID of the entity.
		 */
		this.getId = function () {
			return id;
		};

		/**
		 * Returns the entity's custom properties as set in the Canvace
		 * Development Environment.
		 *
		 * The original `properties` object is returned, so that modifications
		 * actually affect the entity's properties.
		 *
		 * @method getProperties
		 * @return {Object} The entity's `properties` field containing the
		 * custom properties the user set in the Canvace Development
		 * Environment.
		 */
		this.getProperties = function () {
			return entity.properties;
		};

		/**
		 * Indicates whether physics is enabled for this entity.
		 *
		 * Instances of entities that have physics enabled are automatically
		 * "ticked" when the whole stage is ticked. "Ticking" an entity instance
		 * means calling its `tick` method (see `Canvace.Stage.Instance.tick`), while
		 * "ticking" the whole stage means calling the `Stage.tick` method.
		 *
		 * Physics in entities can be enabled or disabled in the Canvace
		 * Development Environment.
		 *
		 * @method isPhysicsEnabled
		 * @return {Boolean} `true` if physics is enabled for this entity,
		 * `false` otherwise.
		 */
		this.isPhysicsEnabled = function () {
			return entity.enablePhysics;
		};

		/**
		 * Get an actual reference to the bounding box of this entity.
		 * See the `getBoundingBox` method for a detailed description.
		 *
		 * The returned entity is the real bounding box used internally, so any
		 * modification made to the returned object will affect the way the
		 * entity interacts with the surrounding environment.
		 *
		 * @method getRealBoundingBox
		 * @return {Object} An object containing four fields, `i0`, `j0`,
		 * `iSpan` and `jSpan`, describing the bounding box.
		 */
		this.getRealBoundingBox = function () {
			return entity.box;
		};

		/**
		 * Returns an object describing the bounding box of this entity.
		 *
		 * The returned object contains four real number fields: `i0`, `j0`,
		 * `iSpan` and `jSpan`. The `i0` and `j0` fields are the offsets of the
		 * origin of the bounding box from the position of the entity along the
		 * I and J axis, respectively. The `iSpan` and `jSpan` fields are the
		 * span of the bounding box along the I and J axis, respectively.
		 *
		 * The bounding box is used internally to implement collisions against
		 * tiles or other entities.
		 *
		 * @method getBoundingBox
		 * @return {Object} An object containing four fields, `i0`, `j0`,
		 * `iSpan` and `jSpan`, describing the bounding box.
		 */
		this.getBoundingBox = (function () {
			var result = {
				i0: entity.box.i0,
				j0: entity.box.j0,
				iSpan: entity.box.iSpan,
				jSpan: entity.box.jSpan
			};
			return function () {
				return result;
			};
		})();

		/**
		 * Enumerates all the instances of this entity currently present in the
		 * stage, filtering them based on their custom properties.
		 *
		 * The `properties` argument contains the filtering properties: an
		 * instance is enumerated only if all of its filtered properties' values
		 * correspond to those declared in the `properties` argument. All other
		 * properties in the instance are not taken into account. This means
		 * that if you specify an empty `properties` object, all the instances
		 * are enumerated.
		 *
		 * Some custom properties may actually be objects containing other
		 * properties. This method performs a recursive deep comparison: the
		 * `properties` object may have nested objects containing other
		 * filtering properties.
		 *
		 * The entity instance is filtered based on its custom *instance*
		 * properties, but its custom *entity* properties are used as a
		 * fallback: if an instance does not contain a required property it is
		 * still enumerated if its entity does.
		 *
		 * Each enumerated instance is passed to the callback function as a
		 * `Canvace.Stage.Instance` object.
		 *
		 * The enumeration can be interrupted by returning `false` in the
		 * `action` callback function.
		 *
		 * @method forEachInstance
		 * @param action {Function} A callback function that gets called for
		 * every instance.
		 *
		 * It receives one single argument of type `Canvace.Stage.Instance` and
		 * can interrupt the enumeration by returning `false`.
		 * @param [properties] {Object} The optional filtering properties.
		 * @return {Boolean} `true` if the callback function returned `false`
		 * and the enumeration was interrupted, `false` otherwise.
		 */
		this.forEachInstance = function (action, properties) {
			if (!properties) {
				properties = {};
			}
			return instances.forEach(function (instance) {
				if (id === instance.getEntityId()) {
					if (assertObject(instance.getProperties(), properties, entity.properties)) {
						return action(instance);
					}
				}
			});
		};

		/**
		 * Creates a new instance of this entity and places it in the stage at
		 * the specified `(i, j, k)` position.
		 *
		 * The new instance has the initial velocity, uniform velocity and
		 * acceleration vectors all set to `(0, 0, 0)`.
		 *
		 * The new instance is returned as a `Canvace.Stage.Instance` object.
		 *
		 * @method createInstance
		 * @param i {Number} The I coordinate where the new instance has to be
		 * placed.
		 * @param j {Number} The J coordinate where the new instance has to be
		 * placed.
		 * @param k {Number} The K coordinate where the new instance has to be
		 * placed.
		 * @return {Canvace.Stage.Instance} The newly created instance.
		 */
		this.createInstance = function (i, j, k) {
			return new Instance({
				id: id,
				i: i,
				j: j,
				k: k,
				position: {
					i: i,
					j: j,
					k: k
				},
				velocity: {
					i: 0,
					j: 0,
					k: 0
				},
				uniformVelocity: {
					i: 0,
					j: 0,
					k: 0
				},
				acceleration: {
					i: 0,
					j: 0,
					k: 0
				},
				properties: {}
			}, buckets.addEntity(id, i, j, k));
		};
	}

	/**
	 * Represents an entity instance in the stage.
	 *
	 * This class cannot be instantiated directly, instances can be obtained
	 * using other methods such as `Canvace.Stage.forEachInstance`,
	 * `Canvace.Stage.getInstance` or their `Canvace.Stage.Entity` equivalents.
	 *
	 * In every moment, an entity instance is characterized by the following
	 * state:
	 *	<ul>
	 *	<li>a position vector,</li>
	 *	<li>a velocity vector,</li>
	 *	<li>a uniform velocity vector,</li>
	 *	<li>an acceleration vector.</li>
	 *	</ul>
	 *
	 * Each one of these vectors is a vector in a three-dimensional space and is
	 * thus characterized by three real components `i`, `j` and `k`.
	 *
	 * An instance can be "ticked". Ticking an instance means updating its state
	 * based on the following physics rules:
	 *	<ul>
	 *	<li>the acceleration vector is not changed,</li>
	 *	<li>the uniform velocity vector is not changed,</li>
	 *	<li>the velocity vector is updated by adding the acceleration
	 *		vector,</li>
	 *	<li>the position vector is updated by adding the velocity and uniform
	 *		velocity vectors.</li>
	 *	</ul>
	 *
	 * To tick an instance use the `Canvace.Stage.Instance.tick` method.
	 *
	 * Ticking an instance, and thus updating its physics state, is not enough
	 * in order to update the actual position of its frames in the graphical
	 * rendering. Another separate operation, called "update", is necessary.
	 *
	 * An instance can be updated by invoking its `update` method.
	 *
	 * You do not usually need to invoke neither the `tick` nor the `update`
	 * method directly, as they are automatically invoked by the global
	 * `Canvace.Stage.tick` and `Canvace.Stage.update` methods which, in turn,
	 * are automatically invoked by the `RenderLoop`.
	 *
	 * Both the `Canvace.Stage.Instance.tick` and the
	 * `Canvace.Stage.Instance.update` methods are invoked _only_ for the
	 * instances that have physics enabled (physics can be toggled per-entity in
	 * the Canvace Development Environment).
	 *
	 * The point in having two separate operations, "tick" and "update", to do
	 * one thing, which is moving an entity instance in the game, is that other
	 * operations can be accomplished between the two. These operations
	 * typically consist in further physics processing, e.g. collision testing.
	 *
	 * @class Canvace.Stage.Instance
	 */
	function Instance(instanceOrId, element) {
		var id, instance;
		if (typeof instanceOrId !== 'number') {
			id = null;
			instance = instanceOrId;
		} else {
			id = instanceOrId;
			instance = data.instances[id];
		}
		var entity = data.entities[instance.id];

		var remove = instances.add(this);
		if (entity.enablePhysics) {
			remove = (function (remove1, remove2) {
				return function () {
					return remove1() && remove2();
				};
			})(remove, instancesWithPhysics.add(this));
		}

		// FIXME
		this.drawBoundingBox = function (view, context, color) {
			var position = view.project(
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				instance.position.k);

			var dimension = view.project(
				entity.box.iSpan,
				entity.box.jSpan,
				0);

			context.save();
			context.strokeStyle = (color || "red");
			context.strokeRect(
				position[0],
				position[1],
				dimension[0],
				dimension[1]);
			context.restore();
		};

		/**
		 * Returns the numeric ID of the instance, or `null` if this instance
		 * was not initially present in the JSON data exported from the Canvace
		 * Development Environment and was later added to the stage.
		 *
		 * @method getId
		 * @return {Number} The numeric ID of the instance, or `null` if the
		 * instance has no ID.
		 */
		this.getId = function () {
			return id;
		};

		/**
		 * Returns the entity instance's custom properties as set in the Canvace
		 * Development Environment.
		 *
		 * The original `properties` object is returned, so that modifications
		 * actually affect the instance's properties.
		 *
		 * @method getProperties
		 * @return {Object} The entity instance's `properties` field containing
		 * the custom properties the user set in the Canvace Development
		 * Environment.
		 */
		this.getProperties = function () {
			return instance.properties;
		};

		/**
		 * Returns the numeric ID of the entity of this instance.
		 *
		 * @method getEntityId
		 * @return {Number} The numeric ID of the entity of this instance.
		 */
		this.getEntityId = function () {
			return instance.id;
		};

		/**
		 * Returns a `Canvace.Stage.Entity` object representing the entity whose
		 * instance is represented by this object.
		 *
		 * @method getEntity
		 * @return {Canvace.Stage.Entity} This instance's entity as a
		 * `Canvace.Stage.Entity` object.
		 */
		this.getEntity = function () {
			return entities[instance.id] || new Entity(instance.id);
		};

		/**
		 * Returns the instance's `(i, j, k)` position vector as an object
		 * containing three fields, `i`, `j` and `k`.
		 *
		 * Note that the original position vector object associated to the
		 * instance is returned: changes made to the returned object affect the
		 * position of the instance. You may use the returned object to manually
		 * control the position of the instance.
		 *
		 * Also note that changing the position of an instance by modifying the
		 * returned object does not affect its _rendered_ position until the
		 * `update` method is called.
		 *
		 * @method getPosition
		 * @return {Object} An object containing three fields, `i`, `j` and `k`,
		 * indicating the current position.
		 */
		this.getPosition = function () {
			return instance.position;
		};

		/**
		 * Returns the instance's projected position, which is its `(i, j, k)`
		 * position left-multiplied by the projection matrix.
		 *
		 * Note that this method returns the last calculated projected position,
		 * which means it does not reflect changes made by the `tick` method or
		 * by changing the position, velocity or uniform velocity objects
		 * returned by the `getPosition`, `getVelocity`, and
		 * `getUniformVelocity` methods. For changes to be reflected, the
		 * instance must be first updated using the `update` method.
		 *
		 * The position is returned as an object containing three fields, `x`,
		 * `y` and `z`, containing the `i`, `j` and `k` projected coordinates,
		 * respectively.
		 *
		 * @method getProjectedPosition
		 * @return {Object} The projected position as an object containing three
		 * `x`, `y` and `z` fields.
		 */
		this.getProjectedPosition = element.getProjectedPosition;

		/**
		 * Returns the 2D rectangular area corresponding to the instances's
		 * bounds.
		 *
		 * Note that this method returns the last calculated projected
		 * rectangle, which means it does not reflect changes made by such
		 * methods as `tick`, `moveBy`, `setPosition` and so on. For changes to
		 * be reflected, the instance must be first updated using the `update`
		 * method.
		 *
		 * The rectangle is returned as an object containing four fields: the
		 * `x` and `y` coordinates of the origin and the `width` and `height`.
		 *
		 * The coordinates of the origin are calculated by left-multiplying the
		 * `(i, j, k)` position vector of the instance by the projection matrix
		 * and adding the entity's offset. The width and height are simply
		 * copied from the entity descriptor.
		 *
		 * @method getProjectedRectangle
		 * @return {Object} An object that describes the projected rectangle and
		 * contains four fields: `x`, `y`, `width` and `height`.
		 */
		this.getProjectedRectangle = element.getProjectedRectangle;

		/**
		 * Indicates whether the instance is in or out of range.
		 *
		 * An entity instance is in range when its projected position (as
		 * returned by the `getProjectedPosition` method) falls within the
		 * "range" area, which is a rectangular area centered in the center of
		 * the viewport. The range area is usually much larger than the viewport
		 * area.
		 *
		 * This method is useful, for example, for discarding too far entity
		 * instances when stepping/ticking the physics of the game in order to
		 * improve performance, and is used by the `Stage.Range` inner class.
		 *
		 * @method inRange
		 * @param width {Number} The width of the range area.
		 * @param height {Number} The height of the range area.
		 * @return {Boolean} `true` if this instance falls within the specified
		 * range area, `false` otherwise.
		 */
		this.inRange = (function () {
			var viewportWidth = view.getWidth();
			var viewportHeight = view.getHeight();
			return function (width, height) {
				var position = element.getProjectedPosition();
				var origin = view.getOrigin();
				var frameWidth = (width - viewportWidth) / 2;
				var frameHeight = (height - viewportHeight) / 2;
				return (position.x >= -origin.x - frameWidth) &&
					(position.x <= -origin.x + viewportWidth + frameWidth) &&
					(position.y >= -origin.y - frameHeight) &&
					(position.y <= -origin.y + viewportHeight + frameHeight);
			};
		})();

		/**
		 * Returns the velocity vector of this instance as an object containing
		 * three fields, `i`, `j` and `k`, indicating the respective components
		 * of the vector. The velocity vector is initially `(0, 0, 0)`.
		 *
		 * This velocity vector is influenced by the acceleration vector of the
		 * instance: the components of the acceleration vector are added to the
		 * respective components of the velocity vector each time the instance
		 * is ticked using the `tick` method.
		 *
		 * Note that the original velocity vector object associated to the
		 * instance is returned: changes made to the returned object affect the
		 * velocity of the instance. You may use the returned object to manually
		 * control the velocity of the instance.
		 *
		 * @method getVelocity
		 * @return {Object} The instance's velocity vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 */
		this.getVelocity = function () {
			return instance.velocity;
		};

		/**
		 * Returns the uniform velocity vector of this instance.
		 *
		 * The vector is returned as an object containing three fields, `i`, `j`
		 * and `k`, indicating the respective components of the vector.
		 *
		 * Note that the original uniform velocity vector object associated to
		 * the instance is returned: changes made to the returned object affect
		 * the uniform velocity of the instance. You may use the returned object
		 * to manually control the uniform velocity of the instance.
		 *
		 * @method getUniformVelocity
		 * @return {Object} The instance's uniform velocity vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 */
		this.getUniformVelocity = function () {
			return instance.uniformVelocity;
		};

		/**
		 * Returns the full velocity vector of the instance.
		 *
		 * The full velocity vector is the velocity vector plus the uniform
		 * velocity vector.
		 *
		 * The vector is returned as an object containing three fields, `i`, `j`
		 * and `k`, indicating the respective components of the vector.
		 *
		 * A new object is created, filled and returned every time this method
		 * is called; modifying its content does not have any effects on the
		 * state of the instance. The velocity and uniform velocity of the
		 * instance must be controlled independently.
		 *
		 * @method getFullVelocity
		 * @return {Object} The instance's full velocity vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 */
		this.getFullVelocity = (function () {
			var fullVelocity = {
				i: instance.velocity.i + instance.uniformVelocity.i,
				j: instance.velocity.j + instance.uniformVelocity.j,
				k: instance.velocity.k + instance.uniformVelocity.k
			};
			return function () {
				fullVelocity.i = instance.velocity.i + instance.uniformVelocity.i;
				fullVelocity.j = instance.velocity.j + instance.uniformVelocity.j;
				fullVelocity.k = instance.velocity.k + instance.uniformVelocity.k;
				return fullVelocity;
			};
		})();

		/**
		 * Returns the instance's own acceleration vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 *
		 * The acceleration vector is initially `(0, 0, 0)`.
		 *
		 * Note that the original acceleration vector object associated to the
		 * instance is returned: changes made to the returned object affect the
		 * acceleration of the instance. You may use the returned object to
		 * manually control the acceleration of the instance.
		 *
		 * @method getAcceleration
		 * @return {Object} The instance's acceleration vector as an object
		 * containing three fields, `i`, `j` and `k`, indicating the respective
		 * components of the vector.
		 */
		this.getAcceleration = function () {
			return instance.acceleration;
		};

		/**
		 * Tests for collisions between this entity instance and the tiles of
		 * the specified `Canvace.TileMap`.
		 *
		 * This method invokes the `Canvace.TileMap.rectangleCollision` using
		 * the position of the instance, its current full velocity vector and
		 * the bounding box of its entity, as set in the Canvace Development
		 * Environment.
		 *
		 * This method does not change the state of the instance in any way; it
		 * only forwards the return value of the
		 * `Canvace.TileMap.rectangleCollision` method to the caller.
		 *
		 * @method testTileCollision
		 * @param tileMap {Canvace.TileMap} A `Canvace.TileMap` object whose
		 * tiles are tested for collisions with this entity instance.
		 * @param dt {Number} TODO
		 * @param [collides] {Function} An optional user-defined callback
		 * function that is invoked by the `testTileCollision` method for every
		 * tile that collides with the instance.
		 *
		 * The function receives two arguments, the tile's walkable flag and its
		 * properties, and must return a boolean value indicating whether the
		 * tile is "solid" for this instance and must be taken into account as a
		 * colliding tile. If the function returns `false` the tile is _not_
		 * taken into account.
		 * @return {Object} A vector that is computed by the method and can be
		 * used to restore a "regular" configuration where the entity instance
		 * does not collide with the tiles.
		 *
		 * See the `Canvace.TileMap.rectangleCollision` method for more
		 * information, the return value is the same.
		 */
		this.testTileCollision = function (tileMap, dt, collides) {
			return tileMap.rectangleCollision(
				Math.floor(instance.k),
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.velocity.i + instance.uniformVelocity.i,
				instance.velocity.j + instance.uniformVelocity.j,
				instance.acceleration.i,
				instance.acceleration.j,
				dt,
				collides
				);
		};

		/**
		 * Reacts to possible collisions between this entity instance and the
		 * tiles of the specified
		 * {{#crossLink "Canvace.TileMap"}}{{/crossLink}}.
		 *
		 * This method invokes the `Canvace.TileMap.rectangleCollision` method
		 * using the position of the instance, its current full velocity vector
		 * and the bounding box of its entity, as set in the Canvace Development
		 * Environment.
		 *
		 * It then reacts to the collision by updating the state of the instance
		 * trying to resume a regular configuration where there is no collision.
		 *
		 * Specifically, the position of the instance is updated by adding the I
		 * and J components of the vector returned by
		 * `Canvace.TileMap.rectangleCollision` and each one of the I and J
		 * components of the velocity vector is set to zero only if its sign is
		 * the opposite of the corresponding component in the vector returned by
		 * `Canvace.TileMap.rectangleCollision`.
		 *
		 * Note that only the velocity vector is changed, the uniform velocity
		 * vector is not.
		 *
		 * The vector returned by `Canvace.TileMap.rectangleCollision` is also
		 * forwarded to the caller.
		 *
		 * @method tileCollision
		 * @param tileMap {Canvace.TileMap} A `Canvace.TileMap` object whose
		 * tiles are tested for collisions with this entity instance.
		 * @param dt {Number} TODO
		 * @param [collides] {Function} TODO
		 * @return {Object} The vector object returned by the
		 * `rectangleCollision` method of
		 * {{#crossLink "Canvace.TileMap"}}{{/crossLink}}.
		 */
		this.tileCollision = function (tileMap, dt, collides) {
			var v = tileMap.rectangleCollision(
				Math.floor(instance.k),
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.velocity.i + instance.uniformVelocity.i,
				instance.velocity.j + instance.uniformVelocity.j,
				instance.acceleration.i,
				instance.acceleration.j,
				dt,
				collides
				);
			instance.position.i += v.i;
			instance.position.j += v.j;
			if ((v.i > 0) && (instance.velocity.i < 0)) {
				instance.velocity.i = 0;
			} else if ((v.i < 0) && (instance.velocity.i > 0)) {
				instance.velocity.i = 0;
			}
			if ((v.j > 0) && (instance.velocity.j < 0)) {
				instance.velocity.j = 0;
			} else if ((v.j < 0) && (instance.velocity.j > 0)) {
				instance.velocity.j = 0;
			}
			return v;
		};

		/**
		 * Detects collisions between a rectangular area and the bounding box of
		 * this entity instance.
		 *
		 * A vector is returned indicating two I and J values that must be added
		 * to the coordinates of the rectangular area in order to resume a
		 * regular configuration where the area does not collide with the
		 * instance.
		 *
		 * In case there is not any collision, the returned vector is `(0, 0)`.
		 *
		 * The rectangular area is specified by the `i`, `j`, `di` and `dj`
		 * arguments.
		 *
		 * The implementation of this method assumes the rectangular area
		 * represents a moving entity (though not necessarily a Canvace entity)
		 * which is characterized by its own velocity vector; this vector is
		 * used in the collision algorithm in that it assumes the moving entity
		 * cannot have compenetrated the bounding box of this instance along the
		 * I or J axis more than the velocity vector component for that axis.
		 * This is necessary in order to obtain a functional physics algorithm.
		 *
		 * If the rectangular area actually is the bounding box of a Canvace
		 * entity, you can specify the I and J components of its actual velocity
		 * vector for the `vi` and `vj` arguments; such vector can be retrieved
		 * by adding the two vectors returned by the `getVelocity` and
		 * `getUniformVelocity` methods.
		 *
		 * If specifying a velocity vector is not suitable, you can specify
		 * arbitrary constant values; a good choice is usually 1 for both `vi`
		 * and `vj`. However, do not specify 0, as this would _always_ result in
		 * no collision.
		 *
		 * This method can be used to implement in-layer, bounding box based,
		 * entity vs. entity collisions. If the rectangular area represents an
		 * entity's bounding box, the `i` and `j` coordinates of its origin can
		 * be obtained using the `Canvace.Stage.Instance.getPosition` method,
		 * while the `di` and `dj` span values are usually constant and must be
		 * arbitrarily determined by the developer.
		 *
		 * @method rectangleCollision
		 * @param i {Number} The I coordinate of the origin of the rectangular
		 * area. This may be a real number.
		 * @param j {Number} The J coordinate of the origin of the rectangular
		 * area. This may be a real number.
		 * @param di {Number} The span of the rectangular area along the I axis.
		 * This may be a real number.
		 * @param dj {Number} The span of the rectangular area along the J axis.
		 * This may be a real number.
		 * @param vi {Number} The I component of the velocity vector. This may
		 * be a real number.
		 * @param vj {Number} The J component of the velocity vector. This may
		 * be a real number.
		 * @param ai {Number} TODO
		 * @param aj {Number} TODO
		 * @param dt {Number} TODO
		 * @return {Object} An object containing two number fields, `i` and `j`,
		 * specifying the I and J components of the computed vector.
		 */
		this.rectangleCollision = function (i, j, di, dj, vi, vj, ai, aj, dt) {
			var v = {
				i: 0,
				j: 0
			};
			if (i < instance.position.i + entity.box.i0) {
				if (i + di > instance.position.i + entity.box.i0) {
					if (j < instance.position.j + entity.box.j0) {
						if (j + dj > instance.position.j + entity.box.j0) {
							if (i + di < instance.position.i + entity.box.i0 + entity.box.iSpan) {
								v.i = instance.position.i + entity.box.i0 - i - di;
							}
							if (j + dj < instance.position.j + entity.box.j0 + entity.box.jSpan) {
								v.j = instance.position.j + entity.box.j0 - j - dj;
							}
						}
					} else if (j < instance.position.j + entity.box.j0 + entity.box.jSpan) {
						if (i + di < instance.position.i + entity.box.i0 + entity.box.iSpan) {
							v.i = instance.position.i + entity.box.i0 - i - di;
						}
						if (j + dj > instance.position.j + entity.box.j0 + entity.box.jSpan) {
							v.j = instance.position.j + entity.box.j0 - j - dj;
						}
					}
				}
			} else if (i < instance.position.i + entity.box.i0 + entity.box.iSpan) {
				if (j < instance.position.j + entity.box.j0) {
					if (j + dj > instance.position.j + entity.box.j0) {
						v.i = instance.position.i + entity.box.i0 + entity.box.iSpan - i;
						if (j + dj < instance.position.j + entity.box.j0 + entity.box.jSpan) {
							v.j = instance.position.j + entity.box.j0 - j - dj;
						}
					}
				} else if (j < instance.position.j + entity.box.j0 + entity.box.jSpan) {
					if (i + di > instance.position.i + entity.box.i0 + entity.box.iSpan) {
						v.i = instance.position.i + entity.box.i0 + entity.box.iSpan - i;
					}
					if (j + dj > instance.position.j + entity.box.j0 + entity.box.jSpan) {
						v.j = instance.position.j + entity.box.j0 + entity.box.jSpan - j;
					}
				}
			}
			var dt2 = dt * dt * 0.5;
			if (Math.abs(v.i) > Math.abs((instance.velocity.i + instance.uniformVelocity.i - vi) * dt + (instance.acceleration.i - ai) * dt2) + 0.001) {
				v.i = 0;
			}
			if (Math.abs(v.j) > Math.abs((instance.velocity.j + instance.uniformVelocity.j - vj) * dt + (instance.acceleration.j - aj) * dt2) + 0.001) {
				v.j = 0;
			}
			return v;
		};

		/**
		 * Tests for collisions between this entity instance and the specified
		 * one.
		 *
		 * This method invokes the `rectangleCollision` method of the specified
		 * _other_ instance using the position of _this_ instance, its current
		 * full velocity vector and the bounding box of its entity as set in the
		 * Canvace Development Environment.
		 *
		 * This method does not change the state of the instances in any way; it
		 * only forwards the return value of the `rectangleCollision` method to
		 * the caller.
		 *
		 * @method testCollision
		 * @param otherInstance {Canvace.Stage.Instance} Another `Instance`
		 * object that is tested for collisions with this instance.
		 * @return {Object} A vector that is computed by the method and can be
		 * used to restore a "regular" configuration where the specified
		 * instance does not collide with this instance.
		 *
		 * See the `Canvace.Stage.Instance.rectangleCollision` method for more
		 * information, the return value is the same.
		 */
		this.testCollision = function (otherInstance, dt) {
			return otherInstance.rectangleCollision(
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.velocity.i + instance.uniformVelocity.i,
				instance.velocity.j + instance.uniformVelocity.j,
				instance.acceleration.i,
				instance.acceleration.j,
				dt
				);
		};

		/**
		 * Reacts to possible collisions between this entity instance and the
		 * specified one.
		 *
		 * This method invokes the `Canvace.Stage.Instance.rectangleCollision`
		 * method of the specified _other_ instance passing the position of
		 * _this_ instance, its current full velocity vector and the bounding
		 * box of its entity as set in the Canvace Development Environment.
		 *
		 * It then reacts to the collision by updating the state of _this_
		 * instance trying to resume a regular configuration where there is no
		 * collision.
		 *
		 * Specifically, the position of the instance is updated by adding the I
		 * and J components of the vector returned by `rectangleCollision` and
		 * each one of the I and J components of the velocity vector is set to
		 * zero only if its sign is the opposite of the corresponding component
		 * in the vector returned by `rectangleCollision`.
		 *
		 * Note that only the velocity vector is changed, the uniform velocity
		 * vector is not.
		 *
		 * The vector returned by `Canvace.Stage.Instance.rectangleCollision`
		 * is also forwarded to the caller.
		 *
		 * @method collision
		 * @param otherInstance {Canvace.Stage.Instance} Another `Instance`
		 * object that is tested for collisions with this instance.
		 * @return {Object} The vector object returned by the
		 * `Canvace.Stage.Instance.rectangleCollision` method.
		 */
		this.collision = function (otherInstance, dt) {
			var v = otherInstance.rectangleCollision(
				instance.position.i + entity.box.i0,
				instance.position.j + entity.box.j0,
				entity.box.iSpan,
				entity.box.jSpan,
				instance.velocity.i + instance.uniformVelocity.i,
				instance.velocity.j + instance.uniformVelocity.j,
				instance.acceleration.i,
				instance.acceleration.j,
				dt
				);
			instance.position.i += v.i;
			instance.position.j += v.j;
			if ((v.i > 0) && (instance.velocity.i < 0)) {
				instance.velocity.i = 0;
			} else if ((v.i < 0) && (instance.velocity.i > 0)) {
				instance.velocity.i = 0;
			}
			if ((v.j > 0) && (instance.velocity.j < 0)) {
				instance.velocity.j = 0;
			} else if ((v.j < 0) && (instance.velocity.j > 0)) {
				instance.velocity.j = 0;
			}
			return v;
		};

		/**
		 * "Ticks" the instance, updating its position based on its velocity and
		 * its velocity based on its acceleration.
		 *
		 * This method is automatically called by the `Canvace.Stage.tick`
		 * method if the entity has physics enabled.
		 *
		 * @method tick
		 * @param dt {Number} TODO
		 */
		this.tick = function (dt) {
			var dt2 = dt * dt * 0.5;
			instance.position.i += (instance.velocity.i + instance.uniformVelocity.i) * dt + instance.acceleration.i * dt2;
			instance.position.j += (instance.velocity.j + instance.uniformVelocity.j) * dt + instance.acceleration.j * dt2;
			instance.position.k += (instance.velocity.k + instance.uniformVelocity.k) * dt + instance.acceleration.k * dt2;
			instance.velocity.i += instance.acceleration.i * dt;
			instance.velocity.j += instance.acceleration.j * dt;
			instance.velocity.k += instance.acceleration.k * dt;
		};

		/**
		 * Updates the instance so that its graphical representation in
		 * subsequent renderings reflect its actual position.
		 *
		 * Since this method is potentially costly, it should be called only
		 * once per instance at each iteration of the render loop. This is what
		 * the `RenderLoop` class does.
		 *
		 * This method is automatically called by the `Canvace.Stage.update`
		 * method if the entity has physics enabled.
		 *
		 * @method update
		 */
		this.update = function () {
			element.updatePosition(instance.position.i, instance.position.j, instance.position.k);
		};

		/**
		 * Removes the entity instance from the stage. The instance will not be
		 * rendered any more by subsequent `Renderer.render` calls and will not
		 * be enumerated any more by the `DefaultRenderer.forEachEntity` method.
		 *
		 * This method does not do anything if the instance has already been
		 * removed or replaced with another entity using the `replaceEntity`
		 * method.
		 *
		 * @method remove
		 */
		this.remove = function () {
			element.remove();
			remove();
		};

		/**
		 * Replaces this entity instance with a new instance of another entity.
		 *
		 * After being replaced, this instance becomes invalid and this object
		 * should be discarded. The method returns a new `Stage.Instance` object
		 * that can be used to control the new instance.
		 *
		 * The new instance inherits this instance's position, velocity and
		 * acceleration vectors.
		 *
		 * This method throws an exception if it is invoked after the instance
		 * has been removed or already replaced by a previous call.
		 *
		 * @method replaceWith
		 * @param entity {Canvace.Stage.Entity} An entity to be instantiated
		 * and whose new instance must replace this one.
		 * @return {Canvace.Stage.Instance} A new `Stage.Instance` object
		 * representing the new instance.
		 */
		this.replaceWith = function (entity) {
			if (remove()) {
				return new Instance(instance, element.replace(instance.id = entity.getId()));
			} else {
				throw 'the instance cannot be replaced because it has been removed';
			}
		};

		/**
		 * Duplicates the instance, also replicating its velocity, uniform
		 * velocity and acceleration vectors.
		 *
		 * An entity may be optionally specified as a `Canvace.Stage.Entity`
		 * object to the `entity` argument so that the new instance refers to
		 * another entity.
		 *
		 * The new instance is returned as a `Canvace.Stage.Instance` object.
		 *
		 * @method fork
		 * @param [entity] {Canvace.Stage.Entity} An optional entity the new
		 * instance refers to. The new instance refers to the same entity of
		 * this instance if this argument is not specified.
		 * @return {Canvace.Stage.Instance} The new instance.
		 */
		this.fork = function (entity) {
			var id = entity ? entity.getId() : instance.id;
			return new Instance({
				id: id,
				i: instance.i,
				j: instance.j,
				k: instance.k,
				position: {
					i: instance.position.i,
					j: instance.position.j,
					k: instance.position.k
				},
				velocity: {
					i: instance.velocity.i,
					j: instance.velocity.j,
					k: instance.velocity.k
				},
				uniformVelocity: {
					i: instance.uniformVelocity.i,
					j: instance.uniformVelocity.j,
					k: instance.uniformVelocity.k
				},
				acceleration: {
					i: instance.acceleration.i,
					j: instance.acceleration.j,
					k: instance.acceleration.k
				},
				properties: {}
			}, buckets.addEntity(id, instance.position.i, instance.position.j, instance.position.k));
		};
	}

	(function () {
		for (var k in data.map) {
			k = parseInt(k, 10);
			for (var i in data.map[k]) {
				i = parseInt(i, 10);
				for (var j in data.map[k][i]) {
					j = parseInt(j, 10);
					buckets.addTile(data.map[k][i][j], i, j, k);
				}
			}
		}
		for (var id in data.instances) {
			var instance = data.instances[id];
			instance.position = {
				i: instance.i,
				j: instance.j,
				k: instance.k
			};
			instance.velocity = {
				i: 0,
				j: 0,
				k: 0
			};
			instance.uniformVelocity = {
				i: 0,
				j: 0,
				k: 0
			};
			instance.acceleration = {
				i: 0,
				j: 0,
				k: 0
			};
			new Instance(parseInt(id, 10), buckets.addEntity(instance.id, instance.i, instance.j, instance.k));
		}
	})();

	/**
	 * Returns the stage's name.
	 *
	 * @method getName
	 * @for Canvace.Stage
	 * @return {String} The stage's name.
	 */
	this.getName = function () {
		return data.name;
	};

	/**
	 * Returns the stage's custom properties as set in the Canvace Development
	 * Environment.
	 *
	 * The original `properties` object is returned, so that modifications
	 * actually affect the stage's properties.
	 *
	 * @method getProperties
	 * @return {Object} The stage's `properties` field containing the custom
	 * properties the user set in the Canvace Development Environment.
	 */
	this.getProperties = function () {
		return data.properties;
	};

	/**
	 * Returns the HTML5 canvas where the stage is rendered. This is the same
	 * canvas object specified to the constructor.
	 *
	 * @method getCanvas
	 * @return {HTMLCanvasElement} The HTML5 canvas where the stage is rendered.
	 */
	this.getCanvas = function () {
		return canvas;
	};

	/**
	 * Returns a `View` object that can be used by a `Renderer` to render the
	 * stage. It is internally built and initialized by `Stage`'s constructor.
	 *
	 * @method getView
	 * @return {Canvace.View} A `View` object.
	 */
	this.getView = function () {
		return view;
	};

	/**
	 * Returns a {{#crossLink "Canvace.Buckets"}}{{/crossLink}} object that can
	 * be used by a {{#crossLink "Renderer"}}{{/crossLink}} to render the
	 * stage. It is internally built and initialized by `Canvace.Stage`'s
	 * constructor.
	 *
	 * @method getBuckets
	 * @return {Canvace.Buckets} A `Buckets` object.
	 */
	this.getBuckets = function () {
		return buckets;
	};

	var map = null;

	/**
	 * Provides a {{#crossLink "Canvace.TileMap"}}{{/crossLink}} object that
	 * allows to manage this stage's tile map.
	 *
	 * The `Canvace.TileMap` object is created lazily only once, the first time
	 * this method is called; subsequent calls return the same object.
	 *
	 * @method getTileMap
	 * @return {Canvace.TileMap} A `TileMap` object associated to this stage's
	 * tile map.
	 */
	this.getTileMap = function () {
		return map || (map = new Canvace.TileMap(data, buckets));
	};

	/**
	 * Enumerates all the entities of this stage, filtering them based on their
	 * custom properties.
	 *
	 * The `properties` argument contains the filtering properties: an entity is
	 * enumerated only if all of its filtered properties' values correspond to
	 * those declared in the `properties` argument. All other properties in the
	 * entity are not taken into account. This means that if you specify an
	 * empty `properties` object, all the entities are enumerated.
	 *
	 * Some custom properties may actually be objects containing other
	 * properties. This method performs a recursive deep comparison: the
	 * `properties` object may have nested objects containing other filtering
	 * properties.
	 *
	 * Each enumerated entity is passed to the callback function as a
	 * `Canvace.Stage.Entity` object.
	 *
	 * The enumeration can be interrupted by returning `false` in the
	 * `action` callback function.
	 *
	 * @method forEachEntity
	 * @param action {Function} A callback function that gets called for every
	 * entity.
	 *
	 * It receives one single argument of type `Canvace.Stage.Entity` and can
	 * interrupt the enumeration by returning `false`.
	 * @param [properties] {Object} The optional filtering properties.
	 * @return {Boolean} `true` if the callback function returned `false` and
	 * the enumeration was interrupted, `false` otherwise.
	 */
	this.forEachEntity = function (action, properties) {
		if (!properties) {
			properties = {};
		}
		for (var id in data.entities) {
			if (data.entities.hasOwnProperty(id)) {
				if (assertObject(data.entities[id].properties, properties, {})) {
					if (action(entities[id] || new Entity(id)) === false) {
						return true;
					}
				}
			}
		}
		return false;
	};

	/**
	 * Returns an arbitrarily chosen entity among the ones not filtered by the
	 * specified filtering properties.
	 *
	 * Entities are filtered based on their custom properties. The `properties`
	 * argument contains the filtering properties: an entity is eligible only if
	 * all of its filtered properties' values correspond to those declared in
	 * the `properties` argument. All other properties in the entity are not
	 * taken into account. This means that if you specify an empty `properties`
	 * object, all the entities are eligible.
	 *
	 * Some custom properties may actually be objects containing other
	 * properties. This method performs a recursive deep comparison: the
	 * `properties` object may have nested objects containing other filtering
	 * properties.
	 *
	 * The chosen entity is returned as a `Stage.Entity` object.
	 *
	 * @method getEntity
	 * @param properties {Object} The filtering properties.
	 * @return {Canvace.Stage.Entity} A `Canvace.Stage.Entity` object
	 * representing the returned entity.
	 */
	this.getEntity = function (properties) {
		for (var id in data.entities) {
			if (data.entities.hasOwnProperty(id)) {
				if (assertObject(data.entities[id].properties, properties, {})) {
					return entities[id] || new Entity(id);
				}
			}
		}
		return null;
	};

	/**
	 * Enumerates the entity instances currently present in the stage. Each
	 * instance is returned as a `Canvace.Stage.Instance` object.
	 *
	 * The enumeration can be interrupted by returning `false` in the `action`
	 * callback function.
	 *
	 * @method forEachInstance
	 * @param action {Function} A callback function that gets called for every
	 * instance.
	 *
	 * It receives one single argument of type `Canvace.Stage.Instance` and can
	 * interrupt the enumeration by returning `false`.
	 * @param [properties] {Object} The optional filtering properties.
	 * @return {Boolean} `true` if the callback function returned `false` and
	 * the enumeration was interrupted, `false` otherwise.
	 */
	this.forEachInstance = function (action, properties) {
		if (!properties) {
			properties = {};
		}
		return instances.forEach(function (instance) {
			if (assertObject(instance.getProperties(), properties, instance.getEntity().getProperties())) {
				return action(instance);
			}
		});
	};

	/**
	 * Returns an arbitrarily chosen entity instance among the ones currently in
	 * the stage and not filtered by the specified filtering properties.
	 *
	 * Entity instances are filtered based on their custom properties. The
	 * `properties` argument contains the filtering properties: an instance is
	 * eligible only if all of its filtered properties' values correspond to
	 * those declared in the `properties` argument. All other properties in the
	 * instance are not taken into account. This means that if you specify an
	 * empty `properties` object, all the instances are eligible.
	 *
	 * Some custom properties may actually be objects containing other
	 * properties. This method performs a recursive deep comparison: the
	 * `properties` object may have nested objects containing other filtering
	 * properties.
	 *
	 * The entity instance is filtered based on its custom *instance*
	 * properties, but its custom *entity* properties are used as a fallback: if
	 * an instance does not contain a required property it is still eligible if
	 * its entity does.
	 *
	 * The chosen instance is returned as a `Canvace.Stage.Instance` object.
	 *
	 * @method getInstance
	 * @param properties {Object} The filtering properties.
	 * @return {Canvace.Stage.Instance} A `Canvace.Stage.Instance` object
	 * representing the returned entity instance.
	 */
	this.getInstance = function (properties) {
		var result = null;
		instances.forEach(function (instance) {
			if (assertObject(instance.getProperties(), properties, instance.getEntity().getProperties())) {
				result = instance;
				return false;
			}
		});
		return result;
	};

	/**
	 * TODO
	 *
	 * @class Canvace.Stage.Range
	 * @constructor
	 * @param width {Number} TODO
	 * @param height {Number} TODO
	 */
	this.Range = function (width, height) {
		/**
		 * TODO
		 *
		 * @method forEachInstance
		 * @param action {Function} TODO
		 * @param [properties] {Object} TODO
		 * @return {Boolean} TODO
		 */
		this.forEachInstance = function (action, properties) {
			if (!properties) {
				properties = {};
			}
			return instances.forEach(function (instance) {
				if (instance.inRange(width, height)) {
					if (assertObject(instance.getProperties(), properties, instance.getEntity().getProperties())) {
						return action(instance);
					}
				}
			});
		};

		/**
		 * TODO
		 *
		 * @method tick
		 * @param dt {Number} TODO
		 */
		this.tick = function (dt) {
			instancesWithPhysics.fastForEach(function (instance) {
				if (instance.inRange(width, height)) {
					instance.tick(dt);
				}
			});
		};

		/**
		 * TODO
		 *
		 * @method update
		 */
		this.update = function () {
			instancesWithPhysics.fastForEach(function (instance) {
				if (instance.inRange(width, height)) {
					instance.update();
				}
			});
		};
	};

	/**
	 * "Ticks" all the entities of the stage that have physics enabled. This
	 * method simply iterates over such entities and invokes their `tick`
	 * method.
	 *
	 * You do not usually need to call this method as it is automatically called
	 * by Canvace's render loop implementation in the
	 * {{#crossLink "Canvace.RenderLoop"}}{{/crossLink}} class.
	 *
	 * @method tick
	 * @for Canvace.Stage
	 * @param dt {Number} TODO
	 */
	this.tick = function (dt) {
		instancesWithPhysics.fastForEach(function (instance) {
			instance.tick(dt);
		});
	};

	/**
	 * Updates all the entities of the stage that have physics enabled. This
	 * method simply iterates over such entities and invokes their `update`
	 * method.
	 *
	 * You do not usually need to call this method as it is automatically called
	 * by Canvace's render loop implementation in the
	 * {{#crossLink "Canvace.RenderLoop"}}{{/crossLink}} class.
	 *
	 * @method update
	 */
	this.update = function () {
		instancesWithPhysics.fastForEach(function (instance) {
			instance.update();
		});
	};
};

Canvace.StageRenderer = function (stage, loader) {
	var effects = [];
	var renderer = new Canvace.Renderer(stage.getCanvas(), loader, stage.getView(), stage.getBuckets(), function (context) {
		for (var i = 0; i < effects.length; i++) {
			if (effects[i].isOver()) {
				effects.splice(i--, 1);
			} else if (effects[i].preProcess) {
				effects[i].preProcess(context);
			}
		}
	}, function (context) {
		for (var i = effects.length - 1; i >= 0; i--) {
			if (effects[i].postProcess) {
				effects[i].postProcess(context);
			}
		}
	});

	/**
	 * Adds an effect to the effect chain.
	 *
	 * An effect is an object containing an optional `preProcess` method, an
	 * optional `postProcess` method and a mandatory `isOver` method.
	 *
	 * The `preProcess` and `postProcess` methods are used by the underlying
	 * `Renderer` and thus receive a `context` argument, which is the "2d"
	 * context of the HTML5 canvas (see the constructor of the `Renderer`
	 * class).
	 *
	 * The `isOver` method does not receive any arguments and must return a
	 * boolean value indicating whether the effect must be disapplied, in which
	 * case it is automatically removed by the `StageRenderer`.
	 *
	 * Effects can be chained: the `addEffect` method may be called any number
	 * of times to add any number of effects.
	 *
	 * During the rendering of a frame, the `preProcess` methods of each effect
	 * in the chain are called in effect insertion order while the `postProcess`
	 * methods are called in reverse order.
	 *
	 * @method addEffect
	 * @param effect {Object} An effect object.
	 */
	renderer.addEffect = function (effect) {
		effects.push(effect);
	};

	return renderer;
};

Canvace.RumbleEffect = function (duration, period, amplitude, horizontal, vertical) {
	period     = (typeof period !== "undefined")     ? (~~period)     : Canvace.RumbleEffect.defaultPeriod;
	amplitude  = (typeof amplitude !== "undefined")  ? (~~amplitude)  : Canvace.RumbleEffect.defaultAmplitude;
	horizontal = (typeof horizontal !== "undefined") ? (!!horizontal) : true;
	vertical   = (typeof vertical !== "undefined")   ? (!!vertical)   : true;

	/**
	 * Modifies the canvas's projection matrix so as to simulate a rumble
	 * effect.
	 *
	 * @method preProcess
	 * @param context {CanvasRenderingContext2D} the rendering context of the
	 * HTML5 canvas.
	 */
	var sign = +1;
	this.preProcess = function (context) {
		if (--duration > 0) {
			sign = (0 === (duration % period)) ? (-sign) : (+sign);

			var dx = (horizontal) ? (sign * amplitude) : 0;
			var dy = (vertical)   ? (sign * amplitude) : 0;
			context.translate(dx, dy);
		}
	};

	/**
	 * Indicates whether the effect is over depending on the duration that was
	 * specified to the constructor.
	 *
	 * @method isOver
	 * @return {Boolean} `true` if the effect is over, `false` otherwise.
	 */
	this.isOver = function () {
		return (duration <= 0);
	};
};

/**
 * Property holding the default period of the rumble effect (currently `3`).
 * See the documentation of the class constructor for details.
 *
 * @property defaultPeriod
 * @type Number
 * @static
 * @final
 */
Canvace.RumbleEffect.defaultPeriod = 3;

/**
 * Property holding the default amplitude of the rumble effect (currently `2`).
 * See the documentation of the class constructor for details.
 *
 * @property defaultAmplitude
 * @type Number
 * @static
 * @final
 */
Canvace.RumbleEffect.defaultAmplitude = 2;
Canvace.RenderLoop = (function () {
	var loopType = 'auto';
	var loopRate = 60;

	var $this = function (stage, range, loader, userTick, synchronizeView) {
		var renderer = new Canvace.StageRenderer(stage, loader);

		var rate = loopRate;
		var period = Math.floor(1000.0 / rate);
		var running = false;
		var banned = false;

		var stepInterface = range || stage;
		var canvas = stage.getCanvas();

		var requestAnimationFrame = Canvace.Polyfill.getPrefixedProperty("requestAnimationFrame");
		var cancelAnimationFrame = Canvace.Polyfill.getPrefixedProperty("cancelAnimationFrame");
		var token;

		renderer.synchronize(period);

		/**
		 * Returns the desired frame rate, that corresponds to the `rate`
		 * argument that was specified to the constructor.
		 *
		 * See also `getActualRate`.
		 *
		 * @method getRate
		 * @return {Number} The desired frame rate.
		 */
		this.getRate = function () {
			return rate;
		};

		/*
		 * TODO questo contatore viene incrementato all'infinito, e anche molto
		 * rapidamente. bisogna limitarlo usando come modulo l'mcm tra tutte le
		 * durate totali di tutte le animazioni. questo valore va ottenuto dalla
		 * frame table.
		 */
		var counter = 0;

		/**
		 * Returns the actual frame rate, which is the number of frames per
		 * seconds that the machine is actually managing to render.
		 *
		 * This value is always lower than or at most equal to the desired frame
		 * rate specified to the constructor.
		 *
		 * This method returns `null` if the render loop is not currently
		 * running.
		 *
		 * @method getActualRate
		 * @return {Number} The actual frame rate, or `null` if the render loop
		 * is not currently running.
		 */
		this.getActualRate = (function () {
			var lastTimestamp = Date.now();
			return function () {
				if (running && !banned) {
					var currentTimestamp = Date.now();
					var result = counter * 1000 / (currentTimestamp - lastTimestamp);
					counter = 0;
					lastTimestamp = currentTimestamp;
					return result;
				} else {
					return null;
				}
			};
		})();

		/**
		 * Returns the "period", which is the inverse of the specified rate.
		 *
		 * The period is measured in milliseconds and is an integer number, so
		 * it is calculated as
		 *
		 *	Math.floor(1000 / rate)
		 *
		 * where "rate" is the _desired_ rate that was specified to the
		 * constructor (the same value returned by `RenderLoop.getRate`).
		 *
		 * @method getPeriod
		 * @return {Number} The period.
		 */
		this.getPeriod = function () {
			return period;
		};

		/**
		 * Returns the `Stage` rendererd by this render loop. This is the same
		 * object specified to the constructor.
		 *
		 * @method getStage
		 * @return {Canvace.Stage} The `Stage` rendered by this render loop.
		 */
		this.getStage = function () {
			return stage;
		};

		/**
		 * Returns the `StageRenderer` instance used to render the stage.
		 *
		 * @method getRenderer
		 * @return {Canvace.StageRenderer} The `StageRenderer` used to render
		 * the stage.
		 */
		this.getRenderer = function () {
			return renderer;
		};

		function step(dt) {
			stepInterface.tick(dt);
			if (typeof userTick === "function") {
				userTick(dt);
			}
		}

		function updateLoop(delta, elapsed) {
			while (delta > period) {
				step(period / 1000.0);
				delta -= period;
			}
			step(delta / 1000.0);
			stepInterface.update();
			if (typeof synchronizeView === "function") {
				synchronizeView();
			}

			counter++;
			renderer.render(elapsed);
		}

		function requestBasedLoop() {
			if (!running || banned) {
				running = true;
				banned = false;

				var startTimestamp = Date.now();
				var lastTimestamp = startTimestamp;
				token = requestAnimationFrame(function tick(timestamp) {
					var elapsed = (timestamp - startTimestamp);
					var delta = (timestamp - lastTimestamp);
					lastTimestamp = timestamp;

					updateLoop(delta, elapsed);
					token = requestAnimationFrame(tick);
				}, canvas);
			}
		}

		function intervalBasedLoop() {
			if (!running || banned) {
				running = true;
				banned = false;

				var startTimestamp = Date.now();
				var lastTimestamp = startTimestamp;
				token = setInterval(function () {
					var timestamp = Date.now();
					var elapsed = (timestamp - startTimestamp);
					var delta = (timestamp - lastTimestamp);
					lastTimestamp = timestamp;

					updateLoop(delta, elapsed);
				}, period);
			}
		}

		var clearLoop;
		if (loopType === 'request') {
			clearLoop = cancelAnimationFrame;
		} else if (loopType === 'interval') {
			clearLoop = clearInterval;
		} else if (requestAnimationFrame) {
			clearLoop = cancelAnimationFrame;
		} else {
			clearLoop = clearInterval;
		}

		/**
		 * Runs the render loop.
		 *
		 * If the loop has just been constructed and not yet started, it is
		 * started.
		 *
		 * If the loop is suspended, it is resumed.
		 *
		 * If it is running or it has been stopped by the `stop` method, this
		 * method does not have any effects.
		 *
		 * @method run
		 */
		if (loopType === 'request') {
			this.run = requestBasedLoop;
		} else if (loopType === 'interval') {
			this.run = intervalBasedLoop;
		} else if (requestAnimationFrame) {
			this.run = requestBasedLoop;
		} else {
			this.run = intervalBasedLoop;
		}

		/**
		 * Suspends the loop if it is currently running. Otherwise this method
		 * does not have any effects.
		 *
		 * @method suspend
		 */
		this.suspend = function () {
			if (running && !banned) {
				clearLoop(token);
				banned = true;
			}
		};

		/**
		 * Indicates whether the loop was running and has been suspended and not
		 * yet resumed or stopped.
		 *
		 * @method isSuspended
		 * @return {Boolean} `true` if the loop has been suspended, `false`
		 * otherwise.
		 */
		this.isSuspended = function () {
			return running && banned;
		};

		/**
		 * Definitely stops the loop. This means the loop will not be running
		 * any more, not even if the `start` method is called again.
		 *
		 * If you just want to suspend the loop and resume it later, use the
		 * `suspend` method.
		 *
		 * @method stop
		 */
		this.stop = function () {
			if (running) {
				clearLoop(token);
				running = false;
				banned = true;
			}
		};

		/**
		 * Indicates whether the loop has been stopped by the `stop` method.
		 *
		 * @method isStopped
		 * @return {Boolean} `true` if the loop has been stopped, `false`
		 * otherwise.
		 */
		this.isStopped = function () {
			return !running && banned;
		};
	};

	/**
	 * Configures loop settings. The settings are changed globally and affect
	 * only `RenderLoop` objects created since the last `setLoop` call.
	 *
	 * @method setLoop
	 * @static
	 * @param type {String} The loop type. Can be 'request', 'interval' or
	 * 'auto'. 'request' means the `requestAnimationFrame` API is used.
	 * 'interval' means the `setInterval` API is used. 'auto' means
	 * `requestAnimationFrame` is used by default and `setInterval` is used as a
	 * fallback where `requestAnimationFrame` is not available. The default
	 * value is 'auto'.
	 * @param [rate] {Number} The desidred loop execution rate. This parameter
	 * is only meaningful when the `setInterval` API is used. The default value
	 * is 60.
	 */
	$this.setLoop = function (type, rate) {
		if (type in {
			'request': true,
			'interval': true,
			'auto': true
		}) {
			loopType = type;
			if (typeof rate === 'number') {
				loopRate = rate;
			}
		} else {
			throw 'invalid loop type; only "request", "interval" and "auto" are allowed.';
		}
	};

	return $this;
})();

Canvace.Audio = function () {
	var createAudioElement = function () {
		return (function () {
			try {
				return new Audio();
			} catch (e) {
				return document.createElement("audio");
			}
		}());
	};

	var AudioContext = Canvace.Polyfill.getPrefixedProperty("AudioContext");
	var audioElement = createAudioElement();

	/**
	 * Tries to load the requested audio resource.
	 * You are not required to use this method to manually load the audio
	 * resources: you can rely on the functionalities exposed by
	 * {{#crossLink "Canvace.Loader"}}{{/crossLink}} to load multiple resources
	 * in one call and get notified of the loading progress.
	 *
	 * @method load
	 * @param url {String} The URL where the audio resource resides.
	 * @param [onload] {Function} An optional callback function to invoke when
	 * the loading of the resource completes. This function gets passed the
	 * `Canvace.Audio.SourceNode` that has just finished loading.
	 * @param [onerror] {Function} An optional callback function to invoke if
	 * the loading of the resource fails with an error.
	 * @return {Canvace.Audio.SourceNode} An audio node instance.
	 */
	this.load = function (url, onload, onerror) {
		return new SourceNode(url, onload, onerror);
	};

	/**
	 * Determines if the browser supports playing the requested MIME type.
	 *
	 * @example
	 *	var audio = new Canvace.Audio();
	 *	var playSound = function (node) {
	 *		node.play();
	 *	};
	 *	
	 *	if (audio.canPlayType("audio/mp3")) {
	 *		audio.load("audio/foo.mp3", playSound);
	 *	} else if (audio.canPlayType("application/ogg")) {
	 *		audio.load("audio/bar.ogg", playSound);
	 *	} else {
	 *		alert("No suitable audio resource available!");
	 *	}
	 *
	 * @method canPlayType
	 * @param mimeType {String} The MIME type to check for.
	 * @return {Boolean} A boolean result.
	 */
	this.canPlayType = function (mimeType) {
		return (audioElement.canPlayType(mimeType) !== "");
	};

	var SourceNode = null;

	if (typeof AudioContext !== "undefined") {
		var context = new AudioContext();

		/**
		 * This class represents a sound resource that the browser is capable
		 * of playing. If the browser supports WebAudio, this class wraps around
		 * an `AudioSourceNode`; if it doesn't, this class wraps around an
		 * `HTMLAudioElement`.
		 *
		 * You cannot instantiate this class directly: you can obtain a new
		 * instance by using the `load` method of
		 * {{#crossLink "Canvace.Audio"}}{{/crossLink}}, or with the methods
		 * `getSound` and `playSound` made available by
		 * {{#crossLink "Canvace.Loader"}}{{/crossLink}}.
		 *
		 * @class Canvace.Audio.SourceNode
		 */
		SourceNode = function (source, onload, onerror) {
			var thisObject = this;
			var sourceNode = null;
			var bufferData = null;
			var currentTime = 0;
			var noteOnAt = 0;
			var looping = false;
			var loaded = false;

			/**
			 * Plays the associated sound resource, resuming from the last
			 * position.
			 *
			 * @method play
			 * @chainable
			 */
			this.play = function () {
				var position = currentTime / 1000;
				var remaining = bufferData.duration - position;
				if (bufferData) {
					sourceNode = context.createBufferSource();
					sourceNode.buffer = bufferData;
					sourceNode.loop = looping;
					sourceNode.connect(context.destination);

					noteOnAt = Date.now();
					sourceNode.noteGrainOn(0, position, remaining);
				}
				return thisObject;
			};

			/**
			 * Pauses the playback of the associated sound resource.
			 *
			 * @method pause
			 * @chainable
			 */
			this.pause = function () {
				if (sourceNode) {
					sourceNode.noteOff(0);
					sourceNode.disconnect();

					currentTime += Date.now() - noteOnAt;
				}
				return thisObject;
			};

			/**
			 * Returns a clone of this `Canvace.Audio.SourceNode` instance.
			 * The new instance will have the same sound resource associated
			 * and the same flags applied (e.g., if this instance is set to be
			 * looping, the cloned one will be as well).
			 *
			 * @method clone
			 * @return {Canvace.Audio.SourceNode} The clone of this instance.
			 */
			this.clone = function () {
				var clone = new SourceNode(bufferData);
				clone.setLooping(looping);
				return clone;
			};

			/**
			 * Tells if the associated sound resource has completed loading.
			 *
			 * @method isLoaded
			 * @return {Boolean} Indicates whether it has completed loading or
			 * not.
			 */
			this.isLoaded = function () {
				return loaded;
			};

			/**
			 * Marks the sound resource as looping (i.e., it will start playing
			 * again as soon as it ends its playback).
			 *
			 * @method setLooping
			 * @param shouldLoop {Boolean} Indicates whether the playback should
			 * loop or not.
			 * @chainable
			 */
			this.setLooping = function (shouldLoop) {
				looping = shouldLoop;
				if (sourceNode) {
					sourceNode.loop = shouldLoop;
				}
				return thisObject;
			};

			if (typeof source !== "string") {
				bufferData = source;
				return this;
			}

			var request = new XMLHttpRequest();
			request.addEventListener("load", function () {
				context.decodeAudioData(request.response, function (buffer) {
					bufferData = buffer;
					loaded = true;
					if (typeof onload === "function") {
						onload(thisObject);
					}
				}, function () {
					if (typeof onerror === "function") {
						// FIXME: we should pass back something about the error
						// occurred, not the requested URL that failed loading.
						onerror(source);
					}
				});
			}, false);
			request.addEventListener("error", function (e) {
				if (typeof onerror === "function") {
					onerror(e);
				}
			}, false);
			request.open("GET", source, true);
			request.responseType = "arraybuffer";
			request.send();
			return this;
		};
	} else if (typeof audioElement !== "undefined") {
		SourceNode = function (source, onload, onerror) {
			var thisObject = this;
			var appended = false;
			var loaded = false;
			var context = null;

			this.play = function () {
				if (!appended) {
					document.body.appendChild(context);
					appended = true;
				}
				context.play();
				return thisObject;
			};

			this.pause = function () {
				context.pause();
				return thisObject;
			};

			this.clone = function () {
				var clone = new SourceNode(context.cloneNode(true));
				clone.setLooping(context.loop);
				return clone;
			};

			this.isLoaded = function () {
				return loaded;
			};

			this.setLooping = function (shouldLoop) {
				context.loop = (!!shouldLoop);
				return thisObject;
			};

			if (typeof source !== "string") {
				context = source;
				loaded = true;
			} else {
				context = createAudioElement();
				context.addEventListener('canplaythrough', function () {
					if (!loaded) {
						loaded = true;
						if (typeof onload === 'function') {
							onload(thisObject);
						}
					}
				}, false);
				context.addEventListener("error", function (e) {
					if (typeof onerror === "function") {
						onerror(e);
					}
				}, false);
				context.addEventListener('stalled', function () {
					context.load();
				}, false);
				context.setAttribute("src", source);
				context.load();
			}

			context.addEventListener("ended", function () {
				if (appended && !context.loop) {
					document.body.removeChild(context);
					appended = false;
				}
			}, false);
			return this;
		};
	}

	SourceNode.prototype.playClone = function () {
		var clone = this.clone();
		clone.play();
		return clone;
	};
};
Canvace.onVisibilityChange = function (callback) {
	if ('hidden' in document) {
		document.addEventListener('visibilitychange', function () {
			callback(document.hidden);
		}, false);
	} else if ('webkitHidden' in document) {
		document.addEventListener('webkitvisibilitychange', function () {
			callback(document.webkitHidden);
		}, false);
	} else if ('mozHidden' in document) {
		document.addEventListener('mozvisibilitychange', function () {
			callback(document.mozHidden);
		}, false);
	} else if ('msHidden' in document) {
		document.addEventListener('msvisibilitychange', function () {
			callback(document.msHidden);
		}, false);
	} else {
		return false;
	}
	return true;
};

return Canvace;
}());
