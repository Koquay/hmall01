require('../cart/cart.model');
require('../product/product.model');
require('./order.model');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');
const Cart = require('mongoose').model('Cart');
const Order = require('mongoose').model('Order');
const Product = require('mongoose').model('Product');

const Stripe = require("stripe");
const stripe = Stripe("sk_test_ybjdse51Sh1sgPPanyxXQANL007sdrs1D3");

// const email = require('../utils/email.service');
const nodemailer = require('../utils/nodemailer');
const {getTaxRate} = require('../utils/tax.service')

exports.placeOrder = async (req, res) => {

    const orderData = req.body;
    console.log('orderData', orderData);

    try {
        const {
            userId
        } = jwt.verify(
            req.headers.authorization,
            process.env.JWT_SECRET
        )

        console.log('userId', userId)

        const cart = await Cart.findOne({
            user: userId
        }).populate({
            path: 'items.product',
            model: 'Product'
        });

        console.log('cart', cart)

        const {
            cartTotal,
            stripeTotal,
            tax,
            shipping,
            subtotal
        } = calculateCartTotal(
            cart.items,
            orderData.shippingInfo.stateProvince                
        );

        console.log('cartTotal, stripeTotal', cartTotal, stripeTotal)        

        const order = await new Order({
            user: userId,
            shippingInfo: orderData.shippingInfo,
            payment_intent: orderData.paymentIntent,
            total: cartTotal,
            items: cart.items,    
            tax : tax,
            shipping: shipping,
            subtotal: subtotal       
        }).populate({
            path: 'items.product',
            model: 'Product'
        });

        order.orderNo = order._id;
        await order.save();
 
        const productsForSalesStatus = await getAllProductsForSalesStatus("bestseller")

        console.log('order', order);

        let emptyCart = await Cart.findOneAndUpdate({
            user: userId
        }, {
            items: []
        }, {
            new: true
        })

        console.log('emptyCart', emptyCart)

        // nodemailer.sendEmail(order);

        res.status(201).json({order, productsForSalesStatus, emptyCart});

    } catch (error) {
        res.status(500).send('Error processing order')
        throw error;
    }

}


const refundWholeOrder = async (req, res, amount, paymentIntent) => {
    console.log('REFUND CARD CALLED')
    console.log('paymentIntent', paymentIntent)

    checkAuthorization(req, res); 

    try {

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntent,
            amount: amount  * 100
        });

        console.log('refund', refund)

        return refund?.id;
    } catch (error) {
        res.status(500).send('1. There is a problem refunding the credit card.')
        throw error;
    }
}

const calculateCartTotal = (items, province) => {
    const subtotal = items?.reduce((acc, item) => {
      return (acc += item.product.price * item.quantity);
    }, 0);

    let taxRate;
    let tax = 0;

    if(province) {
      taxRate = getTaxRate(province)
      console.log('taxRate', taxRate)
      tax = subtotal * taxRate;
    }
    
    const shipping = subtotal * 0.07;
    const total = subtotal + tax + shipping;

    const cartTotal = ((total * 100) / 100).toFixed(2);
    console.log('cartTotal', cartTotal);
    
    const stripeTotal = Number((cartTotal * 100).toFixed(2));
    console.log('stripeTotal', stripeTotal);
    

    console.log('cartTotal, stripeTotal, tax, shipping, subtotal',
    cartTotal, stripeTotal, tax, shipping, subtotal)

    return {
        cartTotal,
        stripeTotal,
        tax,
        shipping,
        subtotal
    };
  };


exports.getProductsForSalesStatus = (req, res) => {
    return getAllProductsForSalesStatus(req.sale_status);
}

const getAllProductsForSalesStatus = async (salesStatus) => {
    try {
        const productsForSalesStatus = await Product.find({sales_status: "bestseller"})
        // console.log('salesStatus products', productsForSalesStatus)
        return productsForSalesStatus;
    } catch(error) {
        res.status(500).send("Cannot get products by sale status.")        
        throw error;
    }
}

exports.getOrderForStatus = async (req, res) => {
    checkAuthorization(req, res); 

    const {status} = req.params;
    console.log('status', status);

    switch(status) {
        case 'pending':
            date = 'createdAt';
        break;

        case 'shipping':
            date = 'shipped_date';
        break;

        case 'refunded':
            date = 'refund_date';
        break;       

        default:
            date = 'createdAt';
    }

    try {
        const orders = 
        await Order.find({status: status})
            .sort({date:-1}) 
            .populate({
            path: 'items.product',
            model: 'Product'
        });
        
        // console.log('orders', orders);
        return res.status(200).json(orders);
    } catch(error) {
        res.status(500).send('Problem gettting order for status.')
        throw error;
    }
}

exports.changeOrderStatus = async (req, res) => {   
    checkAuthorization(req, res); 

    console.log('req.body', req.body);
    const {orderInfo} = req.body;

    let date = moment.tz('America/Toronto').format('YYYY-MM-DD hh:mm A');
    let shipped_date;
    let refund_date;
    let refundId;
    let refunded;

    if (orderInfo.orderStatus === "shipped") {
        shipped_date = date;
    }  else if (orderInfo.orderStatus === "refunded") {
        refundId = await refundWholeOrder(req, res, orderInfo.amount, orderInfo.paymentIntent)
        refund_date = date;
        if(refundId) refunded = true;
    }

    try {
        const changedOrder = await Order.findOneAndUpdate(
            {_id: orderInfo.orderNo},
            {
                $set: {
                    status: orderInfo.orderStatus,
                    refund_date: refund_date,
                    shipped_date: shipped_date,
                    refund_id: refundId,
                    "items.$[].refunded" : refunded 
                }
            },
            {
                new: true
            }
        ).populate({
            path: 'items.product',
            model: 'Product'
        });

        const emailMsg = 
            createEmailMsg(orderInfo, changedOrder);

        nodemailer.sendEmail(emailMsg);
    
        console.log('changed order', changedOrder)
        return res.status(201).json(changedOrder)
    } catch(error) {
        res.status(500).send('Problem changing order status.')
        throw error;
    }
}

exports.search = async (req, res) => {
    console.log('req.query', req.query)
    
    checkAuthorization(req, res); 

    let {searchText} = req.query;
            
    try {
        const orders = 
        await Order.find({orderNo: {$regex : searchText}}).populate({
            path: 'items.product',
            model: 'Product'
        });        
      
        console.log('orders', orders);
        return res.status(200).json(orders);
    } catch(error) {
        res.status(500).send('Problem searching for order.')
        throw error;
    }
}

exports.createPaymentIntent = (req, res) => {
    console.log('req.body.amount', req.body.amount);

    checkAuthorization(req, res); 

    stripe.paymentIntents.create(
        {
          amount: parseInt(req.body.amount),
          currency: "cad",
          payment_method_types: ["card"],
        },
        function (err, paymentIntent) {
          if (err) {
            console.log('err', err);
            res.status(500).json(err.message);
          } else {
            console.log('paymentIntent', paymentIntent);
            res.status(201).json(paymentIntent);
          }
        }
      );
}

exports.refundItem = async (req, res) => {    
    checkAuthorization(req, res); 
    
    const {
        itemId, 
        amount, 
        paymentIntent,
        orderNo,
        orderStatus
    } = req.body;
    console.log('req.body', req.body)

    const date = moment.tz('America/Toronto').format('YYYY-MM-DD hh:mm A');

    try {

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntent,
            amount: amount * 100
        });

        console.log('refund', refund)                    
              
    } catch(error) {
        res.status(500).send('Problem refunding item.')
        throw error;
    }


    try {    
        console.log('itemId', itemId)

        let targetOrder = await Order.findOne({
            'items.$_id': itemId,
        })

        console.log('targetOrder', targetOrder)
        
        let refundedOrder = await Order.findOneAndUpdate({
            'items._id': itemId,
        }, {
            $set: {
                'items.$.refunded': true,
                'items.$.refund_date': date
            },
            $inc: {
                total: -amount,
                subtotal: -amount
            }
        }, {
            new: true
        }).populate({
            path: 'items.product',
            model: 'Product'
        })

        const nonRefundedItem = refundedOrder.items.filter(item => item.refunded !== true);

        console.log('nonRefundedItem', nonRefundedItem)

        if(!nonRefundedItem.length) {
            const date = moment.tz('America/Toronto').format('YYYY-MM-DD hh:mm A');

            refundedOrder = await Order.findOneAndUpdate({
                'items.$._id': itemId,
            }, {
                $set: {
                    status: "refunded",
                    refund_date: date
                }
            }, {
                new: true
            }).populate({
                path: 'items.product',
                model: 'Product'
            })
        }

        console.log('refundedOrder', refundedOrder)

        const orderInfo = {orderStatus, refundedOrder, amount}

         const emailMsg = 
            createEmailMsg(orderInfo, refundedOrder);

        nodemailer.sendEmail(emailMsg);
    
        return res.status(201).json(refundedOrder)
      
    } catch(error) {
        res.status(500).send('Problem refunding item.')
        throw error;
    }
}

const checkAuthorization = (req, res) => {
    if(!('authorization' in req.headers)) {
        return res.status(422).send('No authorization. Please log in.')
    }

    try {
        const {
            role
        } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET)

        if (role !== 'admin') {
            return res.send('No authorization to perform this action')
        }

    } catch(error) {
        res.status(500).send('No authorization to perform this operation.')
        throw error;
    }
}

const createEmailMsg = (orderInfo, changedOrder) => {
    const msg = {};
    msg.to = changedOrder.shippingInfo.email;

    switch(orderInfo.orderStatus) {
        case "shipped":
            msg.subject = "Your order has been shipped";
            msg.text =
                `<p>
                    We are writing to inform you that your order
                    has been shipped. We will continue to keep you 
                    updated on the status of your order.
                    &nbsp;
                    Kind regards;
                </p>`
        break;

        case "refunded":
            msg.subject = "Your order has been refunded";
            msg.text = 
                `<p>
                    We are writing to inform you that your order
                    has been refunded for ${orderInfo.amount}. This amount
                    should appear on your credit card within five business days.
                    &nbsp;
                    Kind regards;
                </p>`

        break;
    }

    return msg;
}

exports.getUserOrders = async (req, res) => {
    console.log('\n\n\getUserOrders 2 3 4')
   
    if(!('authorization' in req.headers)) {
        res.status(422).send('Please log in to perform this action.');
        throw new Error('Please log in to perform this action.')
    }

    try {
        const {userId} = jwt.verify(
            req.headers.authorization,
            process.env.JWT_SECRET
        )

        console.log('userId', userId)

       const pastOrders = await Order.find(
            {user: userId, status: {$in: ["delivered", "refunded"]}}
        ).populate({
            path: 'items.product',
            model: 'Product'
        });

        console.log('\n\npastOrders', pastOrders)

        const outstandingOrders = await Order.find(
            {user: userId, status: {$in: ["pending", "shipped"]}}
        ).populate({
            path: 'items.product',
            model: 'Product'
        });

        console.log('\n\noutstandingOrders', outstandingOrders)
    
        res.status(200).json({outstandingOrders, pastOrders});

    } catch(error) {
        console.log('TokenExpiredError', JSON.stringify(error).indexOf('TokenExpiredError'))
        if(JSON.stringify(error).indexOf('TokenExpiredError') >= 9) {
            res.status(401).send('Authorization required. Please log in.')            
        } else {
            res.status(500).send('Error getting user orders')
        }
        
        throw error;
    }
}



