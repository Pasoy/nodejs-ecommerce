var express = require('express');/*
HTTP request logger middleware for node.js
- morgan
 */
var morgan = require('morgan');
/*
mongodb modeling package
- mongoose
 */
var mongoose = require('mongoose');

var bodyParser = require('body-parser');
/*
EJS for HTML templating with JS
EJS-MATE new engine
 */
var ejs = require('ejs');
var ejs_mate = require('ejs-mate');
/*

 */
var session = require('express-session');
var cookieParser = require('cookie-parser');
/*
Flash to render messages without redirecting the actual request
 */
var flash = require('express-flash');
/*
mongodb session store
 */
var MongoStore = require('connect-mongo')(session);
/*
passport is an authentication middleware
- easy for facebook, google, twitter, local, ...
 */
var passport = require('passport');

/*
- Secret: config file / contains important data
- User: accesses the user model
- Category: accesses the category model
 */
var Secret = require('./config/secret');
var User = require('./models/user');
var Category = require('./models/category');

var cartLength = require('./middlewares/middlewares');

var app = express();

/*
Connect to the database
- returns error or success message
 */
mongoose.connect(Secret.database, {
    useCreateIndex: true,
    useNewUrlParser: true
}, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to the database");
    }
});

/*
Middleware
 */
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: Secret.secretKey,
    store: new MongoStore({url: Secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

app.use(cartLength);
app.use(function (req, res, next) {
    Category.find({}, function (err, categories) {
        if (err) return next(err);
        res.locals.categories = categories;
        next();
    });
});

/*
Change the engine to EJS
 */
app.engine('ejs', ejs_mate);
app.set('view engine', 'ejs');

/*
Require all routes and let the app use them
- Main
- User
- Admin
- API
 */
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);

/*
Open up server under given port
 */
app.listen(Secret.port, function (err) {
    if (err) throw err;
    console.log("Server is Running on port " + Secret.port);
});
