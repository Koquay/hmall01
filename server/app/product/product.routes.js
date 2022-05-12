const router = require('express').Router();
const productController = require('./product.controller');

router.get('/', productController.getProducts);
router.get('/:type', productController.getProductTypes);

module.exports = router;