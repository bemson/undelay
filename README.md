# undelay! _(Ándale!)_
by Bemi Faison

version 0.0.3
(5/25/12)

## DESCRIPTION

Undelay patches `window.setTimeout` such that zero and one millisecond delayed callbacks execute faster.

Setting delays above one millisecond are handled by the browser's native [window.setTimeout](https://developer.mozilla.org/en/DOM/window.setTimeout) method. Undelay also patches [window.clearTimeout](https://developer.mozilla.org/en/DOM/window.setTimeout) to work with the numeric timeout identifiers.

Undelay works transparently in any browser environment that supports [window.postMessage](https://developer.mozilla.org/en/DOM/window.postMessage) and [message events](http://help.dottoro.com/ljjqtjsj.php). Just include this script, to improve UI performance and responsiveness in your web applications.


#### IMPLEMENTATION NOTES

 - This is an **experimental** project. Please test and apply with caution!
 - Undelay is a self-executing routine that does not add to the global namespace.
 - The minified version is only 672 bytes (gzipped)!
 - Undelay supports passing additional parameters as callback arguments, and does not fork this behavior for Internet Explorer (which doesn't support passing callback arguments).
 - Accelerated callbacks do not have a default time-delay argument, as with FireFox's native implementation.
 - Undelay listens to message events, originating from the host page's protocol and domain. The exception to this rule is for local files, wherein the message origin is "*" (i.e., any window). The message data is also validated.
 - Currently, there is no API for disabling undelay. Instead, simply remove the script from your web page.


## FILES

* src/ - Directory containing the source code
* README.md - This readme file
* LICENSE - The legal terms and conditions under which this software may be used
* undelay-min.js - The undelay codebase, minified for production

## LICENSE

Undelay is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright 2012, Bemi Faison