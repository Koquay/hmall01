const userService = require('./user.service');

exports.signIn = (req, res) => {
    userService.signIn(req, res);
}

exports.signUp = (req, res) => {
    userService.signUp(req, res);
}

exports.checkEmailForPasswordReset = (req, res) => {
    userService.checkEmailForPasswordReset(req, res);
}

exports.resetPassword = (req, res) => {
    userService.resetPassword(req, res);
}