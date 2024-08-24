const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const userController = require('../controllers/wishlist');

router.get('/user/wishlist', isLoggedIn, userController.renderWishlist);
router.post('/product/:productId/like', isLoggedIn, userController.addToWishlist);
router.get('/user/wishlist/share', isLoggedIn, userController.shareWishlist);

module.exports = router;
