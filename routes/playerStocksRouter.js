const express= require('express')
const playerStocks= require('../models/playerStock');
const playerStockRouter= express.Router();

playerStockRouter.route('/')
.get((req,res,next)=>{
    playerStocks.find({})
    .then((stocks)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(stocks);
        // res.render("market",{stocks:stocks});
    })
    .catch((err)=>{
        next(err);
    })
})
.delete((req,res,next)=>{
    playerStocks.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader("Content-Type","application/json");
        res.json(resp);
    })
    .catch((err)=>{
        next(err)
    })
})

module.exports=playerStockRouter;