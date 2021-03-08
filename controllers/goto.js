
const { check, validationResult } = require("express-validator");//after we npm install express-validator
const bcrypt = require("bcryptjs");//after we npm install bcryptjs

var api_key = "pk_f83525dace814340bdc3798e1a01e265";//api public key goes here
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;//in order to get json from http url

var User = require("../models/user");
var Portfolio = require("../models/portfolio");
var Portfolio_current = require("../models/portfolio_current");

/*-------------------------------------------------------------------------------------------------*/

exports.home = function (req, res) {
    if (req.session.userID)
        res.redirect("portfolio");
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
    if (req.session.userID)
        res.redirect("portfolio");
    res.render("signup");
};
exports.login = function (req, res) {
    if (req.session.userID)
        res.redirect("portfolio");
    res.render("login");
};
exports.forgot = function (req, res) {
    if (req.session.userID)
        res.redirect("portfolio");
    res.render("forgot");
};
exports.error = function (req, res) {
    res.render("error");
}

/*-------------------------------------------------------------------------------------------------*/

exports.portfolio = function (req, res) {
    if (!req.session.userID) {
        res.redirect("login");
    } else {
        res.render("portfolio");
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

/*-------------------------------------------------------------------------------------------------*/

exports.quote = (req, res) => {
    if (!req.session.userID)
        res.redirect("login");
    res.render("quote");
}
exports.quote_post = (req, res) => {
    if (!req.session.userID)
        res.redirect("login");
    try {
        var url = "https://cloud-sse.iexapis.com/stable/stock/" + req.body.quotesymbol + "/quote?token=" + api_key;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        var jsonquery = JSON.parse(xhr.responseText);
        var symbol = jsonquery.symbol;
        var companyName = jsonquery.companyName;
        var latestPrice = jsonquery.latestPrice.toFixed(2);
        try {
            var open = jsonquery.open.toFixed(2);
            var close = jsonquery.close.toFixed(2);
            var high = jsonquery.high.toFixed(2);
            var low = jsonquery.low.toFixed(2);
            res.render("quote_posted", {
                symbol: symbol, companyName: companyName, latestPrice: latestPrice,
                open: open, close: close, high: high, low: low
            });
        } catch {
            res.render("quote_posted", {
                symbol: symbol, companyName: companyName, latestPrice: latestPrice
            });
        }
    } catch (err) {
        console.log(err.message);
        var message= "Enter a valid symbol.";
        res.render("error", {message: message});
    }
};

/*-------------------------------------------------------------------------------------------------*/

exports.buy = (req, res) => {
    if (!req.session.userID)
        res.redirect("login");
    res.render("buy");
}
exports.buy_post = async (req, res) => {
    if (!req.session.userID)
        res.redirect("login");
    var user = req.session.userID;
    try {
        if (req.body.buyshares < 1 || !Number.isInteger(Number(req.body.buyshares)))
            throw new Error("Enter a Valid Symbol and a Positive Number of Shares!");
        let userjson = await User.findOne({
            uname: user
        });
        var url = "https://cloud-sse.iexapis.com/stable/stock/" + req.body.quotesymbol + "/quote?token=" + api_key;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        var client = userjson.uname;
        var jsonquery = JSON.parse(xhr.responseText);
        try {
            if (endowment - jsonquery.latestPrice * req.body.buyshares < 0)
                throw new Error("Not Enough Money!");

            var date = Date(Date.now());
            var symbol = jsonquery.symbol;
            var companyName = jsonquery.companyName;
            var latestPrice = jsonquery.latestPrice;
            var numshares = req.body.buyshares;
            var totalspent = jsonquery.latestPrice * numshares;

            try {
                let userjson2 = await Portfolio_current.findOne({
                    client, symbol, companyName
                });
                var currentPrice = latestPrice;
                var currentShares = +numshares + userjson2.currentShares;
                var currentTotal = totalspent;
                var totalCash = endowment - currentTotal;
                endowment = endowment - currentTotal;

            } catch {
                var currentPrice = latestPrice;
                var currentShares = numshares;
                var currentTotal = totalspent;
                var totalCash = endowment - currentTotal;
                endowment = endowment - currentTotal;

            } finally {
                portfolio = new Portfolio({ client, date, symbol, companyName, latestPrice, numshares, totalspent });
                portfolio_current = new Portfolio_current({
                    client, symbol, companyName, currentPrice,
                    currentShares, currentTotal, totalCash
                });

                await Portfolio_current.update(
                    { "symbol": symbol, "client": client, "companyName": companyName },
                    {
                        $set: { "currentShares": currentShares },
                        $setOnInsert: {
                            "currentPrice": currentPrice, "currentTotal": currentTotal, "totalCash": totalCash
                        }
                    },
                    { upsert: true });
                await Portfolio_current.update(
                    { "client": client },
                    {
                        $set: { "totalCash": totalCash }
                    },
                    { multi: true });
                await portfolio.save(function (err) {
                    if (err) { return next(err); }
                    res.render("buy_posted", {
                        symbol: symbol,
                        companyName: companyName,
                        latestPrice: latestPrice,
                        numshares: numshares,
                        totalspent: totalspent
                    });
                });
            }
        } catch {
            var message= "Not enough money.";
            res.render("error", {message: message});
        }

    } catch (err) {
        console.log(err.message);
        var message= "Enter a valid symbol and number of shares.";
        res.render("error", {message: message});
    }
};

/*-------------------------------------------------------------------------------------------------*/

exports.sell = (req, res) => {
    if (!req.session.userID)
        res.redirect("login");
    res.render("sell");
}
exports.sell_post = async (req, res) => {
    if (!req.session.userID)
        res.redirect("login");
    var user = req.session.userID;
    try {
        if (req.body.sellshares < 1 || !Number.isInteger(Number(req.body.sellshares)))
            throw new Error("Enter a Valid Symbol and a Positive Number of Shares!");
        let userjson = await User.findOne({
            uname: user
        });
        var url = "https://cloud-sse.iexapis.com/stable/stock/" + req.body.quotesymbol + "/quote?token=" + api_key;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);

        var client = userjson.uname;
        var jsonquery = JSON.parse(xhr.responseText);
        var date = Date(Date.now());
        var symbol = jsonquery.symbol;
        var companyName = jsonquery.companyName;
        let userjson4 = await Portfolio_current.findOne({
            client, symbol, companyName
        })
        if (userjson4 == null)
            throw new Error("Not Enough Shares!");
        try {
            let userjson3 = await Portfolio_current.findOne({
                client, symbol, companyName
            });
            if (userjson3.currentShares - req.body.sellshares < 0)
                throw new Error("Not Enough Shares!");

            var latestPrice = jsonquery.latestPrice;
            var numshares = -req.body.sellshares;
            var totalspent = jsonquery.latestPrice * numshares;

            try {
                let userjson2 = await Portfolio_current.findOne({
                    client, symbol, companyName
                });

                var currentPrice = latestPrice;
                var currentShares = +numshares + userjson2.currentShares;
                var currentTotal = userjson2.currentTotal + totalspent;
                var totalCash = userjson2.totalCash - totalspent;
                endowment = endowment - totalspent;

            } catch (err) {
                console.log(err.message);
                res.status(500).send("ERROR");

            } finally {
                portfolio = new Portfolio({ client, date, symbol, companyName, latestPrice, numshares, totalspent });
                portfolio_current = new Portfolio_current({
                    client, symbol, companyName, currentPrice,
                    currentShares, currentTotal, totalCash
                });

                await Portfolio_current.update(
                    { "symbol": symbol, "client": client, "companyName": companyName },
                    {
                        $set: { "currentShares": currentShares },
                        $setOnInsert: {
                            "currentPrice": currentPrice, "currentTotal": currentTotal, "totalCash": totalCash
                        }
                    },
                    { upsert: true });
                await Portfolio_current.update(
                    { "client": client },
                    {
                        $set: { "totalCash": totalCash }
                    },
                    { multi: true });
                await portfolio.save(function (err) {
                    if (err) { return next(err); }
                    res.render("sell_posted", {
                        symbol: symbol,
                        companyName: companyName,
                        latestPrice: latestPrice,
                        numshares: -numshares,
                        totalspent: -totalspent
                    });
                });
            }
        } catch {
            var message= "Not enough shares.";
            res.render("error", {message: message});
        }

    } catch (err) {
        console.log(err.message);
        var message= "Enter a valid symbol and number of shares.";
        res.render("error", {message: message});
    }
};

/*-------------------------------------------------------------------------------------------------*/

exports.portfolio = async (req, res) => {
    if (!req.session.userID)
        res.redirect("login");
    var user = req.session.userID;
    try {
        let stocksarray = await Portfolio_current.find({
            client: user
        });
        try {
            var totalMoney = stocksarray[0].totalCash;
            for (stocks of stocksarray) {
                var url = "https://cloud-sse.iexapis.com/stable/stock/" + stocks.symbol + "/quote?token=" + api_key;
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.send(null);

                var jsonquery = JSON.parse(xhr.responseText);
                var currentPrice = jsonquery.latestPrice;
                var currentTotal = currentPrice * stocks.currentShares;
                await Portfolio_current.update(
                    { "client": user, "symbol": stocks.symbol },
                    {
                        $set: { "currentPrice": currentPrice, "currentTotal": currentTotal }
                    }
                );
            }
            var newstocksarray = await Portfolio_current.find({
                client: user
            });
            for (newstocks of newstocksarray) {
                totalMoney = totalMoney + newstocks.currentTotal;
            }
            var totalCash = newstocksarray[0].totalCash;
        } catch {
            var totalMoney = endowment;
            for (stocks of stocksarray) {
                var url = "https://cloud-sse.iexapis.com/stable/stock/" + stocks.symbol + "/quote?token=" + api_key;
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.send(null);

                var jsonquery = JSON.parse(xhr.responseText);
                var currentPrice = jsonquery.latestPrice;
                var currentTotal = currentPrice * stocks.currentShares;

                await Portfolio_current.update(
                    { "client": user, "symbol": stocks.symbol },
                    {
                        $set: { "currentPrice": currentPrice, "currentTotal": currentTotal }
                    }
                );
            }
            var newstocksarray = await Portfolio_current.find({
                client: user
            });
            var totalCash = endowment;
        } finally {
            await res.render("portfolio", {
                newstocksarray: newstocksarray, totalMoney: totalMoney, totalCash: totalCash
            });
        }
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error");
    }
}

/*-------------------------------------------------------------------------------------------------*/

exports.history = async (req, res) => {
    if (!req.session.userID)
        res.redirect("login");
    var user = req.session.userID;
    try {
        let purchasesarray = await Portfolio.find({
            client: user
        });

        await res.render("history", {
            purchasesarray: purchasesarray
        });

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Error");
    }
};

/*-------------------------------------------------------------------------------------------------*/

exports.login_post = async (req, res) => {
    const { uname, pword } = req.body;
    try {
        let user = await User.findOne({
            uname
        });

        if (!user) {
            var message= "User does not exist.";
            return res.render("error", {message: message});
        }

        const isMatch = await bcrypt.compare(pword, user.pword);

        if (!isMatch) {
            var message= "Incorrect password.";
            return res.render("error", {message: message});
        }

        req.session.userID = user.uname;
        try {
            let endowmenthelper = await Portfolio_current.findOne({
                client: uname
            });
            endowment = endowmenthelper.totalCash;
        } catch {
            endowment = 10000;
        }
        await res.redirect("portfolio");

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
            var message= "User already exists.";
            return res.render("error", {message: message});
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
