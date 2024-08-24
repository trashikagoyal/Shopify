const User = require('../models/User');

module.exports.renderWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishList');
        res.render('user/wishlist', { user });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Unable to load wishlist');
        res.redirect('/');
    }
};

module.exports.addToWishlist = async (req, res) => {
    let { productId } = req.params;
    let user = req.user;
    let isLiked = user.wishList.includes(productId);

    const option = isLiked ? '$pull' : '$addToSet';
    req.user = await User.findByIdAndUpdate(req.user._id, { [option]: { wishList: productId } }, { new: true });
    res.send('like done api');
};

module.exports.shareWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishList');
        const wishlistItems = user.wishList.map(product => `${product.name}: ${req.protocol}://${req.get('host')}/products/${product._id}`).join('\n');
        const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`Check out my wishlist:\n${wishlistItems}`)}`;
        res.json({ whatsappLink });
    } catch (err) {
        console.error('Error generating wishlist share link:', err);
        res.status(500).json({ error: 'Unable to generate share link' });
    }
};
