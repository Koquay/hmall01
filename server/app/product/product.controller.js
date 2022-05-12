const productService = require('./product.service');

exports.getProducts = async (req, res) => {   
    await productService.getProducts(req, res);
}

exports.getProductTypes = async (req, res) => {   
    await productService.getProductTypes2(req, res);
}