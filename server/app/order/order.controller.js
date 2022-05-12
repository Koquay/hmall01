const orderService = require('./order.service');

exports.placeOrder = (req, res) => {
    orderService.placeOrder(req, res);
}

exports.getProductsForSalesStatus = (req, res) => {
    orderService.getProductsForSalesStatus(req, res);
}

exports.getOrderForStatus = (req, res) => {
    orderService.getOrderForStatus(req, res);
}


exports.changeOrderStatus = (req, res) => {
    orderService.changeOrderStatus(req, res);
}

exports.search = (req, res) => {
    orderService.search(req, res);
}

exports.createPaymentIntent = (req, res) => {
    orderService.createPaymentIntent(req, res);
}

exports.refundItem = (req, res) => {
    orderService.refundItem(req, res);
}


exports.getUserOrders = (req, res) => {
    orderService.getUserOrders(req, res);
}



