var express = require('express');
var router = express.Router();

//Require controller modules
var goto = require("../controllers/goto");

//Routes
router.get("/", goto.home);
router.get("/products", goto.products);
router.get("/features", goto.features);
router.get("/pricing", goto.pricing);
router.get("/about", goto.about);
router.get("/contact_us", goto.contact_us);
router.get("/signup", goto.signup);
router.get("/login", goto.login);
router.get("/forgot", goto.forgot);

router.post("/login", goto.signup_post);
router.post("/portfolio", goto.login_post);
router.post("/logout", goto.logout);

router.get("/portfolio", goto.portfolio);
router.get("/logout", goto.logout);

router.get("/quote", goto.quote);
router.post("/quote", goto.quote_post);

router.get("/buy", goto.buy);
router.post("/buy", goto.buy_post);

router.get("/sell", goto.sell);
router.post("/sell", goto.sell_post);

router.get("/history", goto.history);

router.get("/error", goto.error);

module.exports = router;
