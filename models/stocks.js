const mongoose = require('mongoose');
const {Schema}= mongoose;
require('mongoose-currency').loadType(mongoose);
const Currency= mongoose.Types.Currency;
const updateStock= require('../utilities/utilities')

var fixtures = require('node-mongoose-fixtures');

const stockSchema= new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    code:{
        type:String,
        required:true,
        unique:true
    },
    price:{
        type:Currency,
        required:true,
    },
    diff:{
        type:Currency,
        required:true,
    }
},
{
    timestamps:true
});

const Stocks= mongoose.model('stock', stockSchema);

// populating databse with the stocks if not done so already
Stocks.count({}).then((count)=>{
if (count===0){
    fixtures({
        stock:[
        {
            "price": 0,
            "code": "GOOG",
            "name": "Alphabet Inc Class C",
            "diff": 0,
        },
        {
            "price": 0,
            "code": "AAPL",
            "name": "Apple Inc.",
            "diff": 0,
        },

        {
            "price": 0,
            "code": "FB",
            "name": "Facebook, Inc.",
            "diff": 0,
        },

        {
            "price": 0,
            "code": "ORCL",
            "name": "Oracle Corporation",
            "diff": 0,
        },
        {
            "price": 0,
            "code": "BIDU",
            "name": "Baidu, Inc.",
            "diff": 0,
        },
        {
            "price": 0,
            "code": "QCOM",
            "name": "QUALCOMM Incorporated",
            "diff": 0,
        },
        {
            "price": 0,
            "code": "ADBE",
            "name": "Adobe Systems Incorporated",
            "diff": 0,
        },

        {
            "price": 0,
            "code": "INFY",
            "name": "Infosys Limited",
            "diff": 0,
        },

        {
            "price": 0,
            "code": "CTSH",
            "name": "Cognizant Technology Solutions Corporation",
            "diff": 0,
        },

        {
            "price": 0,
            "code": "AABA",
            "name": "Altaba Inc.",
            "diff": 0,

        },

        {
            "price": 0,
            "code": "MSFT",
            "name": "Microsoft Corporation",
            "diff": 0,
        },

        {
            "price": 0,
            "code": "AMZN",
            "name": "Amazon.com Inc.",
            "diff": 0,
        },
        {
            "price": 0,
            "code": "INTC",
            "name": "Intel Corporation",
            "diff": 0,
        },
        {
            "price": 0,
            "code": "CSCO",
            "name": "Cisco Systems, Inc.",
            "diff": 0,

        },
        {
            "price": 0,
            "code": "EBAY",
            "name": "eBay Inc.",
            "diff": 0,

        },
        {
            "price": 0,
            "code": "TXN",
            "name": "Texas Instruments Inc.",
            "diff": 0,
        },
        {
            "price": 0,
            "code": "TSLA",
            "name": "Tesla Motors, Inc.",
            "diff": 0,
        },

        {
            "price": 0,
            "code": "NFLX",
            "name": "Netflix, Inc.",
            "diff": 0,
        },
        {
            "price": 0,
            "code": "NVDA",
            "name": "NVIDIA Corporation",
            "diff": 0,
        },
        {
            "price": 0,
            "code": "EA",
            "name": "Electronic Arts Inc.",
            "diff": 0,
        }
    ]
    },(err,data)=>{
        if(err){
            console.log(err)
        }
        else{
            console.log("fixtures loaded")
            setInterval(updateStock,10000);
        }
    })
}
else
{
    console.log(count," fixtures loaded already");
    setInterval(()=>{updateStock(Stocks)},10000);
}
})
.catch((err)=>{
    console.log(err);
})

module.exports= Stocks;