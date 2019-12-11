function write_source_code( contnode, x, opt )
{
    var i_write = write_source_code.n | 0;

    var cstmpl = opt  &&  opt.cstmpl
        || {innerHTML : '<p class="code_cont_header" id="$domid"><a href="$filename">$filename</a>:</p><pre><code class="prettyprint lang-js">$sourcecode</code></pre>'};

    var do_the_unittests = opt  &&  opt.do_the_unittests;
    
    write_source_code.n = 1 + i_write;
    

    if ('function' === typeof x)
    {
        var filename = opt  ||  x.name
        ,   c_arr    = x().map( unindent )
        ;
        setTimeout( function () {
            receive_source_code(
                {
                    target : {
                        responseText : c_arr.join( '\n\n\n' )
                    }
                }
            );
        }, 100 );
    }
    else
    {
        var filename = x
        ,   xhr = new XMLHttpRequest()
        ;
        try {
            xhr.addEventListener( "load", receive_source_code );
            xhr.open( "GET", filename, /*async:*/true );
            xhr.send();
        } catch( e ) {
            write_source_code.n--;
            return;
        }
    }

    if (window.toc  &&  window.toctmpl)
    {
        toc.innerHTML += format(
            toctmpl.innerHTML, filename
        );
    }
    
    function unindent( f )
    {
        var   s = '' + f
        , first = /\n\s+/.exec( s )
        ;
        return first
            ?  s.replace( new RegExp( first[ 0 ], 'g' )
                          , '\n'
                        )
            : s;
    }
    
    function receive_source_code( a )
    {
        var et = a  &&  a.target
        ,   etr = et  &&  (et.response || et.responseText)
        ,   domid = filename.replace(/\W/g,'_')
        ;
        write_source_code[ i_write ] = function () {
            contnode.innerHTML += format( 
                cstmpl.innerHTML, filename, etr
            );
        };

        if (--write_source_code.n < 1)
        {
            Array.prototype.forEach.call( write_source_code, function( f ) { f(); } );
            prettyPrint();
            window.toccont  &&  (toccont.style.display = '');
            do_the_unittests  &&  setTimeout( do_the_unittests, 2000 );
        }
    }

function format( tmpl, filename, sourcecode )
{
    var domid = filename.replace(/\W/g,'_')
    ,   ret   = tmpl
        .replace( /\$filename\b/g, filename)
        .replace( /\$domid\b/g, domid )
    ;
    if (sourcecode)
    {
        ret = ret.replace( /\$sourcecode\b/g
                           , sourcecode
                           .replace( /</g, '&lt;' )
                           .replace( />/g, '&gt;' )
                         );
    }
    return ret;
}

}

