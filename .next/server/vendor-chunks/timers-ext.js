"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/timers-ext";
exports.ids = ["vendor-chunks/timers-ext"];
exports.modules = {

/***/ "(rsc)/./node_modules/timers-ext/max-timeout.js":
/*!************************************************!*\
  !*** ./node_modules/timers-ext/max-timeout.js ***!
  \************************************************/
/***/ ((module) => {

eval("\n\nmodule.exports = 2147483647;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvdGltZXJzLWV4dC9tYXgtdGltZW91dC5qcyIsIm1hcHBpbmdzIjoiQUFBYTs7QUFFYiIsInNvdXJjZXMiOlsid2VicGFjazovL3Jlc3QtZXhwcmVzcy8uL25vZGVfbW9kdWxlcy90aW1lcnMtZXh0L21heC10aW1lb3V0LmpzP2VjM2MiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0gMjE0NzQ4MzY0NztcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/timers-ext/max-timeout.js\n");

/***/ }),

/***/ "(rsc)/./node_modules/timers-ext/valid-timeout.js":
/*!**************************************************!*\
  !*** ./node_modules/timers-ext/valid-timeout.js ***!
  \**************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar toPosInt   = __webpack_require__(/*! es5-ext/number/to-pos-integer */ \"(rsc)/./node_modules/es5-ext/number/to-pos-integer.js\")\n  , maxTimeout = __webpack_require__(/*! ./max-timeout */ \"(rsc)/./node_modules/timers-ext/max-timeout.js\");\n\nmodule.exports = function (value) {\n\tvalue = toPosInt(value);\n\tif (value > maxTimeout) throw new TypeError(value + \" exceeds maximum possible timeout\");\n\treturn value;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvdGltZXJzLWV4dC92YWxpZC10aW1lb3V0LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLGlCQUFpQixtQkFBTyxDQUFDLDRGQUErQjtBQUN4RCxpQkFBaUIsbUJBQU8sQ0FBQyxxRUFBZTs7QUFFeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3Jlc3QtZXhwcmVzcy8uL25vZGVfbW9kdWxlcy90aW1lcnMtZXh0L3ZhbGlkLXRpbWVvdXQuanM/ZDg4YiJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcblxudmFyIHRvUG9zSW50ICAgPSByZXF1aXJlKFwiZXM1LWV4dC9udW1iZXIvdG8tcG9zLWludGVnZXJcIilcbiAgLCBtYXhUaW1lb3V0ID0gcmVxdWlyZShcIi4vbWF4LXRpbWVvdXRcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdHZhbHVlID0gdG9Qb3NJbnQodmFsdWUpO1xuXHRpZiAodmFsdWUgPiBtYXhUaW1lb3V0KSB0aHJvdyBuZXcgVHlwZUVycm9yKHZhbHVlICsgXCIgZXhjZWVkcyBtYXhpbXVtIHBvc3NpYmxlIHRpbWVvdXRcIik7XG5cdHJldHVybiB2YWx1ZTtcbn07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/timers-ext/valid-timeout.js\n");

/***/ })

};
;