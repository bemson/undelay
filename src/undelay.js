/*!
 * undelay! version 0.0.3
 * http://github.com/bemson/undelay
 *
 * Copyright 2012, Bemi Faison
 * Released under the MIT License
 */
!function (window) {
	var
		// master queue of callbacks
		callbacks = {}
		// hash-like queues for 0 and 1 callbacks
		, acceleratedQueue = {
			'0': {
				length: 0
			}
			, '1': {
				length: 0
			}
		}
		, callbackCnt = 0
		, postMessageOrigin
		, inFileProtocol
		// capture native window methods
		, _postMessage = window.postMessage
		, _setTimeout = window.setTimeout
		, _clearTimeout = window.clearTimeout
	;

	function executeCallback(callback, args) {
		// if callback is a function...
		if (typeof callback == 'function') {
			// invoke and pass-thru arguments or nada
			callback.apply(window, args || []);
		} else { // otherwise, assume it's a string...
			// do the needful
			eval(callback);
		}
	}

	function executeAcceleratedCallback(queue, index) {
		var
			callback = queue[index]
		;
		// dereference callback pointers from the master list and queues
		removeAcceleratedCallback(queue, index);
		// invoke the callback
		executeCallback(callback);
	}

	function removeAcceleratedCallback(queue, index) {
		// remove pointers to this callback from both queues
		delete queue[index];
		delete callbacks[index];
		// decrement queue counter
		queue.length--;
	}

	function processAcceleratedQueue(queueId, index) {
		var
			// closure the current callbackCnt
			endIndex = callbackCnt
			, queue = acceleratedQueue[queueId]
		;
		// start with next index - the initial index is for the pending callback
		index++;
		// for every queue item between the starting index and the current callback max (inclusive)...
		for (; index <= endIndex; index++) {
			// if there is a callback in this queue at this index...
			if (queue[index]) {
				// execute the queued callback
				executeAcceleratedCallback(queue, index);
			}
		}
	}

	// if the execution environment supports undelay...
	if (
		typeof location == 'object' &&
		typeof _postMessage == 'function' &&
		typeof _setTimeout == 'function' &&
		typeof _clearTimeout == 'function'
	) {
		// determine whether this page is using the "file:"" protocol
		inFileProtocol = !location.protocol.indexOf('file:');
		// build postMessageOrigin - needed for this page to securely listen to undelay events (NOTE: security is ignored for local files)
		postMessageOrigin = inFileProtocol ? '*' : location.protocol + '//' + location.host;

		// overload setTimeout
		window.setTimeout = function (functionOrCode, delay) {
			var
				fncType = typeof functionOrCode
				, isFunction = fncType == 'function'
				, args = [].slice.call(arguments)
				, callbackIdx
			;
			// increment and closure this callback index
			callbackIdx = ++callbackCnt;
			/*
			Specs say default time is 0; the next line handles that.
			However the minimum delay should be 4 when setTimeout is called from a setTimeout-callback.
			We can check for this, but I need to research whether browsers currently enforce this rule.
			My guess is "yes" for Chrome, and "doesn't matta" for other browsers - since Chrome is
			the only one that recognizes delays above 2ms (I think)... More to come!
			*/
			// ensure delay meets the minimum positive integer requirement
			delay = Math.max(0, ~~delay);
			// if attempting a 0 or 1 millisecond delay with a string or function...
			if (delay < 2 && (isFunction || fncType == 'string')) {
				// add callback to the corresponding accelerated queue
				acceleratedQueue[delay][callbackIdx] = 
					// when given a function and additional arguments...
					(isFunction && args.length > 2) ?
						// substitute callback with a closure that passes the additional parameters
						function () {
							functionOrCode.apply(window, args.slice(2));
						} :
						// otherwise, capture the parameter as is
						functionOrCode
				;
				// increment the queue count
				acceleratedQueue[delay].length++;
				// point to the queue name (as a string), from the master callback list
				callbacks[callbackIdx] = delay + '';
				// fire message event, passing the callback index
				_postMessage(callbackIdx, postMessageOrigin);
				// return the faux timeout identifier
				return callbackIdx;
			}
			// override original function with closured call to handle garbage-collection
			args.splice(0, 1, function () {
				/*
				FireFox needed the following logic, since it will fire native timers before dispatched events complete.
				*/
				// if either accelerated queue has callbacks...
				if (acceleratedQueue[0].length || acceleratedQueue[1].length) {
					// invoke 0ms items above this callback's index
					processAcceleratedQueue(0, callbackIdx);
					// invoke 1ms items above this callback's index
					processAcceleratedQueue(1, callbackIdx);
				}
				// if this timeout iderntifier is still in the callback queue...
				if (callbacks[callbackIdx]) {
					// remove the callback from the master queue
					delete callbacks[callbackIdx];
					// invoke the function and pass-thru arguments
					executeCallback(functionOrCode, arguments);
				}
			});
			// set and capture a native setTimeout identifier
			callbacks[callbackIdx] = _setTimeout.apply(window, args);
			// return the faux timeout identifier
			return callbackIdx;
		};

		// overload clearTimeout
		window.clearTimeout = function (callbackIdx) {
			var
				// the callback item - could be a queue identifier
				callback = callbacks[callbackIdx]
			;
			// if the callbackIdx is valid...
			if (callback) {
				// if the callback is a string...
				if (typeof callback == 'string') {
					// remove the accelerated callback from it's corresponding queue
					removeAcceleratedCallback(queue[callback], callbackIdx);
				} else { // otherwise, assume this is a numeric, native timeout identifier...
					// delete this callback index from the master list
					delete callbacks[callbackIdx];
					// invoke native cleartimeout
					_clearTimeout(callbackIdx);
				}
			}
		};

		// listener for message events
		window.addEventListener(
			'message',
			function (evt) {
				var
					// the id of the queue this callback is for
					queueId
					// the index of the callback
					, callbackIdx
				;
				// if...
				if (
					(
						// the page is local...
						inFileProtocol ||
						// or, the origin is recognized...
						evt.origin == postMessageOrigin
					) &&
					// data is a number...
					typeof evt.data == 'number' &&
					// and, there is an accelerated callback at this index - we capture stuff here since we can (performance boost??)
					typeof (queueId = callbacks[(callbackIdx = evt.data)]) == 'string'
				) {
					// if the queueId is 1 but there are 0ms callbacks pending...
					if (queueId === '1' && acceleratedQueue[0].length) {
						// execute all 0ms callbacks above this callbacks index
						processAcceleratedQueue(0, callbackIdx);
					}
					// if this callback still exists..
					if (callbacks[callbackIdx]) {
						// execute this accelerated callback
						executeAcceleratedCallback(acceleratedQueue[queueId], callbackIdx);
					}
				}
			},
			false
		);
	}
}(this);