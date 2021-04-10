import axiosInstance from "./axiosInstance";
import Product from "../entity/Product";
import { AxiosResponse } from "axios";

const ENDPOINT = 'SeriesFilterResult'

const defaultParams = {
    SystemCode: 'asus',
    WebsiteCode: 'vn',
    ProductLevel1Code: '',
    ProductLevel2Code: '',
    PageSize: 100,
    PageIndex: 1,
    Category: '',
    Series: '',
    SubSeries: '',
    CategoryName: '',
    SeriesName: '',
    SubSeriesName: '',
    Spec: '',
    SubSpec: '',
    Sort: 'Newsest',
    siteID: 'www',
    sitelang: '',
}

const asusCategories = {
    Accessories: [
        "Keyboards",
        "Mice-and-Mouse-Pads",
        "Headsets-and-Audio",
        "Apparels-Bags-and-Gears",
    ],
    "Motherboards-Components": [
        "Motherboards",
        "Graphics-Cards",
        "Power-Supply-Units",
        "Cooling",
        "Gaming-Cases"
    ],
    "Displays-Desktops": [
        "Monitors",
        "Gaming-Tower-PCs",
        "Mini-PCs"
    ],
    Mobile: [
        "Phones"
    ],
    Laptops: [
        "For-Gaming"
    ]
}

type Response = {
    Status: number
    Message: string
    Result: {
        TotalCount: number,
        ProductList: Product[]
    }
}

function getParamsUrl( paramsObj ) {
    return Object
        .entries( { ...defaultParams, ...paramsObj } )
        .reduce( ( url, [ key, value ], i ) =>
                url.concat( `${ i === 0 ? `?` : `&` }${ key }=${ value }` ),
            ENDPOINT )
}

async function getProductByCategory(
    productLevel1Code: string,
    productLevel2Code: string,
    pageIndex: number = 1,
    prevProducts: Product[] = []
) {

    const paramsUrl = getParamsUrl( {
        PageIndex: pageIndex,
        ProductLevel1Code: productLevel1Code,
        ProductLevel2Code: productLevel2Code,
    } )
    const res: AxiosResponse<Response> = await axiosInstance.get( paramsUrl )
    const { Result: { TotalCount, ProductList } } = res.data
    console.log( `GET ${ productLevel2Code }` )
    console.log( 'TOTAL COUNT: ' + TotalCount )
    const products = ProductList
        .concat( prevProducts )
        .map( prod => {
            return ( {
                ...prod,
                Level1Path: productLevel1Code,
                Level2Path: productLevel2Code,
            } )
        } )
    if ( TotalCount >= 100 ) {
        const totalPage = Math.round( TotalCount / 100 ) + 1
        if ( pageIndex === totalPage ) {
            return products
        }
        return getProductByCategory(
            productLevel1Code,
            productLevel2Code,
            pageIndex + 1,
            products
        )
    }
    return products
}

function getAllProducts() {
    const productCodes = []
    Object
        .entries( asusCategories )
        .forEach( ( [ productLv1Code, productLv2Codes ] ) => {
            productLv2Codes.forEach( ( productLv2Code ) => {
                productCodes.push( { productLv1Code, productLv2Code } )
            } )
        } )
    return Promise.all(
        productCodes.map(
            ( { productLv1Code, productLv2Code } ) => getProductByCategory( productLv1Code, productLv2Code )
        )
    )
}

export default getAllProducts
