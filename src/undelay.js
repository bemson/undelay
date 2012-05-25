/*!
 * undelay! v0.0.1
 * http://github.com/bemson/undelay
 *
 * Copyright 2012, Bemi Faison
 * Released under the MIT License
 */
!function (window) {
	var
		posts = {}
		, postIdx = 0
		, postMessageOrigin
		, inFileProtocol
		// capture native window methods
		, _postMessage = window.postMessage
		, _setTimeout = window.setTimeout
		, _clearTimeout = window.clearTimeout
	;
	// if the environment is valid...
	if (
		typeof location == 'object' &&
		typeof _postMessage == 'function' &&
		typeof _setTimeout == 'function' &&
		typeof _clearTimeout == 'function'
	) {
		// flag when we're in the file: protocol
		inFileProtocol = !location.protocol.indexOf('file:');
		// build postMessageOrigin - needed for this page to speak to itself (security ignored locally)
		postMessageOrigin = inFileProtocol ? '*' : location.protocol + '//' + location.host;

		// overload setTimeout
		window.setTimeout = function (functionOrCode, delay) {
			var
				fncType = typeof functionOrCode
				, additionalParameters = [].slice.call(arguments, 2)
			;
			// increment the postIdx
			postIdx++;
			// if attempting a 0 second delay and passing a string or function...
			if (delay == 0 && !fncType.search(/^[fs]/)) {
				// capture callback, use closure when additional args are given for a function
				posts[postIdx] =
					// when given a function and additional arguments...
					(fncType == 'function' && additionalParameters.length) ?
					// use closured call to include additional params
					function () {
						functionOrCode.apply(window, additionalParameters);
					} :
					// otherwise, use the function itself
					functionOrCode
				;
				// send post index to own window, via postMessage api
				_postMessage(postIdx, postMessageOrigin);
				// return the faux timeout id
				return postIdx;
			}
			// (otherwise) capture and return result of native setTimeout method
			return posts[postIdx] = _setTimeout.apply(window, arguments);
		};

		// overload clearTimeout
		window.clearTimeout = function (postIdx) {
			var
				// the postIdx action
				postCallback = posts[postIdx]
			;
			// if the postIdx exists...
			if (posts.hasOwnProperty(postIdx)) {
				// if the postIdx points to a number...
				if (typeof postCallback == 'number') {
					// invoke native cleartimeout
					_clearTimeout(postCallback);
				}
				// delete this postIdx key
				delete posts[postIdx];
			}
		};

		// set listener for (post)message events
		window.addEventListener(
			'message',
			function (evt) {
				var
					// the post-function to execute or evaluate
					postCallback
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
					// there is a function matching the data index...
					(postCallback = posts[evt.data])
				) {
					// remove the post index
					delete posts[evt.data];
					// if postCallback is a function...
					if (typeof postCallback === 'function') {
						// execute the function
						postCallback();
					} else { // otherwise, when postCallback is a string...
						// evaluate the string
						eval(postCallback);
					}
				}
			},
			false
		);
	}
}(this);