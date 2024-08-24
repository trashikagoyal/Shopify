const { productSchema } = require("./schema");
const { reviewSchema } = require("./schema");
const passport = require('passport');
const Product = require("./models/Product");

const isLoggedIn = (req, res, next) => {
    if (req.xhr && !req.isAuthenticated()) {
        return res.status(401).json({ msg: 'You need to login first' });
    }

    if (!req.isAuthenticated()) {
        req.flash('error', 'You need to login first');
        return res.redirect('/login');
    }
    next();
}

const validateProduct = (req, res, next) => {
    const { name, img, price, desc } = req.body;
    const { error } = productSchema.validate({ name, img, price, desc });

    if (error) {
        const msg = error.details.map((err) => err.message).join(',');
        return res.render('error', { err: msg });
    }
    next();
}

const validateReview = (req, res, next) => {
    const { rating, comment } = req.body;
    const { error } = reviewSchema.validate({ rating, comment });

    if (error) {
        const msg = error.details.map((err) => err.message).join(',');
        return res.render('error', { err: msg });
    }
    next();
}

const isSeller = (req, res, next) => {
    if (!req.user.role || req.user.role !== 'seller') {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect('/products');
    }
    next();
}

const isProductAuthor = async (req, res, next) => {
    try {
        let { id } = req.params;
        const product = await Product.findById(id);

        // Check if the product exists
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/products');
        }

        // Check if the current user is the author of the product
        if (!req.user || !product.author.equals(req.user._id)) {
            req.flash('error', 'You do not have permission to do that');
            return res.redirect(`/products/${id}`);
        }

        next();
    } catch (error) {
        console.error("Error in isProductAuthor middleware:", error);
        res.status(500).render('error', { err: error.message });
    }
}

module.exports = { validateProduct, validateReview, isLoggedIn, isSeller, isProductAuthor };
