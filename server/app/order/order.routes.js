const router = require('express').Router();
const orderController = require('./order.controller');

router.post('/', orderController.placeOrder)
router.post('/create_payment_intent', orderController.createPaymentIntent)

router.get('/:salesStatus', orderController.getProductsForSalesStatus)
router.get('/2/:status', orderController.getOrderForStatus)
router.get('/', orderController.search)
router.get('/2/3/4', orderController.getUserOrders)

router.put('/', orderController.changeOrderStatus)
router.put('/1', orderController.refundItem)

module.exports = router;