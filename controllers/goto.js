
const { check, validationResult } = require("express-validator");//after we npm install express-validator
const bcrypt = require("bcryptjs");//after we npm install bcryptjs

var api_key = "pk_f83525dace814340bdc3798e1a01e265";//remove this and set as environment variable instead!
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;//in order to get json from http url

var User = require("../models/user");
var Portfolio = require("../models/portfolio");



exports.home = function (req, res) {
    res.render("index");
};
exports.products = function (req, res) {
    res.render("products");
};
exports.features = function (req, res) {
    res.render("features");
};
exports.pricing = function (req, res) {
    res.render("pricing");
};
exports.about = function (req, res) {
    res.render("about");
};
exports.contact_us = function (req, res) {
    res.render("contact_us");
};
exports.signup = function (req, res) {
    res.render("signup");
};
exports.login = function (req, res) {
    res.render("login");
};
exports.forgot = function (req, res) {
    res.render("forgot");
};

exports.dashboard = function (req, res) {
    if (!req.session.userID) {
        //res.redirect("login");
        res.render("dashboard");
    } else {
        res.render("dashboard");
    }

};
exports.logout = function (req, res) {
    req.session.destroy(err => {
        if (err) {
            res.redirect("index");
        }
        res.clearCookie("session");
        res.redirect("login");
    });
};

exports.quote = (req, res) => {
    res.render("quote");
}
exports.quote_post = (req, res) => {
    var url = "https://cloud-sse.iexapis.com/stable/stock/"+req.body.quotesymbol+"/quote?token="+api_key;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);

    var jsonquery = JSON.parse(xhr.responseText);

    res.render("quote_posted", {
        symbol: jsonquery.symbol,
        companyName: jsonquery.companyName,
        open: jsonquery.open.toFixed(2),
        high: jsonquery.high.toFixed(2),
        low: jsonquery.low.toFixed(2),
        close: jsonquery.close.toFixed(2),
        latestPrice: jsonquery.latestPrice.toFixed(2)
    });
}

exports.buy = (req, res) => {
    res.render("buy");
}
exports.buy_post = (req, res) => {
    var url = "https://cloud-sse.iexapis.com/stable/stock/"+req.body.quotesymbol+"/quote?token="+api_key;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send(null);

    var jsonquery = JSON.parse(xhr.responseText);
    var numshares = req.body.buyshares;
    var totalspent = jsonquery.latestPrice.toFixed(2)*numshares;
    var totalleft = 10000-totalspent;

    res.render("buy_posted", {
        symbol: jsonquery.symbol,
        companyName: jsonquery.companyName,
        latestPrice: jsonquery.latestPrice.toFixed(2),
        numshares: numshares,
        totalspent: totalspent.toFixed(2),
        totalleft: totalleft.toFixed(2)
    });
}



exports.login_post = async (req, res) => {
    const { uname, pword } = req.body;
    try {
        let user = await User.findOne({
            uname
        });

        if (!user)
            return res.status(400).json({
                message: "User Does Not Exist"
            });

        const isMatch = await bcrypt.compare(pword, user.pword);

        if (!isMatch)
            return res.status(400).json({
                message: "Incorrect Password!"
            });

        req.session.userID = user.pword;
        await res.redirect("dashboard");

    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

exports.signup_post = async (req, res) => {
    const { uname, fname, lname, pword } = req.body;
    try {
        let user = await User.findOne({
            uname
        });

        if (user) {
            return res.status(400).json({
                msg: "User Already Exists"
            });
        }

        user = new User({ uname, fname, lname, pword });

        const salt = await bcrypt.genSalt(10);
        user.pword = await bcrypt.hash(pword, salt);

        await user.save(function (err) {
            if (err) { return next(err); }
            res.redirect("login");
        });

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error in Saving");
    }
};
