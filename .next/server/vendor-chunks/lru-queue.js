"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/lru-queue";
exports.ids = ["vendor-chunks/lru-queue"];
exports.modules = {

/***/ "(rsc)/./node_modules/lru-queue/index.js":
/*!*****************************************!*\
  !*** ./node_modules/lru-queue/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval("\n\nvar toPosInt = __webpack_require__(/*! es5-ext/number/to-pos-integer */ \"(rsc)/./node_modules/es5-ext/number/to-pos-integer.js\")\n\n  , create = Object.create, hasOwnProperty = Object.prototype.hasOwnProperty;\n\nmodule.exports = function (limit) {\n\tvar size = 0, base = 1, queue = create(null), map = create(null), index = 0, del;\n\tlimit = toPosInt(limit);\n\treturn {\n\t\thit: function (id) {\n\t\t\tvar oldIndex = map[id], nuIndex = ++index;\n\t\t\tqueue[nuIndex] = id;\n\t\t\tmap[id] = nuIndex;\n\t\t\tif (!oldIndex) {\n\t\t\t\t++size;\n\t\t\t\tif (size <= limit) return;\n\t\t\t\tid = queue[base];\n\t\t\t\tdel(id);\n\t\t\t\treturn id;\n\t\t\t}\n\t\t\tdelete queue[oldIndex];\n\t\t\tif (base !== oldIndex) return;\n\t\t\twhile (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip\n\t\t},\n\t\tdelete: del = function (id) {\n\t\t\tvar oldIndex = map[id];\n\t\t\tif (!oldIndex) return;\n\t\t\tdelete queue[oldIndex];\n\t\t\tdelete map[id];\n\t\t\t--size;\n\t\t\tif (base !== oldIndex) return;\n\t\t\tif (!size) {\n\t\t\t\tindex = 0;\n\t\t\t\tbase = 1;\n\t\t\t\treturn;\n\t\t\t}\n\t\t\twhile (!hasOwnProperty.call(queue, ++base)) continue; //jslint: skip\n\t\t},\n\t\tclear: function () {\n\t\t\tsize = 0;\n\t\t\tbase = 1;\n\t\t\tqueue = create(null);\n\t\t\tmap = create(null);\n\t\t\tindex = 0;\n\t\t}\n\t};\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbHJ1LXF1ZXVlL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFhOztBQUViLGVBQWUsbUJBQU8sQ0FBQyw0RkFBK0I7O0FBRXREOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQ7QUFDekQsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlEQUF5RDtBQUN6RCxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmVzdC1leHByZXNzLy4vbm9kZV9tb2R1bGVzL2xydS1xdWV1ZS9pbmRleC5qcz9hMDgyIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIHRvUG9zSW50ID0gcmVxdWlyZSgnZXM1LWV4dC9udW1iZXIvdG8tcG9zLWludGVnZXInKVxuXG4gICwgY3JlYXRlID0gT2JqZWN0LmNyZWF0ZSwgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChsaW1pdCkge1xuXHR2YXIgc2l6ZSA9IDAsIGJhc2UgPSAxLCBxdWV1ZSA9IGNyZWF0ZShudWxsKSwgbWFwID0gY3JlYXRlKG51bGwpLCBpbmRleCA9IDAsIGRlbDtcblx0bGltaXQgPSB0b1Bvc0ludChsaW1pdCk7XG5cdHJldHVybiB7XG5cdFx0aGl0OiBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdHZhciBvbGRJbmRleCA9IG1hcFtpZF0sIG51SW5kZXggPSArK2luZGV4O1xuXHRcdFx0cXVldWVbbnVJbmRleF0gPSBpZDtcblx0XHRcdG1hcFtpZF0gPSBudUluZGV4O1xuXHRcdFx0aWYgKCFvbGRJbmRleCkge1xuXHRcdFx0XHQrK3NpemU7XG5cdFx0XHRcdGlmIChzaXplIDw9IGxpbWl0KSByZXR1cm47XG5cdFx0XHRcdGlkID0gcXVldWVbYmFzZV07XG5cdFx0XHRcdGRlbChpZCk7XG5cdFx0XHRcdHJldHVybiBpZDtcblx0XHRcdH1cblx0XHRcdGRlbGV0ZSBxdWV1ZVtvbGRJbmRleF07XG5cdFx0XHRpZiAoYmFzZSAhPT0gb2xkSW5kZXgpIHJldHVybjtcblx0XHRcdHdoaWxlICghaGFzT3duUHJvcGVydHkuY2FsbChxdWV1ZSwgKytiYXNlKSkgY29udGludWU7IC8vanNsaW50OiBza2lwXG5cdFx0fSxcblx0XHRkZWxldGU6IGRlbCA9IGZ1bmN0aW9uIChpZCkge1xuXHRcdFx0dmFyIG9sZEluZGV4ID0gbWFwW2lkXTtcblx0XHRcdGlmICghb2xkSW5kZXgpIHJldHVybjtcblx0XHRcdGRlbGV0ZSBxdWV1ZVtvbGRJbmRleF07XG5cdFx0XHRkZWxldGUgbWFwW2lkXTtcblx0XHRcdC0tc2l6ZTtcblx0XHRcdGlmIChiYXNlICE9PSBvbGRJbmRleCkgcmV0dXJuO1xuXHRcdFx0aWYgKCFzaXplKSB7XG5cdFx0XHRcdGluZGV4ID0gMDtcblx0XHRcdFx0YmFzZSA9IDE7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHdoaWxlICghaGFzT3duUHJvcGVydHkuY2FsbChxdWV1ZSwgKytiYXNlKSkgY29udGludWU7IC8vanNsaW50OiBza2lwXG5cdFx0fSxcblx0XHRjbGVhcjogZnVuY3Rpb24gKCkge1xuXHRcdFx0c2l6ZSA9IDA7XG5cdFx0XHRiYXNlID0gMTtcblx0XHRcdHF1ZXVlID0gY3JlYXRlKG51bGwpO1xuXHRcdFx0bWFwID0gY3JlYXRlKG51bGwpO1xuXHRcdFx0aW5kZXggPSAwO1xuXHRcdH1cblx0fTtcbn07XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/lru-queue/index.js\n");

/***/ })

};
;