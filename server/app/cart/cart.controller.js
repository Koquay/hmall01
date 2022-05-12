const cartService = require('./cart.service');

exports.addItemToCart = (req, res) => {
    cartService.addItemToCart(req, res);   
}

exports.adjustItemQuantity = (req, res) => {
    cartService.adjustItemQuantity(req, res);   
}

exports.deleteCartItem = (req, res) => {
    cartService.deleteCartItem(req, res);   
}

