// --- Statement examples  `ct...ct;`

const _wr = (name) => `console.log("${name}",${name})`;

(function () {

    // Pure function: no closure needed
    
    const f = ct( (x) => { ct.mix(_wr("x")).ct; } );

    console.log(f); // js console output: ((x) => { console.log("x",x); })
    
    f(123); // js console output: x 123 
    f(456); // js console output: x 456
    f(789); // js console output: x 789
    
})();

(function () {

    // Closure needed: use `eval(''+ct(...))`
    
    var x = 1.234;
    const g = eval( ''+ct( () => { ct.mix(_wr("x++")).ct; } ) );

    console.log(g); // js console output: () => { console.log("x++",x++); }
    
    g(); // js console output: x++ 1.234
    g(); // js console output: x++ 2.234
    g(); // js console output: x++ 3.234
    
})();

// In fact, there is a shortcut for that particular `_wr` case
// (useful for debugging code)

(function () {

    // Pure function: no closure needed
    
    const f = ct( (x) => { ct.wr(x).ct; } );

    console.log(f); // js console output: ((x) => { console.log("x",x); })
    
    f(123); // js console output: x 123 
    f(456); // js console output: x 456
    f(789); // js console output: x 789
    
})();

(function () {

    // Closure needed: use `eval(''+ct(...))`
    
    var x = 1.234;
    const g = eval( ''+ct( () => { ct.wr(x++).ct; } ) );

    console.log(g); // js console output: () => { console.log("x++",x++); }
    
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

    h( 1.0, 2.0, 3.0 ).join(',') === [-27, 16, -13.5, 2.5, -16, 5].join(',')  ||  null.bug;
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

    h( 1.0, 2.0, 3.0 ).join(',') === [-27, 16, -13.5, 2.5, -16, 5].join(',')  ||  null.bug;
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

    h( 1.0, 2.0, 3.0 ).join(',') === [-27, 16, -13.5, 2.5, -16, 5].join(',')  ||  null.bug;
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

        ct.aforev( i, arr ).ct
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

        ct.aforev( i, arr ).ct
        {
            ret.push( i, arr[i] );
        }
        
        return ret;
    } );

    f( [ 1, 20, 300, 4000 ] ).join(',') === [3,4000,2,300,1,20,0,1].join(',')  ||  null.bug;
    
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
    console.log( JSON.stringify( f( { some_long_one : 12345 }, 1.0, 20.0, 300.0 ) ) );
    // js console.output: {"a":1,"b":20,"c":300,"d":21,"e":0.26234576530777837,"q":20.737654234692222,"some_long_one":12345}

    JSON.stringify( f( { some_long_one : 12345 }, 1.0, 20.0, 300.0 ) )
        === `{"a":1,"b":20,"c":300,"d":21,"e":0.26234576530777837,"q":20.737654234692222,"some_long_one":12345}`
        ||  null.bug;
})();


(function () {

    // .? operator

    const f = ct( (o) => ct.opt( o.a.b.c ).ct  ||  null );

    console.log( ''+f );
    /* js console output:
       ((o) =>  o
               && (__CT_TMP__ =  o.a)
               && (__CT_TMP__ = __CT_TMP__.b)
               && (__CT_TMP__.c )  ||  null)
    */   

    console.log( f( {} ) ); // js console output: null

    console.log( f( {a:{b:{}}} ) ) // js console output: null

    console.log( f( {a:{b:{c:123456}}} ) ) // js console output: 123456

    f({}) === null  ||  null.bug;
    f({a:{b:{}}}) === null  ||  null.bug;
    f( {a:{b:{c:123456}}} ) === 123456  ||  null.bug;
    
})();

(function () {

    // .? operator

    const f = ct( (o) => ct.opt( o[1].b["?"].d ).ct  ||  null );

    console.log( ''+f );
    /* js console output:
       ((o) =>  o
               && (__CT_TMP__ =  o[1])
               && (__CT_TMP__ = __CT_TMP__.b)
               && (__CT_TMP__ = __CT_TMP__["?"])
               && (__CT_TMP__.d )  ||  null)
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

    const f = ct( (o) => ct.req( o.a.b.c.d ).ct );

    console.log( ''+f );
    /* js console output:
     ((o) => (  o  ||  ( o = {})
             , (__CT_TMP__ =  o.a  ||  ( o.a = {}))
             , (__CT_TMP__ = __CT_TMP__.b  ||  (__CT_TMP__.b = {}))
             , (__CT_TMP__ = __CT_TMP__.c  ||  (__CT_TMP__.c = {}))
             , (__CT_TMP__.d   ||  (__CT_TMP__.d  = {})) ))
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

    const f = ct( (o) => ct.req( o[1].b["?"].d ).ct );

    console.log( ''+f );
    /* js console output:
    ((o) => (  o  ||  ( o = {})
       , (__CT_TMP__ =  o[1]  ||  ( o[1] = {}))
       , (__CT_TMP__ = __CT_TMP__.b  ||  (__CT_TMP__.b = {}))
       , (__CT_TMP__ = __CT_TMP__["?"]  ||  (__CT_TMP__["?"] = {}))
       , (__CT_TMP__.d   ||  (__CT_TMP__.d  = {})) ))
    */

    var a = []
    ,   d = f( a )
    ;
    JSON.stringify( a ) === `[null,{"b":{"?":{"d":{}}}}]` ||  null.bug;
    JSON.stringify( d ) === `{}`  ||  null.bug;
    d === a[1].b["?"].d  ||  null.bug;
    
})();
