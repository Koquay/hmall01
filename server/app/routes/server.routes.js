const indexRoutes = require('../index/index.routes');
const productRoutes = require('../product/product.routes');
const userRoutes = require('../user/user.routes');
const cartRoutes = require('../cart/cart.routes');
const orderRoutes = require('../order/order.routes');

module.exports = (app) => {
    app.use('/api/order', orderRoutes)
    app.use('/api/cart', cartRoutes)
    app.use('/api/user', userRoutes)
    app.use('/api/products', productRoutes)
    app.use('/*', indexRoutes);
}

