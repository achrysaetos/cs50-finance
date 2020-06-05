var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");//after we npm install body-parser
var session = require("express-session");//after we npm install express-session
var compression = require('compression');//after we npm install compression
var helmet = require('helmet');//after we npm install helmet



//Connects to MongoDB
var mongoose = require("mongoose");//imports the mongoose module
var dev_db_url = "mongodb+srv://achrysaetos:sempiternal@cluster0-jjeek.mongodb.net/fullstack_template?retryWrites=true&w=majority";
var mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true });//sets up the defualt mongoose connection
var db = mongoose.connection;//gets the default connection
db.on("error", console.error.bind(console, "MongoDB connection error:"));//binds the connection to error event(to get notified)

var indexRouter = require('./routes/index');

var app = express();

var cons = require('consolidate');//after we npm install consolidate and swig to avoid pug as a templating engine
app.engine('html', cons.swig)//after we npm install consolidate and swig
app.set('views', path.join(__dirname, 'views'));//after we npm install consolidate and swig
app.set('view engine', 'html');//after we npm install consolidate and swig

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(compression());//to use compression
app.use(helmet());//to use helmet
app.use(bodyParser.json());//to use body-parser
app.use(session({
    name: "session",//so we know what cookies to clear
    secret: "secret!",//secret key to sign the session id
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30000000,
        sameSite: true//helps to prevent CSRF attacks
    }
}));//to use express-session

app.use('/', indexRouter);

module.exports = app;
