const router = require('express').Router();
const userController = require('./user.controller');

router.put('/', userController.signIn);
router.post('/', userController.signUp);
router.put('/:resetPassword', userController.resetPassword);
router.get('/:email', userController.checkEmailForPasswordReset);

module.exports = router;
