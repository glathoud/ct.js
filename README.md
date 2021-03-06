# ct.js 

### Compile-Time Function Execution (CTFE) in JavaScript (inspired from the D language)

[[live page](https://glat.info/ct.js/)]

This is a minimalistic experiment with CTFE to generate performant code
while maintaining expressiveness. 

Main goals:
 * **Lightweight** dynamic transpilation of a few selected ECMAScript features for older browsers like IE11.
 * Easy dynamic generation of performant math and/or repetitive code, where needed (don't abuse...).
 * Build-time transformation, i.e. `ct.js` may easily be integrated into a build system.

Contents:
 * Minimalistic implementation: [ct.js](ct.js)
 * Examples: [expl.js](expl.js) - somewhat actual version copied below

```js
// --- Statement examples  `ct...ct;`

const _wr = (name) => `console.log("${name}",${name})`;

(function () {

    // Pure function: no closure needed
    
    const f = ct( (x) => { ct.mix(_wr("x")).ct; } );

    console.log(f);
    // js console output: ((x) => { console.log("x",x); })
    
    f(123); // js console output: x 123 
    f(456); // js console output: x 456
    f(789); // js console output: x 789
    
})();

(function () {

    // Closure needed: use `eval(''+ct(...))`
    
    var x = 1.234;
    const g = eval( ''+ct( () => { ct.mix(_wr("x++")).ct; } ) );

    console.log(g);
    // js console output: () => { console.log("x++",x++); }
    
    g(); // js console output: x++ 1.234
    g(); // js console output: x++ 2.234
    g(); // js console output: x++ 3.234
    
})();

// In fact, there is a shortcut for that particular `_wr` case
// (useful for debugging code)

(function () {

    // Pure function: no closure needed
    
    const f = ct( (x) => { ct.wr(x).ct; } );

    console.log(f);
    // js console output: ((x) => { console.log("x",x); })
    
    f(123); // js console output: x 123 
    f(456); // js console output: x 456
    f(789); // js console output: x 789
    
})();

(function () {

    // Closure needed: use `eval(''+ct(...))`
    
    var x = 1.234;
    const g = eval( ''+ct( () => { ct.wr(x++).ct; } ) );

    console.log(g);
    // js console output: () => { console.log("x++",x++); }
    
    g(); // js console output: x++ 1.234
    g(); // js console output: x++ 2.234
    g(); // js console output: x++ 3.234
    
})();

// --- Expression examples `ct...ct`

(function () {

    // see also: ct.last
    
    const h = ct( arr => ct.at( arr[$-1] ).ct + 3.45 );

    h( [ 10.0, 20.0, 30.0, 40.0 ] ) === 43.45  ||  null.bug;

})();

(function () {

    const h = ct( ( a, b, c ) =>
    {
        // Local CT definition.  These 3 lines are removed
        // by the `ct()` call.
        ct.def( function expr( /*string*/x, /*string*/y, /*string*/z ) {
            return `(${x}+${y})/(${y}-${z})*${z}*${z}`;
        }).ct

        return [
            ct.expr( 'a', 'b', 'c' ).ct
            , ct.expr( 'a', 'c', 'b' ).ct
            , ct.expr( 'b', 'a', 'c' ).ct
            , ct.expr( 'b', 'c', 'a' ).ct
            , ct.expr( 'c', 'a', 'b' ).ct
            , ct.expr( 'c', 'b', 'a' ).ct
        ];
    } );

    console.log( ''+h );

    /* js console output:
    
       (( a, b, c ) =>
       {
           // Local CT definition.  These 3 lines are removed
           // by the `ct()` call.
           
       
           return [
               (a+b)/(b-c)*c*c
               , (a+c)/(c-b)*b*b
               , (b+a)/(a-c)*c*c
               , (b+c)/(c-a)*a*a
               , (c+a)/(a-b)*b*b
               , (c+b)/(b-a)*a*a
           ];
       })
    */
    
    console.log( h( 1.0, 2.0, 3.0 ) );
    // js console output: [-27, 16, -13.5, 2.5, -16, 5]

    h( 1.0, 2.0, 3.0 ).join(',')
        === [-27, 16, -13.5, 2.5, -16, 5].join(',')
        ||  null.bug;
})();


(function () {

    // Variant with ct.emap, and a short definition of `expr`
    
    const h = ct( ( a, b, c ) =>
    {
        // Local CT definition.  The next line is removed
        // by the `ct()` call.
        ct.def( expr, ( x, y, z ) => `(${x}+${y})/(${y}-${z})*${z}*${z}` ).ct

        return ct.emap(expr)([
            [ 'a', 'b', 'c' ]
            , [ 'a', 'c', 'b' ]
            , [ 'b', 'a', 'c' ]
            , [ 'b', 'c', 'a' ]
            , [ 'c', 'a', 'b' ]
            , [ 'c', 'b', 'a' ]
        ]).ct;
    } );

    console.log( ''+h );

    /* js console output:
    
       (( a, b, c ) =>
       {
           // Local CT definition.  The next line is removed
           // by the `ct()` call.
           
      
           return [(a+b)/(b-c)*c*c
           , (a+c)/(c-b)*b*b
           , (b+a)/(a-c)*c*c
           , (b+c)/(c-a)*a*a
           , (c+a)/(a-b)*b*b
           , (c+b)/(b-a)*a*a];
       })
    */
    
    console.log( h( 1.0, 2.0, 3.0 ) );
    // js console output: [-27, 16, -13.5, 2.5, -16, 5]

    h( 1.0, 2.0, 3.0 ).join(',')
        === [-27, 16, -13.5, 2.5, -16, 5].join(',')
        ||  null.bug;
})();



const CONSTANT = [
    [ 'a', 'b', 'c' ]
    , [ 'a', 'c', 'b' ]
    , [ 'b', 'a', 'c' ]
    , [ 'b', 'c', 'a' ]
    , [ 'c', 'a', 'b' ]
    , [ 'c', 'b', 'a' ]
];

(function () {

    // Variant with ct.emap, and a short definition of `expr` and a
    // global constant
    
    const h = ct( ( a, b, c ) =>
    {
        // Local CT definition.  The next line is removed
        // by the `ct()` call.
        ct.def( expr, ( x, y, z ) => `(${x}+${y})/(${y}-${z})*${z}*${z}` ).ct
        
        return ct.emap(expr)( CONSTANT ).ct;
    } );

    console.log( ''+h );

    /* js console output:
    
       (( a, b, c ) =>
       {
           // Local CT definition.  The next line is removed
           // by the `ct()` call.
           
      
           return [(a+b)/(b-c)*c*c
           , (a+c)/(c-b)*b*b
           , (b+a)/(a-c)*c*c
           , (b+c)/(c-a)*a*a
           , (c+a)/(a-b)*b*b
           , (c+b)/(b-a)*a*a];
       })
    */
    
    console.log( h( 1.0, 2.0, 3.0 ) );
    // js console output: [-27, 16, -13.5, 2.5, -16, 5]

    h( 1.0, 2.0, 3.0 ).join(',')
        === [-27, 16, -13.5, 2.5, -16, 5].join(',')
        ||  null.bug;
})();

(function () {

    const h = ct( ( a, b, c ) =>
    {
        // Local CT definition.  The next line is removed
        // by the `ct()` call.
        ct.def( expr, ( x, y, z ) => `(${x}+${y})/(${y}-${z})*${z}*${z}` ).ct

        return ct.emap(expr)({
            p : [ 'a', 'b', 'c' ]
            , q : [ 'a', 'c', 'b' ]
            , r : [ 'b', 'a', 'c' ]
            , s : [ 'b', 'c', 'a' ]
            , t : [ 'c', 'a', 'b' ]
            , u : [ 'c', 'b', 'a' ]
        }).ct;
    } );

    console.log( ''+h );
    /* js console output:

       (( a, b, c ) =>
       {
           // Local CT definition.  The next line is removed
           // by the `ct()` call.
           
       
           return {p : (a+b)/(b-c)*c*c
           , q : (a+c)/(c-b)*b*b
           , r : (b+a)/(a-c)*c*c
           , s : (b+c)/(c-a)*a*a
           , t : (c+a)/(a-b)*b*b
           , u : (c+b)/(b-a)*a*a};
       })
    */

    console.log( h( 1.0, 2.0, 3.0 ) );
    // js console output: {p:-27, q:16, r:-13.5, s:2.5, t:-16, u:5}

    JSON.stringify(h( 1.0, 2.0, 3.0 ))
        === JSON.stringify({p:-27, q:16, r:-13.5, s:2.5, t:-16, u:5})
        ||  null.bug;
    
})();





(function () {

    // Variant with ct.emap, a short definition of `expr`, and
    // shortcut comma-separated strings like 'a,b,c'.
    
    const h = ct( ( a, b, c ) =>
    {
        // Local CT definition.  The next line is removed
        // by the `ct()` call.
        ct.def( expr, ( x, y, z ) => `(${x}+${y})/(${y}-${z})*${z}*${z}` ).ct

        return ct.emap(expr)([
            'a,b,c'
            , 'a,c,b'
            , 'b,a,c'
            , 'b,c,a'
            , 'c,a,b'
            , 'c,b,a'
        ]).ct;
    } );

    console.log( ''+h );

    /* js console output:
    
       (( a, b, c ) =>
       {
           // Local CT definition.  The next line is removed
           // by the `ct()` call.
           
      
           return [(a+b)/(b-c)*c*c
           , (a+c)/(c-b)*b*b
           , (b+a)/(a-c)*c*c
           , (b+c)/(c-a)*a*a
           , (c+a)/(a-b)*b*b
           , (c+b)/(b-a)*a*a];
       })
    */
    
    console.log( h( 1.0, 2.0, 3.0 ) );
    // js console output: [-27, 16, -13.5, 2.5, -16, 5]

    h( 1.0, 2.0, 3.0 ).join(',')
        === [-27, 16, -13.5, 2.5, -16, 5].join(',')
        ||  null.bug;
})();



const CONSTANT2 = [
    'a,b,c'
    , 'a,c,b'
    , 'b,a,c'
    , 'b,c,a'
    , 'c,a,b'
    , 'c,b,a'
];

(function () {

    // Variant with ct.emap, a short definition of `expr`, a global
    // constant, and shortcut comma-separated strings like 'a,b,c'.
    
    const h = ct( ( a, b, c ) =>
    {
        // Local CT definition.  The next line is removed
        // by the `ct()` call.
        ct.def( expr, ( x, y, z ) => `(${x}+${y})/(${y}-${z})*${z}*${z}` ).ct
        
        return ct.emap(expr)( CONSTANT ).ct;
    } );

    console.log( ''+h );

    /* js console output:
    
       (( a, b, c ) =>
       {
           // Local CT definition.  The next line is removed
           // by the `ct()` call.
           
      
           return [(a+b)/(b-c)*c*c
           , (a+c)/(c-b)*b*b
           , (b+a)/(a-c)*c*c
           , (b+c)/(c-a)*a*a
           , (c+a)/(a-b)*b*b
           , (c+b)/(b-a)*a*a];
       })
    */
    
    console.log( h( 1.0, 2.0, 3.0 ) );
    // js console output: [-27, 16, -13.5, 2.5, -16, 5]

    h( 1.0, 2.0, 3.0 ).join(',')
        === [-27, 16, -13.5, 2.5, -16, 5].join(',')
        ||  null.bug;
})();


(function () {

    const h = ct( ( a, b, c ) =>
    {
        // Local CT definition.  The next line is removed
        // by the `ct()` call.
        ct.def( expr, ( x, y, z ) => `(${x}+${y})/(${y}-${z})*${z}*${z}` ).ct

        return ct.emap(expr)({
            p : 'a,b,c'
            , q : 'a,c,b'
            , r : 'b,a,c'
            , s : 'b,c,a'
            , t : 'c,a,b'
            , u : 'c,b,a'
        }).ct;
    } );

    console.log( ''+h );
    /* js console output:

       (( a, b, c ) =>
       {
           // Local CT definition.  The next line is removed
           // by the `ct()` call.
           
       
           return {p : (a+b)/(b-c)*c*c
           , q : (a+c)/(c-b)*b*b
           , r : (b+a)/(a-c)*c*c
           , s : (b+c)/(c-a)*a*a
           , t : (c+a)/(a-b)*b*b
           , u : (c+b)/(b-a)*a*a};
       })
    */

    console.log( h( 1.0, 2.0, 3.0 ) );
    // js console output: {p:-27, q:16, r:-13.5, s:2.5, t:-16, u:5}

    JSON.stringify(h( 1.0, 2.0, 3.0 ))
        === JSON.stringify({p:-27, q:16, r:-13.5, s:2.5, t:-16, u:5})
        ||  null.bug;
    
})();



(function () {

    const f = ct( arr => {

        var ret = [];

        ct.afor( i, arr ).ct
        {
            ret.push( i, arr[ i ] );
        }
        
        return ret;
    } );

    f( [ 1, 20, 300, 4000 ] ).join( ',' )
        === [0,1,1,20,2,300,3,4000].join( ',' )
        ||  null.bug;
    
})();

(function () {

    const sum = ct( arr => {

        var sum = 0;

        ct.afor( i, arr ).ct
        {
            sum += arr[i];
        }
        
        return sum;
    } );

    sum( [ 1, 20, 300, 4000 ] ) === 4321  ||  null.bug;
    
})();

(function () {

    const f = ct( arr => {

        var ret = 0;

        ct.afor( i, arr ).ct
            ret += i * arr[i];
        
        return ret;
    } );

    f( [ 1, 20, 300, 4000 ] ) === 12620  ||  null.bug;
    
})();


(function () {

    const f = ct( arr => {

        var ret = 0;

        ct.arof( i, arr ).ct
        {
            ret += i * arr[i];
        }
        
        return ret;
    } );

    f( [ 1, 20, 300, 4000 ] ) === 12620  ||  null.bug;
    
})();


(function () {

    const f = ct( arr => {

        var ret = [];

        ct.arof( i, arr ).ct
        {
            ret.push( i, arr[i] );
        }
        
        return ret;
    } );

    f( [ 1, 20, 300, 4000 ] ).join(',')
        === [3,4000,2,300,1,20,0,1].join(',')
        ||  null.bug;
    
})();



(function () {

    // see also: ct.at
    
    const h = ct( arr => ct.last( arr ).ct + 3.45 );

    h( [ 10.0, 20.0, 30.0, 40.0 ] ) === 43.45  ||  null.bug;

})();


(function () {

    // Concise object definition

    var f = ct( (o,a,b,c) => {
        var d = a*3+b-2
        ,   e = Math.sin( d*d-36 )
        ;
        return ct.obj( {a,b,c,d,e,q : d-e, some_long_one : o.$} ).ct;
    });

    console.log( ''+f );
    /* js console output:

       ((o,a,b,c) => {
           var d = a*3+b-2
           ,   e = Math.sin( d*d-36 )
           ;
           return {a : a
           , b : b
           , c : c
           , d : d
           , e : e
           , q : d-e
           , some_long_one : o. some_long_one};
       })
    */

    JSON.stringify( f( { some_long_one : 12345 }, 1.0, 20.0, 300.0 ) )
        === `{"a":1,"b":20,"c":300,"d":21,"e":0.26234576530777837`
        +`,"q":20.737654234692222,"some_long_one":12345}`
        ||  null.bug;
})();


ct(function () {

    // Object destructuring as expression.
    
    var a;
    var q,c,r;
    //...
    a = {b:1,c:2,d:{e:'fgh'}}
    ,(ct.ode( {b:q,c,d:r} = a).ct)
    ,JSON.stringify([q,c,r])===JSON.stringify([1,2,{e:'fgh'}])  ||  null.bug;
    
})();


ct(function () {

    // Object destructuring as `var` declaration statement.
    
    var a = {b:1,c:2,d:{e:'fgh'}};
    ct.odev( {b:q,c,d:r} = a ).ct; 
    JSON.stringify([q,c,r])===JSON.stringify([1,2,{e:'fgh'}])  ||  null.bug;

})();


(function () {

    var f = ct( (o) => {

        var ret = [];

        ct.ofor( k, o ).ct
        {
            ret.push( [ k, o[ k ] ] );
        }

        ret.sort( (a,b) => a[0] < b[0]  ?  -1
                  :  a[0] > b[0]  ?  +1
                  :  0 );

        return ret;
    });


    var o0 = {a : 1, b : 2, c : 3}
    ,   o  = Object.create( o0 )
    ;
    o.d = 4; o.e = 5; o.f = 6;

    JSON.stringify( f( o ) )
        === '[["a",1],["b",2],["c",3],["d",4],["e",5],["f",6]]'
        ||  null.bug;
})();


(function () {

    // ?. optional chaining operator

    const f = ct( (o) => ct.opt( o.a.b.c ).ct  ||  null );

    console.log( ''+f );
    /* js console output:
       ((o) =>  o
               && ct._tmp =  o.a)
               && ct._tmp = ct._tmp.b)
               && ct._tmp.c )  ||  null)
    */   

    console.log( f( {} ) ); // js console output: null

    console.log( f( {a:{b:{}}} ) ) // js console output: null

    console.log( f( {a:{b:{c:123456}}} ) ) // js console output: 123456

    f({}) === null  ||  null.bug;
    f({a:{b:{}}}) === null  ||  null.bug;
    f( {a:{b:{c:123456}}} ) === 123456  ||  null.bug;
    
})();

(function () {

    // ?. optional chaining operator (explicit variant that should
    // make removing ct.js easier in the future).

    const f = ct( (o) => ct.opt( "o?.a?.b?.c" ).ct  ||  null );

    console.log( ''+f );
    /* js console output:
       ((o) =>  o
               && ct._tmp =  o.a)
               && ct._tmp = ct._tmp.b)
               && ct._tmp.c )  ||  null)
    */   

    console.log( f( {} ) ); // js console output: null

    console.log( f( {a:{b:{}}} ) ) // js console output: null

    console.log( f( {a:{b:{c:123456}}} ) ) // js console output: 123456

    f({}) === null  ||  null.bug;
    f({a:{b:{}}}) === null  ||  null.bug;
    f( {a:{b:{c:123456}}} ) === 123456  ||  null.bug;
    
})();

(function () {

    // ?. optional chaining operator (explicit variant that should
    // make removing ct.js easier in the future).

    const f = ct( (o) => ct.opt( 'o?.a?.b?.c' ).ct  ||  null );

    console.log( ''+f );
    /* js console output:
       ((o) =>  o
               && ct._tmp =  o.a)
               && ct._tmp = ct._tmp.b)
               && ct._tmp.c )  ||  null)
    */   

    console.log( f( {} ) ); // js console output: null

    console.log( f( {a:{b:{}}} ) ) // js console output: null

    console.log( f( {a:{b:{c:123456}}} ) ) // js console output: 123456

    f({}) === null  ||  null.bug;
    f({a:{b:{}}}) === null  ||  null.bug;
    f( {a:{b:{c:123456}}} ) === 123456  ||  null.bug;
    
})();

(function () {

    // ?. optional chaining operator (extended)

    const f = ct( (o) => ct.opt( o[1].b["?"].d ).ct  ||  null );

    console.log( ''+f );
    /* js console output:
       ((o) =>  o
               && ct._tmp =  o[1])
               && ct._tmp = ct._tmp.b)
               && ct._tmp = ct._tmp["?"])
               && ct._tmp.d )  ||  null)
    */   

    console.log( f( [] ) ); // js console output: null

    console.log( f( [0,{b:{}}] ) ) // js console output: null

    console.log( f( [0,{b:{"?":{d:789}}}] ) ) // js console output: 789

    f([]) === null  ||  null.bug;
    f( [0,{b:{}}] ) === null  ||  null.bug;
    f( [0,{b:{"?":{d:789}}}] ) === 789  ||  null.bug;
})();

(function () {

    // Require an object

    const f = ct( (o) => ct.oreq( o.a.b.c.d ).ct );

    console.log( ''+f );
    /* js console output:
     ((o) => (  o  ||  ( o = {})
             , ct._tmp =  o.a  ||  ( o.a = {}))
             , ct._tmp = ct._tmp.b  ||  ct._tmp.b = {}))
             , ct._tmp = ct._tmp.c  ||  ct._tmp.c = {}))
             , ct._tmp.d   ||  ct._tmp.d  = {})) ))
    */

    var o = {}
    ,   d = f( o )
    ;
    JSON.stringify( o ) === `{"a":{"b":{"c":{"d":{}}}}}`  ||  null.bug;
    JSON.stringify( d ) === `{}`  ||  null.bug;
    d === o.a.b.c.d  ||  null.bug;
    
})();

(function () {

    // Require an object

    const f = ct( (o) => ct.oreq( o[1].b["?"].d ).ct );

    console.log( ''+f );
    /* js console output:
    ((o) => (  o  ||  ( o = {})
       , ct._tmp =  o[1]  ||  ( o[1] = {}))
       , ct._tmp = ct._tmp.b  ||  ct._tmp.b = {}))
       , ct._tmp = ct._tmp["?"]  ||  ct._tmp["?"] = {}))
       , ct._tmp.d   ||  ct._tmp.d  = {})) ))
    */

    var a = []
    ,   d = f( a )
    ;
    JSON.stringify( a ) === `[null,{"b":{"?":{"d":{}}}}]` ||  null.bug;
    JSON.stringify( d ) === `{}`  ||  null.bug;
    d === a[1].b["?"].d  ||  null.bug;
    
})();

ct(function () {

    var x = 1, o = { y : { z : 2 } };

    var s = ct.tli( 'x has the value ${x} and z*3.45 has the value ${o.y.z*3.45}' ).ct;

    s === 'x has the value 1 and z*3.45 has the value 6.9'
        ||  null.bug;

})();
```
