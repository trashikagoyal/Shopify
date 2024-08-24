const Product = require("../models/Product");



// const showAllProducts = async (req, res) => {
//     try {
//         const products = await Product.find({});
//         res.render('products/index', { products });
//     }
//     catch (e) {
//         res.status(500).render('error',{err:e.message})
//     }
// }
const showAllProducts= async (req, res) => {
    const { categories, minPrice, maxPrice, rating } = req.query;
    let query = {};

    if (categories) {
        query.category = { $in: categories.split(',') };
    }

    if (minPrice) {
        query.price = { ...query.price, $gte: parseInt(minPrice) };
    }

    if (maxPrice) {
        query.price = { ...query.price, $lte: parseInt(maxPrice) };
    }

    if (rating) {
        query.avgRating = { $gte: parseInt(rating) };
    }

    try {
        const products = await Product.find(query).populate('reviews');
        const allCategories = await Product.distinct('category');
        res.render('products/index', { products, allCategories });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Unable to load products');
        res.redirect('/');
    }
};


const productForm = (req, res) => {
    try {
        res.render('products/new');
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
}

const createProduct = async (req, res) => {
    try {
        const { name, img, desc, price, categories } = req.body;
        // Categories can be an array or an empty array if not provided
        const categoryArray = Array.isArray(categories) ? categories : [];

        await Product.create({
            name,
            img,
            price: parseFloat(price),
            desc,
            category: categoryArray,
            author: req.user._id
        });

        req.flash('success', 'Successfully added a new product!');
        res.redirect('/products');
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
}

const showProduct = async(req, res) => {

    try {
        const { id } = req.params;
        const product = await Product.findById(id).populate('reviews');
        res.render('products/show', { product}); 
    }
    catch (e) {
        res.status(500).render('error',{err:e.message})
    }
}

const editProductForm = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/products');
        }
        res.render('products/edit', { product });
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, img, desc, categories } = req.body;

        // Categories can be an array or an empty array if not provided
        const categoryArray = Array.isArray(categories) ? categories : [];

        await Product.findByIdAndUpdate(id, {
            name,
            price: parseFloat(price),
            img,
            desc,
            category: categoryArray
        });

        req.flash('success', 'Product updated successfully');
        res.redirect(`/products/${id}`);
    } catch (e) {
        res.status(500).render('error', { err: e.message });
    }
}



const deleteProduct = async (req, res) => {
    
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.redirect('/products');
    }
    catch (e) {
        res.status(500).render('error',{err:e.message})   
    }
}

const shareProduct = (req, res) => {
    const { id } = req.params;
    const productLink = `${req.protocol}://${req.get('host')}/products/${id}`;
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(`Check out this product: ${productLink}`)}`;
    res.json({ whatsappLink });
};
module.exports = {showAllProducts , productForm , createProduct , showProduct , editProductForm , updateProduct , deleteProduct, shareProduct }