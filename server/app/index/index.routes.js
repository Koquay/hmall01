const router = require('express').Router();
const indexController = require('./index.controller')

router.get('/', indexController.home);

module.exports = router;