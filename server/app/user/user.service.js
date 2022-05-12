require('./user.model');
require('../cart/cart.model.js');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('mongoose').model('User');
const Cart = require('mongoose').model('Cart');
const isEmail = require('validator/lib/isEmail');
const isLength = require('validator/lib/isLength');
const nodemailer = require('../utils/nodemailer');
const {
    v4: uuidv4
} = require('uuid');

const inOneHour = new Date(new Date().getTime() + 60 * 60 * 1000);

const {
    validateBearerToken
} = require('../validation/validators');

const {
    validateUser
} = require('../validation/validators');

exports.signIn = async (req, res) => {
    console.log('req.body', req.body);

    const {
        email,
        password
    } = req.body;
    console.log('email, password', email, password);

    try {
        if (!isLength(password, {
                min: 6
            })) {
            return res.status(422).send('Password must be minimum of 6 characters.')
            // throw new Error("Password must be minimum of 6 characters.");
        } else if (!isEmail(email)) {
            return res.status(422).send('Invalid email.')
            // throw new Error("Invalid email.'");
        }

        let user = await User.findOne({
            email
        }).select('+password');
        console.log('user', user);

        if (!user) {
             res.status(422).send("User with this credential does not exist.")
            throw new Error("User with this credentials does not exist.");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        console.log('passwordMatch', passwordMatch)

        if (!passwordMatch) return res.status(401).send('Invalid signin information.')

        const JWT_SECRET = process.env.JWT_SECRET;

        const token = jwt.sign({
            userId: user._id,
            role: user.role
        }, JWT_SECRET, {
            expiresIn: '1h'
        })

        console.log('token', token);

        const cart = await Cart.findOne({
            userId: user._id
        }).populate({
            path: 'items.product',
            model: 'Product'
        });

        console.log('cart', cart);

        return res.status(201).json({
            token,
            cart,
            role: user.role
        })
    } catch (error) {
        res.status(500).send('Problem signing in user!')
        throw error;
    }
}

exports.signUp = async (req, res) => {
    try {
        const user = req.body;

        const existingUser = await User.findOne({
            email: user.email
        });

        if (existingUser) {
            return res.status(422).send("User with this credentials already exists.")
            // throw new Error("User with this credentials already exists.");
        }

        let newUser = new User(user);
        newUser.password = bcrypt.hashSync(user.password, 10);
        console.log('newUser', newUser)
        await newUser.save();
        delete newUser.password;

        let token = jwt.sign({
            userId: newUser._id,
            role: user.role
        }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
        console.log('newUser', newUser)

        let cart = await new Cart({
            userId: newUser._id
        }).save();

        console.log("new cart", cart);

        return res.status(201).json({
            token,
            cart,
            role: user.role
        })

    } catch (error) {
        res.status(500).send('Problem signing up user!')
        throw error;

    }
};

exports.checkEmailForPasswordReset = async (req, res) => {
    const {
        email
    } = req.params;

    console.log('email', email);

    try {
        const user = await User.findOne({
            email
        })

        console.log('user', user);

        if (!user) {
            return res.status(500).send('Problems checking email for password reset');
            // throw new Error('Problems checking email for password reset');
        }

        const verificationCode = uuidv4().substr(-5);

        console.log('verification code', verificationCode)

        const text = `<p>Please enter this verification code in the Reset Password form in the next 10 minutes:  <b>${verificationCode}</b></p>`
        const to = user.email;
        const subject = "Your password reset verification code"

        const msg = {to, subject, text}

        nodemailer.sendEmail(msg);

        return res.status(200).json({
            verificationCode
        })


    } catch (error) {
        res.status(500).send('Problems checking email for password reset');
        throw error;
    }

}


exports.resetPassword = async (req, res) => {
    try {
        const user = req.body;

        const updatedUser = await User.findOneAndUpdate({
            email: user.email
        }, {
            $set: {
                password: bcrypt.hashSync(user.newPassword, 10)
            }
        })

        delete updatedUser.password;

        const token = jwt.sign({
            userId: user._id,
            role: user.role
        }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        })

        console.log('token', token);

        const cart = await Cart.findOne({
            userId: user._id
        }).populate({
            path: 'items.product',
            model: 'Product'
        });

        console.log('cart', cart);

        return res.status(201).json({
            token,
            cart,
            role: user.role
        })

    } catch (error) {
        res.status(500).send('Problem resetting password!')
        throw error;

    }
};