require('./product.model');
const Product = require('mongoose').model('Product');
const ProductTypes = require('mongoose').model('ProductTypes');

const {
    validateBearerToken
} = require('../validation/validators');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

exports.getProducts = async (req, res) => {
    const {
        errorMessage
    } = validateBearerToken(req, res);

    // if(errorMessage) {
    //     return res.status(422).send(errorMessage)
    // }

    const aggregatePipeline = buildAggregatePipeline(req.query);
    console.log('aggregatePipeline', aggregatePipeline)

    try {
        const products = await Product.aggregate(aggregatePipeline);
        console.log('products', products)

        const productTypes = await getProductTypes(req.query);

        res.status(200).json({
            products,
            productTypes
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Problems gettting products by category.')
    }
}

const buildAggregatePipeline = ({
    filters
}) => {
    console.log('filters', filters);

    const {
        sizes,
        colors,
        prices,
        ratings,
        type,
        styles
    } = JSON.parse(filters);
    const aggregatePipeline = [];


    const styleMatch = buildStyleMatch(styles);
    if (styleMatch) {
        aggregatePipeline.push(styleMatch);
    }

    const typeMatch = buildTypeMatch(type);
    if (typeMatch) {
        aggregatePipeline.push(typeMatch);
    }

    const colorsMatch = buildColorsMatch(colors);
    if (colorsMatch) {
        aggregatePipeline.push(colorsMatch);
    }

    const sizesMatch = buildSizesMatch(sizes);
    if (sizesMatch) {
        aggregatePipeline.push(sizesMatch);
    }

    const priceMatch = buildPriceMatch(prices);
    if (priceMatch) {
        aggregatePipeline.push(priceMatch)
    }

    const ratingsMatch = buildRatingsMatch(ratings);
    if (ratingsMatch) {
        aggregatePipeline.push(ratingsMatch)
    }

    // const sortMatch = buildSortMatch(sort_order);
    // if (sortMatch) {
    //     aggregatePipeline.push(sortMatch)
    // }

    return aggregatePipeline;
}

getProductTypes = async ({
    filters
}) => {
    const {
        type,
        styles
    } = JSON.parse(filters);

    console.log('type', type)
    console.log('styles', styles)

    try {

        const productTypes = await ProductTypes.find({
            type,
            // style: {
            //     $in: styles
            // }
        });

        console.log('productTypes', productTypes)
        return productTypes;

    } catch (error) {
        console.error(error);
        return res.status(500).send('Problems gettting productTypes.')
    }
}

exports.getProductTypes2 = async (req, res) => {
    const {
        type
    } = req.params;

    console.log('type', type)

    try {
        const productTypes = await ProductTypes.find({
            type
        });

        console.log('productTypes2', productTypes)
        res.status(200).json(productTypes);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Problems gettting productTypes.')
    }
}


const buildPriceMatch = (prices) => {
    if (!prices.length) return null;

    let priceMatch = [];

    for (let price of prices) {
        priceMatch.push({
            $and: [{
                $gte: ['$price', price.low]
            }, {
                $lte: ['$price', price.high]
            }]
        })
    }

    console.log('priceMatch', JSON.stringify(priceMatch))

    return {
        $match: {
            $expr: {
                $or: priceMatch
            }
        }
    }
}

const buildStoreMatch = (store) => {
    return {
        $match: {
            store: store
        }
    }
}

const buildTypeMatch = (type) => {
    return {
        $match: {
            type: type
        }
    }
}

const buildColorsMatch2 = (colors) => {
    if (colors.length) {
        return {
            $match: {
                color: {
                    $in: colors
                }
            }
        }
    }

    return null;
}


const buildColorsMatch = (colors) => {
    if (colors.length) {
        return {
            $match: {
                colors: {
                    $in: colors
                }
            }
        }
    }

    return null;
}

const buildStyleMatch = (styles) => {
    if (styles.length) {
        return {
            $match: {
                style: {
                    $in: styles
                }
            }
        }
    }

    return null;
}

const buildSizesMatch = (sizes) => {
    if (sizes.length) {
        return {
            $match: {
                sizes: {
                    $in: sizes
                }
            }
        }
    }

    return null;
}

const buildRatingsMatch = (ratings) => {
    if (ratings.length) {
        return {
            $match: {
                rating: {
                    $in: ratings
                }
            }
        }
    }

    return null;
}

const buildSortMatch = (sort_order) => {
    if (sort_order) {
        switch (sort_order) {
            case 'Price high to low':
                return {
                    $sort: {
                        price: -1
                    }
                }

                case 'Price low to hgh':
                    return {
                        $sort: {
                            price: 1
                        }
                    }

                    case 'Rating low to high':
                        return {
                            $sort: {
                                rating: 1
                            }
                        }

                        case 'Rating high to low':
                            return {
                                $sort: {
                                    rating: -1
                                }
                            }

                            default:
                                return null;
        }
    }

}