# undelay! _(Ándale!)_
by Bemi Faison

version 0.0.2
(5/25/12)

## DESCRIPTION

Patch `window.setTimeout` for zero-second delayed callbacks.

Undelay works transparently in any browser environment that supports [window.postMessage](https://developer.mozilla.org/en/DOM/window.postMessage) and [message events](http://help.dottoro.com/ljjqtjsj.php). Just include this script, to improve UI performance and responsiveness in your web applications.

Delays other than zero seconds are routed to the native [window.setTimeout](https://developer.mozilla.org/en/DOM/window.setTimeout) method. Undelay also patches [window.clearTimeout](https://developer.mozilla.org/en/DOM/window.setTimeout) to work with the numeric timeout identifiers.

Read David Baron's explanation and case for patching `window.setTimeout`, at [http://dbaron.org/log/20100309-faster-timeouts](http://dbaron.org/log/20100309-faster-timeouts).


#### DEVELOPER NOTES

 - The undelay script is a self-executing routine that does not add to the global namespace.
 - Undelay supports passing additional parameters as callback arguments.
 - The minified version is only 0.5K (gzipped)!
 - Undelay dispatches and listens to "message" events, wherein the `origin` parameter matches the host page's protocol and hostname. The exception to this rule is for local files; `origin` is set to "*".
 - Currently, there is no API for disabling undelay Instead, simply remove the script from your web page.


## FILES

* src/ - Directory containing the source code
* README.md - This readme file
* LICENSE - The legal terms and conditions under which this software may be used
* undelay-min.js - The undelay codebase, minified for production

## LICENSE

Undelay is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright 2012, Bemi Faison