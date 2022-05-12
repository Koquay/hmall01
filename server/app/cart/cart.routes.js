const router = require('express').Router();
const cartController = require('./cart.controller');

router.put('/', cartController.addItemToCart);
router.post('/', cartController.adjustItemQuantity)
router.delete('/:_id/:productId/:size', cartController.deleteCartItem)


module.exports = router;