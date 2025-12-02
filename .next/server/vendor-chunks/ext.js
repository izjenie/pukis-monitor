/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/ext";
exports.ids = ["vendor-chunks/ext"];
exports.modules = {

/***/ "(rsc)/./node_modules/ext/global-this/implementation.js":
/*!********************************************************!*\
  !*** ./node_modules/ext/global-this/implementation.js ***!
  \********************************************************/
/***/ ((module) => {

eval("var naiveFallback = function () {\n\tif (typeof self === \"object\" && self) return self;\n\tif (typeof window === \"object\" && window) return window;\n\tthrow new Error(\"Unable to resolve global `this`\");\n};\n\nmodule.exports = (function () {\n\tif (this) return this;\n\n\t// Unexpected strict mode (may happen if e.g. bundled into ESM module)\n\n\t// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis\n\t// In all ES5+ engines global object inherits from Object.prototype\n\t// (if you approached one that doesn't please report)\n\ttry {\n\t\tObject.defineProperty(Object.prototype, \"__global__\", {\n\t\t\tget: function () { return this; },\n\t\t\tconfigurable: true\n\t\t});\n\t} catch (error) {\n\t\t// Unfortunate case of Object.prototype being sealed (via preventExtensions, seal or freeze)\n\t\treturn naiveFallback();\n\t}\n\ttry {\n\t\t// Safari case (window.__global__ is resolved with global context, but __global__ does not)\n\t\tif (!__global__) return naiveFallback();\n\t\treturn __global__;\n\t} finally {\n\t\tdelete Object.prototype.__global__;\n\t}\n})();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvZXh0L2dsb2JhbC10aGlzL2ltcGxlbWVudGF0aW9uLmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLGNBQWM7QUFDcEM7QUFDQSxHQUFHO0FBQ0gsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmVzdC1leHByZXNzLy4vbm9kZV9tb2R1bGVzL2V4dC9nbG9iYWwtdGhpcy9pbXBsZW1lbnRhdGlvbi5qcz81YzBlIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBuYWl2ZUZhbGxiYWNrID0gZnVuY3Rpb24gKCkge1xuXHRpZiAodHlwZW9mIHNlbGYgPT09IFwib2JqZWN0XCIgJiYgc2VsZikgcmV0dXJuIHNlbGY7XG5cdGlmICh0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiICYmIHdpbmRvdykgcmV0dXJuIHdpbmRvdztcblx0dGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJlc29sdmUgZ2xvYmFsIGB0aGlzYFwiKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uICgpIHtcblx0aWYgKHRoaXMpIHJldHVybiB0aGlzO1xuXG5cdC8vIFVuZXhwZWN0ZWQgc3RyaWN0IG1vZGUgKG1heSBoYXBwZW4gaWYgZS5nLiBidW5kbGVkIGludG8gRVNNIG1vZHVsZSlcblxuXHQvLyBUaGFua3MgQG1hdGhpYXNieW5lbnMgLT4gaHR0cHM6Ly9tYXRoaWFzYnluZW5zLmJlL25vdGVzL2dsb2JhbHRoaXNcblx0Ly8gSW4gYWxsIEVTNSsgZW5naW5lcyBnbG9iYWwgb2JqZWN0IGluaGVyaXRzIGZyb20gT2JqZWN0LnByb3RvdHlwZVxuXHQvLyAoaWYgeW91IGFwcHJvYWNoZWQgb25lIHRoYXQgZG9lc24ndCBwbGVhc2UgcmVwb3J0KVxuXHR0cnkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPYmplY3QucHJvdG90eXBlLCBcIl9fZ2xvYmFsX19cIiwge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LFxuXHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0fSk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0Ly8gVW5mb3J0dW5hdGUgY2FzZSBvZiBPYmplY3QucHJvdG90eXBlIGJlaW5nIHNlYWxlZCAodmlhIHByZXZlbnRFeHRlbnNpb25zLCBzZWFsIG9yIGZyZWV6ZSlcblx0XHRyZXR1cm4gbmFpdmVGYWxsYmFjaygpO1xuXHR9XG5cdHRyeSB7XG5cdFx0Ly8gU2FmYXJpIGNhc2UgKHdpbmRvdy5fX2dsb2JhbF9fIGlzIHJlc29sdmVkIHdpdGggZ2xvYmFsIGNvbnRleHQsIGJ1dCBfX2dsb2JhbF9fIGRvZXMgbm90KVxuXHRcdGlmICghX19nbG9iYWxfXykgcmV0dXJuIG5haXZlRmFsbGJhY2soKTtcblx0XHRyZXR1cm4gX19nbG9iYWxfXztcblx0fSBmaW5hbGx5IHtcblx0XHRkZWxldGUgT2JqZWN0LnByb3RvdHlwZS5fX2dsb2JhbF9fO1xuXHR9XG59KSgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/ext/global-this/implementation.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/ext/global-this/index.js":
/*!***********************************************!*\
  !*** ./node_modules/ext/global-this/index.js ***!
  \***********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
eval("\n\nmodule.exports = __webpack_require__(/*! ./is-implemented */ \"(rsc)/./node_modules/ext/global-this/is-implemented.js\")() ? globalThis : __webpack_require__(/*! ./implementation */ \"(rsc)/./node_modules/ext/global-this/implementation.js\");\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvZXh0L2dsb2JhbC10aGlzL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLGlCQUFpQixtQkFBTyxDQUFDLGdGQUFrQixtQkFBbUIsbUJBQU8sQ0FBQyxnRkFBa0IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yZXN0LWV4cHJlc3MvLi9ub2RlX21vZHVsZXMvZXh0L2dsb2JhbC10aGlzL2luZGV4LmpzPzA3OTkiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIi4vaXMtaW1wbGVtZW50ZWRcIikoKSA/IGdsb2JhbFRoaXMgOiByZXF1aXJlKFwiLi9pbXBsZW1lbnRhdGlvblwiKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/ext/global-this/index.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/ext/global-this/is-implemented.js":
/*!********************************************************!*\
  !*** ./node_modules/ext/global-this/is-implemented.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";
eval("\n\nmodule.exports = function () {\n\tif (typeof globalThis !== \"object\") return false;\n\tif (!globalThis) return false;\n\treturn globalThis.Array === Array;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvZXh0L2dsb2JhbC10aGlzL2lzLWltcGxlbWVudGVkLmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9yZXN0LWV4cHJlc3MvLi9ub2RlX21vZHVsZXMvZXh0L2dsb2JhbC10aGlzL2lzLWltcGxlbWVudGVkLmpzP2ZhZjQiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgIT09IFwib2JqZWN0XCIpIHJldHVybiBmYWxzZTtcblx0aWYgKCFnbG9iYWxUaGlzKSByZXR1cm4gZmFsc2U7XG5cdHJldHVybiBnbG9iYWxUaGlzLkFycmF5ID09PSBBcnJheTtcbn07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/ext/global-this/is-implemented.js\n");

/***/ })

};
;