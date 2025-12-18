"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "instrumentation";
exports.ids = ["instrumentation"];
exports.modules = {

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ "(instrument)/./instrumentation.ts":
/*!****************************!*\
  !*** ./instrumentation.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   register: () => (/* binding */ register)\n/* harmony export */ });\nasync function register() {\n    if (true) {\n        const { spawn } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! child_process */ \"child_process\", 23));\n        const path = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! path */ \"path\", 23));\n        const backendDir = path.join(process.cwd(), \"backend\");\n        console.log(\"Starting FastAPI backend on port 8000...\");\n        const fastApiProcess = spawn(\"python\", [\n            \"-m\",\n            \"uvicorn\",\n            \"app.main:app\",\n            \"--host\",\n            \"0.0.0.0\",\n            \"--port\",\n            \"8000\"\n        ], {\n            cwd: backendDir,\n            stdio: \"inherit\",\n            env: process.env\n        });\n        fastApiProcess.on(\"error\", (err)=>{\n            console.error(\"Failed to start FastAPI:\", err);\n        });\n        fastApiProcess.on(\"exit\", (code)=>{\n            console.log(`FastAPI process exited with code ${code}`);\n        });\n        process.on(\"SIGTERM\", ()=>{\n            fastApiProcess.kill();\n        });\n        process.on(\"SIGINT\", ()=>{\n            fastApiProcess.kill();\n        });\n        await new Promise((resolve)=>setTimeout(resolve, 3000));\n        console.log(\"FastAPI backend should be ready on http://localhost:8000\");\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGluc3RydW1lbnQpLy4vaW5zdHJ1bWVudGF0aW9uLnRzIiwibWFwcGluZ3MiOiI7Ozs7QUFBTyxlQUFlQTtJQUNwQixJQUFJQyxJQUFxQyxFQUFFO1FBQ3pDLE1BQU0sRUFBRUcsS0FBSyxFQUFFLEdBQUcsTUFBTSxnSUFBdUI7UUFDL0MsTUFBTUMsT0FBTyxNQUFNLDhHQUFjO1FBRWpDLE1BQU1DLGFBQWFELEtBQUtFLElBQUksQ0FBQ04sUUFBUU8sR0FBRyxJQUFJO1FBRTVDQyxRQUFRQyxHQUFHLENBQUM7UUFFWixNQUFNQyxpQkFBaUJQLE1BQ3JCLFVBQ0E7WUFBQztZQUFNO1lBQVc7WUFBZ0I7WUFBVTtZQUFXO1lBQVU7U0FBTyxFQUN4RTtZQUNFSSxLQUFLRjtZQUNMTSxPQUFPO1lBQ1BWLEtBQUtELFFBQVFDLEdBQUc7UUFDbEI7UUFHRlMsZUFBZUUsRUFBRSxDQUFDLFNBQVMsQ0FBQ0M7WUFDMUJMLFFBQVFNLEtBQUssQ0FBQyw0QkFBNEJEO1FBQzVDO1FBRUFILGVBQWVFLEVBQUUsQ0FBQyxRQUFRLENBQUNHO1lBQ3pCUCxRQUFRQyxHQUFHLENBQUMsQ0FBQyxpQ0FBaUMsRUFBRU0sS0FBSyxDQUFDO1FBQ3hEO1FBRUFmLFFBQVFZLEVBQUUsQ0FBQyxXQUFXO1lBQ3BCRixlQUFlTSxJQUFJO1FBQ3JCO1FBRUFoQixRQUFRWSxFQUFFLENBQUMsVUFBVTtZQUNuQkYsZUFBZU0sSUFBSTtRQUNyQjtRQUVBLE1BQU0sSUFBSUMsUUFBUSxDQUFDQyxVQUFZQyxXQUFXRCxTQUFTO1FBQ25EVixRQUFRQyxHQUFHLENBQUM7SUFDZDtBQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcmVzdC1leHByZXNzLy4vaW5zdHJ1bWVudGF0aW9uLnRzP2Q3ZDciXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlZ2lzdGVyKCkge1xuICBpZiAocHJvY2Vzcy5lbnYuTkVYVF9SVU5USU1FID09PSBcIm5vZGVqc1wiKSB7XG4gICAgY29uc3QgeyBzcGF3biB9ID0gYXdhaXQgaW1wb3J0KFwiY2hpbGRfcHJvY2Vzc1wiKTtcbiAgICBjb25zdCBwYXRoID0gYXdhaXQgaW1wb3J0KFwicGF0aFwiKTtcbiAgICBcbiAgICBjb25zdCBiYWNrZW5kRGlyID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIFwiYmFja2VuZFwiKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhcIlN0YXJ0aW5nIEZhc3RBUEkgYmFja2VuZCBvbiBwb3J0IDgwMDAuLi5cIik7XG4gICAgXG4gICAgY29uc3QgZmFzdEFwaVByb2Nlc3MgPSBzcGF3bihcbiAgICAgIFwicHl0aG9uXCIsXG4gICAgICBbXCItbVwiLCBcInV2aWNvcm5cIiwgXCJhcHAubWFpbjphcHBcIiwgXCItLWhvc3RcIiwgXCIwLjAuMC4wXCIsIFwiLS1wb3J0XCIsIFwiODAwMFwiXSxcbiAgICAgIHtcbiAgICAgICAgY3dkOiBiYWNrZW5kRGlyLFxuICAgICAgICBzdGRpbzogXCJpbmhlcml0XCIsXG4gICAgICAgIGVudjogcHJvY2Vzcy5lbnYsXG4gICAgICB9XG4gICAgKTtcblxuICAgIGZhc3RBcGlQcm9jZXNzLm9uKFwiZXJyb3JcIiwgKGVycikgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzdGFydCBGYXN0QVBJOlwiLCBlcnIpO1xuICAgIH0pO1xuXG4gICAgZmFzdEFwaVByb2Nlc3Mub24oXCJleGl0XCIsIChjb2RlKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgRmFzdEFQSSBwcm9jZXNzIGV4aXRlZCB3aXRoIGNvZGUgJHtjb2RlfWApO1xuICAgIH0pO1xuXG4gICAgcHJvY2Vzcy5vbihcIlNJR1RFUk1cIiwgKCkgPT4ge1xuICAgICAgZmFzdEFwaVByb2Nlc3Mua2lsbCgpO1xuICAgIH0pO1xuXG4gICAgcHJvY2Vzcy5vbihcIlNJR0lOVFwiLCAoKSA9PiB7XG4gICAgICBmYXN0QXBpUHJvY2Vzcy5raWxsKCk7XG4gICAgfSk7XG5cbiAgICBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCAzMDAwKSk7XG4gICAgY29uc29sZS5sb2coXCJGYXN0QVBJIGJhY2tlbmQgc2hvdWxkIGJlIHJlYWR5IG9uIGh0dHA6Ly9sb2NhbGhvc3Q6ODAwMFwiKTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbInJlZ2lzdGVyIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUlVOVElNRSIsInNwYXduIiwicGF0aCIsImJhY2tlbmREaXIiLCJqb2luIiwiY3dkIiwiY29uc29sZSIsImxvZyIsImZhc3RBcGlQcm9jZXNzIiwic3RkaW8iLCJvbiIsImVyciIsImVycm9yIiwiY29kZSIsImtpbGwiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNldFRpbWVvdXQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(instrument)/./instrumentation.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(instrument)/./instrumentation.ts"));
module.exports = __webpack_exports__;

})();