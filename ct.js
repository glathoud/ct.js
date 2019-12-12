/*global ct*/

/*
  ct.js: Compile Time Function Execution (CTFE) in JavaScript

  Inspired from the CTFE of the D language, ct.js permits to
  generate efficient code while maintaining expressiveness.
  
  By G. Lathoud, December 2019 and later. Contact: glat@glat.info
  The Boost license apply, as described in the file ./LICENSE
*/


/* Example of use

    function _wr(name) { return `console.log("${name}",${name})`;}
 
    var f = ct( function (x) { ct.mix(_wr("x"));; } );

  For more examples see the file ./expl.js
*/

function ct( /*function | string*/f_or_code )
{
    var cache = {};

    var code = ''+f_or_code;

    var new_code = code.replace( /ct\.(\w+)\(([\s\S]*?)\).ct/g
                                 , replace_one );

    var ret = ct._eval( new_code );

    var eval_compatible_code = '('+ret+')';

    ret.toString = function () { return eval_compatible_code; };
    
    return ret;

    function replace_one( _, g1, g2 )
    {
        if (cache[ g1 ])
            return ct._eval.call( cache[ g1 ], 'this('+g2+')' );
        
        if (ct[ g1 ])
            return ct[ g1 ].call( cache, g2 );
        
        null.unknown;
    }

}

// internals

ct._eval   = function ( code ) {
    return new Function("return ("+code+")").call( this );
};

ct._tab    = '        ';

ct.TMP     = '__CT_TMP__';

// ct.* tools

ct.def   = function ( /*function | name, function*/g2 )
{
    var x, name;
    
    // ct.def( name, (...) => {...} )
    var mo = g2.match( /^\s*(\w+)\s*,([\s\S]+)$/ );
    if (mo)
    {
        name = mo[ 1 ];
        x    = ct._eval( mo[ 2 ] );
    }
    else
    {
        // ct.def( function name (...) {...} )
        x = ct._eval( g2 );
        'function' === typeof x  ||  null.must_be_a_function;
        name = x.name;
    }
    name  ||  null.missing_name;
    x.call.a;
    
    var cache = this;
    cache[ name ] = x;

    return '';  // Code removed
};

ct.map = function ( /*(...)(...)*/g2 )
{
    var cache = this;
    
    var mo = g2.match( /^\s*(\w+)\s*\)([\s\S]*)$/ )
    , name = mo[ 1 ]
    , rest = mo[ 2 ]
    ;
    name  ||  null.missing_name;
    rest  ||  null.missing_rest;

    var f = cache[ name ]  ||  ct[ name ]
    , arr = ct._eval( rest+')' )
    ;
    return '['+arr.map( function ( v ) { return f.apply( cache, v ); } ).join( '\n'+ct._tab+', ' )+']';
}

ct.mix = function ( g2 )
{
    return ct._eval( g2 );
}; 

ct.obj = function ( g2 )
{
    var core = g2.match( /^\s*\{(.*)\}\s*$/ )[ 1 ];
    
    return '{'+ (core.split( ',' ).map( _ct_obj_one ).join( '\n'+ct._tab+', '))+'}';

    function _ct_obj_one( one )
    {
        var a = one.split( ':' )
        ,   a0
        ,   a1
        ;
        if (a.length === 1)
        {
            a0 = a1 = a[ 0 ];
        }
        else if (a.length === 2)
        {
            a0 = a[ 0 ];
            a1 = a[ 1 ].replace( /\$/g, a0 );
        }
        else
        {
            null.invalid;
        }

        return a0.replace( /^\s*|\s*$/g, '' ) + ' : ' + a1.replace( /^\s*|\s*$/g, '' );
    }
}


ct.opt = function ( g2 )
/* Fetch an optional value. This is equivalent to the `.?` operator.

Example:

    const f = ct( (o) => ct.opt( o,(1).b,"?".d ).ct  ||  null );

    console.log( f( [] ) ); // js console output: null

    console.log( f( [0,{b:{}}] ) ) // js console output: null

    console.log( f( [0,{b:{"?":{d:789}}}] ) ) // js console output: 789
*/
{
    var mo = g2.match( /\s*(?:^|[\.\[])[^\.\[]+\s*/g )
    ,  nm1 = mo.length - 1
    ;
    return mo.map( _ct_opt_one ).join( '\n'+ct._tab+'&& ' );

    var _first;
    function _ct_opt_one( s, i )
    {
        if (i === 0)
            return _first = s;

        if (i === nm1)
            return '('+ct.TMP+''+s+')';

        if (i === 1)
            return '('+ct.TMP+' = '+_first+s+')';
        
        return '('+ct.TMP+' = '+ct.TMP+''+s+')';
    }
};

ct.req = function ( g2 )
/* Ensure and fetch an object.

Example:

    const f = ct( (o) => ct.req( o,(1).b,"?".d ).ct );

    var a = []
    ,   d = f( a )
    ;
    console.log(JSON.stringify( a ));// [null,{"b":{"?":{"d":{}}}}]
    console.log(JSON.stringify( d ));// {}
    console.log(d === a[1].b["?"].d);// true
*/
{
    var mo = g2.match( /\s*(?:^|[\.\[])[^\.\[]+\s*/g )
    ,  nm1 = mo.length - 1
    ;
    return '( '+mo.map( _ct_req_one ).join( '\n'+ct._tab+', ' )+' )';

    var _first;
    function _ct_req_one( s, i )
    {
        if (i === 0)
            return _ct_req( _first = s );

        if (i === nm1)
            return '('+_ct_req( ct.TMP+s )+')';

        if (i === 1)
            return '('+ct.TMP+' = '+_ct_req( _first+s )+')';
        
        return '('+ct.TMP+' = '+_ct_req( ct.TMP+''+s )+')';
    }

    function _ct_req( s )
    {
        return s+'  ||  ('+s+' = {})';
    }
};

ct.wr = function ( g2 )
/* `ct.wr(g2).ct` is a shortcut for `ct.mix(_wr("<g2>")).ct`

Example:

    const f = ct( (x) => { ct.wr(x).ct; } );

    console.log(f); // js console output: ((x) => { console.log("x",x); })
    
    f(123); // js console output: x 123 
    f(456); // js console output: x 456
    f(789); // js console output: x 789
*/
{
    return 'console.log("'+g2.replace(/"/g,'\\"')+'",'+g2+')';
}
