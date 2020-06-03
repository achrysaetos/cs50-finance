var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Portfolio_currentSchema = new Schema(
    {
        client: {type:String, required: true},
        symbol: {type:String, required: true},
        companyName: {type:String, required: true},
        currentPrice: {type:Number, required: true},
        currentShares: {type:Number, required: true},
        currentTotal: {type:Number, required: true},
        totalCash: {type:Number, required: true}
    }
);

module.exports = mongoose.model("Portfolio_current", Portfolio_currentSchema);