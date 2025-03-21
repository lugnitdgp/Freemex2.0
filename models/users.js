var mongoose = require('mongoose');
var {Schema}=mongoose;
require('mongoose-currency').loadType(mongoose);
const Currency= mongoose.Types.Currency;
var stockSchema= require('./stocks').stockSchema

var UserSchema= new Schema({
    username:{
        type:String,
        default:''
    },
    name:{
        type:String,
        default:''
    },
    facebookId: String,
    googleId:String,
    githubId:String,
    admin:{
        type:Boolean,
        default:false
    },
    cash:{
        type: Currency,
        default:50000000
    },
    value_in_stocks:{
        type:Currency,
        default:0o0
    },
    email: String
});

module.exports=mongoose.model('User',UserSchema);