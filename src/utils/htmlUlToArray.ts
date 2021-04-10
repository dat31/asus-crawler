import cheerio from "cheerio";

function htmlUlToArray( html: string ): string[] {
    const $ = cheerio.load( html )
    const arr = []
    $( 'li' ).each( ( _, el ) => arr.push( $( el ).text() ) )
    return arr
}

export default htmlUlToArray
