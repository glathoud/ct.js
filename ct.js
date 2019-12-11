/*
  ct.js: Compile Time function execution in JavaScript

  Inspired from the CTFE of the D language.
  
  By G. Lathoud, December 2019 and later. Contact: glat@glat.info
  The Boost license apply, as described in the file ./LICENSE
*/


/* Example of use

    function _wr(name) { return `console.log("${name}",${name})`;}
 
    var f = ct( function (x) { ct.mixin(_wr("x"));; } );

  For more examples see the file ./index.html
*/

function ct( /*function | string*/f_or_code )
{
    var that = this;

    var code = ''+f_or_code;

    var new_code = code.replace( /ct\.(\w+)\(([\s\S]*)\);;/g
                                 , replace_one );

    var ret = new Function("return ("+new_code+")")();

    var eval_compatible_code = '('+ret+')';

    ret.toString = function () { return eval_compatible_code; };
    
    return ret;
    
    function replace_one( all, g1, g2 )
    {
        return ct[ g1 ].call( that, g2 );
    }
}

ct.mixin = function ( g2 )
{
    return (new Function ("return ("+g2+");")()) +";"
} 
