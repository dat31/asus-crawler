import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import cheerio from 'cheerio';
import htmlUlToArray from '../utils/htmlUlToArray'

function getImgList( isDefault = false ) {
    return function ( imgArr ) {
        return isDefault
            ? imgArr.DefaultFlag === 'Y'
            : imgArr.DefaultFlag !== "Y"
    }
}

function getProductImages( imageList ) {
    if ( !imageList ) {
        return null
    }
    const { ImageURL: defaultImages = [] } = imageList.find(
        getImgList( true )
    ) || {}
    const { ImageURL: images = [] } = imageList.find(
        getImgList()
    ) || {}
    return {
        defaultImages,
        images
    }
}

function getModelSpec( modelSpec: string ): string | Array<string> {
    if ( !modelSpec ) return null
    if ( modelSpec.includes( "<ul>" ) &&
        modelSpec.includes( "</ul>" ) ) {
        return htmlUlToArray( modelSpec )
    }
    return modelSpec
}

function getProductName( jsonName ) {
    if ( !jsonName ) {
        return null
    }
    const $ = cheerio.load( jsonName )
    return $( 'h2' ).text()
}

@Entity()
export default class Product {

    static toEntity( productJson ): Product {
        const product = new Product()
        const {
            ProductURL,
            SourceType,
            Name,
            ReviewCount,
            ReviewStar,
            ModelSpec,
            ImageList,
            ExternalID,
            Level1ID,
            Level1Path,
            Level2Path,
            Level3Path,
        } = productJson
        const {
            defaultImages = null,
            images = null
        } = getProductImages( ImageList ) || {}
        product.productUrl = ProductURL
        product.sourceType = SourceType
        product.name = getProductName( Name )
        product.reviewCount = ReviewCount
        product.reviewStart = parseFloat( ReviewStar )
        product.modelSpec = getModelSpec( ModelSpec )
        product.defaultImages = defaultImages
        product.images = images
        product.externalId = ExternalID
        product.level1Id = Level1ID
        product.level1Path = Level1Path
        product.level2Path = Level2Path
        product.level3Path = Level3Path
        return product
    }

    @PrimaryGeneratedColumn()
    id!: number

    @Column( { nullable: true } )
    externalId: string

    @Column( "simple-array", { nullable: true } )
    defaultImages: Array<string>

    @Column( "simple-array", { nullable: true } )
    images: Array<string>

    @Column( { nullable: true } )
    sourceType: string

    @Column( { nullable: true } )
    productUrl: string

    @Column( { nullable: true } )
    reviewCount: number

    @Column( 'decimal', { nullable: true } )
    reviewStart: number

    @Column( { nullable: true } )
    name: string

    @Column( "simple-array", { nullable: true } )
    modelSpec: string | Array<string>

    @Column( { nullable: true } )
    level1Id: number

    @Column( { nullable: true } )
    level1Path: string

    @Column( { nullable: true } )
    level2Path: string

    @Column( { nullable: true } )
    level3Path: string
}
