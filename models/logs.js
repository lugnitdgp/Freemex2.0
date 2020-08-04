var mongoose = require('mongoose');
var {Schema}=mongoose;
require('mongoose-currency').loadType(mongoose);
const Currency= mongoose.Types.Currency;

var User=require('./users')
var Stock=require('./stocks')

const LogSchema= new Schema({
    player:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    },
    stock:{
        type:mongoose.Schema.Types.ObjectId,
        ref:Stock
    },
    quantity:{
        type:Number,
        default:0
    },
    isBought:{
        type:Boolean,
        default:true
    },
    price:{
        type:Currency,
        default:000
    },
    change:{
        type:Currency,
        default:000
    },
},
{
    timestamps:true
})

module.exports=mongoose.model('log',LogSchema)