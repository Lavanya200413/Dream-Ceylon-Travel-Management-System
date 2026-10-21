const express = require('express');
const { googleLogin } = require('../controllers/googleAuthController');

const router = express.Router();

router.post('/', googleLogin);

module.exports = router;
