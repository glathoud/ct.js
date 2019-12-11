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

// ct.* tools

ct.def   = function ( /*function | name, function*/g2 )
{
    var x, name;
    try
    {
        // ct.def( function name (...) {...} )
        x = ct._eval( g2 );
        'function' === typeof x  ||  null.must_be_a_function;
        name = x.name;
    }
    catch (e)
    {
        // ct.def( name, (...) => {...} )
        var mo = g2.match( /^\s*(\w+)\s*,([\s\S]+)$/ );
        name = mo[ 1 ];
        x    = ct._eval( mo[ 2 ] );
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
    
    var mo = g2.match( /^\s*([^\)]+)\s*\)([\s\S]*)$/ )
    , name = mo[ 1 ]
    , rest = mo[ 2 ]
    ;
    name  ||  null.missing_name;
    rest  ||  null.missing_rest;

    var f = cache[ name ]  ||  ct[ name ]
    , arr = ct._eval( rest+')' )
    ;
    return '['+arr.map( v => f.apply( cache, v ) ).join( '\n        , ' )+']';
}

ct.mix = function ( g2 )
{
    return ct._eval( g2 );
}; 
