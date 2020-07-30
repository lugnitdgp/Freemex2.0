const express= require('express')
const Stocks= require('../models/stocks');
const marketRouter= express.Router();

marketRouter.route('/')
.get((req,res,next)=>{
    Stocks.find({})
    .then((stocks)=>{
        res.statusCode=200;
        // res.setHeader('Content-Type','application/json');
        // res.json(stocks);
        res.render("market",{stocks:stocks,player:req.user});
    })
    .catch((err)=>{
        next(err);
    })
})

module.exports=marketRouter;