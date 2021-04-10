import "reflect-metadata";
import { createConnection, getConnection } from "typeorm";
import Product from "./entity/Product";
import getAllProducts from "./api/getAllProducts";
import flatten from "./utils/flatten";

const DUPLICATE_ERROR = 'duplicate key';

function handleError( e ) {
    if ( e.message.includes( DUPLICATE_ERROR ) ) {
        console.log( 'DUPLICATED PRODUCT!' )
        return Promise.resolve()
    }
    console.log( 'ERROR INSERT PRODUCT', e )
    return Promise.reject()
}

async function insertProducts() {
    console.log( 'INSERTING' )
    const productRepository = getConnection().getRepository( Product )
    const products = await getAllProducts()
    const flattedProducts: Product[] = flatten( products )
    return Promise.all(
        flattedProducts.map(
            ( prod ) => productRepository
                .insert( Product.toEntity( prod ) )
                .catch( handleError )
        )
    )
}

( async function () {
    await createConnection()
    await insertProducts()
    console.log( 'INSERT FINISH!' )
} )()
