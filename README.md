# ct.js

Compile-time function execution in JavaScript (inspired from the D language)

Ugly proof of concept:
```js
function _wr(name) { return `console.log("${name}",${name})`;} _wr('abc'); var f = ct( function (x) { ct.mixin(_wr("x"));; } ); function ct( f_or_code ) { var code = ''+f_or_code;
var new_code = code.replace( /ct\.mixin\(([\s\S]*)\);;/g, sub );  function sub(all,g1,){return eval(g1)+";"} console.log("new_code: ", new_code); return eval("("+new_code+")");
}
```

Clean code: [ct.js](ct.js)

Examples: [expl.js](expl.js)

TODO: write-up in [index.html](index.html)
