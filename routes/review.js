const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Review = require('../models/Review');
const { validateReview } = require('../middleware');

// POST route to add a review to a product
router.post('/products/:productId/review', validateReview, async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;

        const product = await Product.findById(productId);

        const review = new Review({ rating, comment });

        // Average Rating Logic
        const newAverageRating = ((product.avgRating * product.reviews.length) + parseInt(rating)) / (product.reviews.length + 1);
        product.avgRating = parseFloat(newAverageRating.toFixed(1));

        product.reviews.push(review);

        await review.save();
        await product.save();

        req.flash('success', 'Added your review successfully!');
        res.redirect(`/products/${productId}`);
    } catch (error) {
        res.status(500).render('error', { err: error.message });
    }
});

// DELETE route to delete a review from a product
router.delete('/products/:productId/reviews/:reviewId', async (req, res) => {
    try {
        const { productId, reviewId } = req.params;

        const product = await Product.findById(productId);

        // Find the index of the review to delete
        const reviewIndex = product.reviews.findIndex(review => review._id.toString() === reviewId);

        if (reviewIndex !== -1) {
            // Remove the review from the array
            product.reviews.splice(reviewIndex, 1);

            // Recalculate the average rating
            let totalRating = 0;
            product.reviews.forEach(review => {
                totalRating += review.rating;
            });
            product.avgRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;

            await product.save();
            req.flash('success', 'Review deleted successfully!');
            res.redirect(`/products/${productId}`);
        } else {
            res.status(404).send('Review not found');
        }
    } catch (error) {
        res.status(500).render('error', { err: error.message });
    }
});

module.exports = router;
