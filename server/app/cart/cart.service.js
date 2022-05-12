require('./cart.model');
require('../product/product.model');

const isLength = require('validator/lib/isLength');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Cart = require('mongoose').model('Cart');
const Product = require('mongoose').model('Product');

const {
    ObjectId
} = mongoose.Types;


exports.addItemToCart = async (req, res) => {
    const {
        cartItem
    } = req.body;

    // console.log('cartItem', cartItem)

    if (!isLength(cartItem.size, {
            min: 1
        })) {
        res.status(422).send('Please select a size.');
        throw new Error('Please select a size.')
    }

    if (!cartItem.quantity) {
        res.status(422).send('Please select a quantity.');
        throw new Error('Please select a quantity.')
    }

    if (!cartItem.color) {
        res.status(422).send('Please select a color.');
        throw new Error('Please select a color.')
    }

    // const JWT_SECRET = process.env.JWT_SECRET;

    try {
        const {
            userId
        } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)

        console.log('userId', userId);

        const cart = await Cart.findOne({
            userId: userId
        });

        // console.log('cart', cart)

        const productExists = cart.items.find(item => {
            if (item.product.equals(ObjectId(cartItem.productId)) &&
                item.size === cartItem.size && item.color === cartItem.color) {
                return item.product;
            }

            return null;
        });

        console.log('productExists', productExists);

        let updatedCart;

        if (productExists) {
            updatedCart = await Cart.findOneAndUpdate({
                _id: cart._id,
                'items.product': cartItem.productId,
                'items.color': cartItem.color,
                'items.size': cartItem.size,
            }, {
                $inc: {
                    'items.$.quantity': cartItem.quantity
                }
            }, {
                new: true
            }).populate({
                path: 'items.product',
                model: 'Product'
            })
        } else {
            const newProduct = {
                product: cartItem.productId,
                quantity: cartItem.quantity,
                size: cartItem.size,
                color: cartItem.color,
                prodImage: cartItem.prodImage
            };

            updatedCart = await Cart.findOneAndUpdate({
                _id: cart._id
            }, {
                $addToSet: {
                    items: newProduct
                }
            }, {
                new: true
            }).populate({
                path: 'items.product',
                model: 'Product'
            })
        }

        res.status(201).json(updatedCart)

    } catch (error) {
        res.status(500).send('Problem adding item to cart.')
        throw error;
    }

}

exports.adjustItemQuantity = async (req, res) => {
    console.log('newQuantity', req.body)
    const {
        itemId,
        productId,
        quantity,
        size,
        color
    } = req.body;
    console.log('itemId, productId, quantity, size, color', itemId, productId, quantity, size, color)

    // if (!('authorization' in req.headers)) {
    //     return res.status(422).send('No authorization token present.')
    // }

    if (!isLength(size, {
            min: 1
        })) {
        return res.status(422).send('Please select a size.');
    }

    try {
        const {
            userId
        } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

        console.log('userId', userId);


        await Cart.updateOne({
            "userId": userId
        }, {
            "$set": {
                "items.$[item].quantity": quantity
            }
        }, {
            "arrayFilters": [{
                "item._id": itemId,
                "item.product": productId,
                "item.size": size,
                "item.color": color
            }]
        })

        const cart = await Cart.findOne({
            userId: userId,
        }).populate({
            path: 'items.product',
            model: 'Product'
        })

        console.log('cart', cart)

        res.status(201).json(cart);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Problem changing item quantity.')
    }
}

exports.deleteCartItem = async (req, res) => {
    console.log('deleteItem params', req.params);
    const {
        productId,
        size,
        _id
    } = req.params;

    // if (!('authorization' in req.headers)) {
    //     return res.status(422).send('No authorization token')
    // }

    try {
        const {
            userId
        } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

        console.log('userId', userId)

        const cart = await Cart.findOneAndUpdate({
            userId: userId,
        }, {
            $pull: {
                items: {
                    _id: _id,
                    product: productId,
                    size: size
                }
            }
        }, {
            new: true
        }).populate({
            path: 'items.product',
            model: 'Product'
        })

        console.log('cart', cart)

        return res.status(201).json(cart);
    } catch (error) {
        res.status(500).send('Problem deleting item from cart.')
        throw error;
    }
}