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

// --- Expression examples `ct...ct`

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

})();


(function () {

    // Variant with ct.map, and a short definition of `expr`
    
    const h = ct( ( a, b, c ) =>
    {
        // Local CT definition.  The next line is removed
        // by the `ct()` call.
        ct.def( expr, ( x, y, z ) => `(${x}+${y})/(${y}-${z})*${z}*${z}` ).ct

        return ct.map(expr)([
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

    // Variant with ct.map, and a short definition of `expr` and a
    // global constant
    
    const h = ct( ( a, b, c ) =>
    {
        // Local CT definition.  The next line is removed
        // by the `ct()` call.
        ct.def( expr, ( x, y, z ) => `(${x}+${y})/(${y}-${z})*${z}*${z}` ).ct
        
        return ct.map(expr)( CONSTANT ).ct;
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

})();

