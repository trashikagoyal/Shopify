// Load environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/User');
const seedDB = require('./seed');
const MongoStore = require('connect-mongo');
const uri = "mongodb+srv://trashikagoyal:shopifypassword@cluster0.0nr7t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// Connection URL from environment variable or fallback to local MongoDB
const dbURL = process.env.dbURL || uri;

// Set Mongoose to use `strictQuery` to avoid deprecation warnings
mongoose.set('strictQuery', true);

// Connect to MongoDB with a timeout of 5 seconds
mongoose.connect(dbURL, { 
    serverSelectionTimeoutMS: 5000 
})
    .then(() => console.log('DB Connected'))
    .catch((err) => console.log('DB Connection Error:', err));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Session configuration with MongoDB store
let secret = process.env.SECRET || 'weneedabettersecretkey';

let store = MongoStore.create({
    secret: secret,
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60 // 24 hours
});

const sessionConfig = {
    store: store,
    name: 'bhaukaal',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set up flash messages and current user
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Uncomment this line if you need to seed the database
//seedDB();

// Routes require
const productRoutes = require('./routes/product');
const reviewRoutes = require('./routes/review');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');

// Home route
app.get('/', (req, res) => {
    res.render('home');
});

// Express middlewares for routes
app.use(productRoutes);
app.use(reviewRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(userRoutes);
app.use(paymentRoutes);

// Start the server
const port = 8080;
app.listen(port, () => {
    console.log(`Server running at port ${port}`);
});
