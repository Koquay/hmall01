
require('../user/user.model');
require('../cart/cart.model.js');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const Cart = require('mongoose').model('Cart');

exports.validateBearerToken = (req) => {
    if (!('authorization' in req.headers)) {
        return {
            errorMessage: 'No authorization token present.'
        };
    } else {
        return {
            errorMessage: null
        };
    }
}

exports.validateUser = async ({
    email,
    password
}) => {
    try {
        const user = await User.findOne({
            email
        }).select('+password');
        console.log('user', user)
    
        if (!user) {
            return {
                errorMessage: 'User does not exist.'
            }
        }
    
        const passwordMatch = await bcrypt.compare(password, user.password);
    
        if(!passwordMatch) {
            return {errorMessage: 'Invalid signin information.'}
        }
       
        return {user: user}
    
    } catch(error) {
        console.log(error);
        throw error;
    }
    
    // const {
    //     userId
    // } = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);

    // if (!userId) {
    //     return {
    //         userId: null,
    //         message: ''
    //     }
    // }
}