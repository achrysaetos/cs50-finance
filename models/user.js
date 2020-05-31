var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema(
    {
        fname: {type:String, required: true},
        lname: {type:String, required: true},
        uname: {type:String, required: true},
        pword: {type:String, required: true}
    }
);

module.exports = mongoose.model("User", UserSchema);