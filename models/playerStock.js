var mongoose = require('mongoose');
var {Schema}=mongoose;
require('mongoose-currency').loadType(mongoose);
const Currency= mongoose.Types.Currency;
var User=require('./users')
var Stock=require('./stocks')

const playerStockSchema=new Schema({
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
    invested:{
        type:Currency,
        default:000
    }
})

module.exports= mongoose.model('playerStock',playerStockSchema)