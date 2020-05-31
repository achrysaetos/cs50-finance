var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var PortfolioSchema = new Schema(
    {
        client: {type:String, required: true},
        date: {type:String, required: true},
        symbol: {type:String, required: true},
        companyName: {type:String, required: true},
        latestPrice: {type:Number, required: true},
        numshares: {type:Number, required: true},
        totalspent: {type:Number, required: true},
        totalleft: {type:Number, required: true}
    }
);

module.exports = mongoose.model("Portfolio", PortfolioSchema);