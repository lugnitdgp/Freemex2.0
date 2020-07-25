const express= require('express')
const Stocks= require('../models/stocks');
const stockRouter= express.Router();

stockRouter.route('/')
.get((req,res,next)=>{
    Stocks.find({})
    .then((stocks)=>{
        res.statusCode=200;
        // res.setHeader('Content-Type','application/json');
        // res.json(stocks);
        res.render("market",{stocks:stocks});
    })
    .catch((err)=>{
        next(err);
    })
})
.post((req,res,next)=>{
    Stocks.create(req.body)
    .then((stock)=>{
        console.log(req.body.name," stock added");
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(stock);
    })
    .catch((err)=>{
        next(err)
    })
})
.delete((req,res,next)=>{
    Stocks.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader("Content-Type","application/json");
        res.json(resp);
    })
    .catch((err)=>{
        next(err)
    })
})

stockRouter.route('/:stockCode')
.get((req,res,next)=>{
    Stocks.findOne({code:req.params.stockCode})
    .then((stock)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(stock);
    })
    .catch((err)=>{
        next(err);
    })
})
.put((req,res,next)=>{
    Stocks.findOneAndUpdate({code:req.params.stockCode},{$set:req.body},{new:true})
    .then((stock)=>{
        res.statusCode=200;
        res.setHeader("Content-Type","application/json");
        stock.price.toFixed(2)
        res.json(stock);
    })
    .catch((err)=>{
        next(err);
    })
})
.delete((req,res,next)=>{
    Stocks.findOneAndRemove({code:req.params.stockCode})
    .then((stock)=>{
        res.statusCode= 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch((err)=>{
        next(err);
    })
});

module.exports=stockRouter;