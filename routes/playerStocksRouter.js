const express= require('express')
const playerStocks= require('../models/playerStock');
const playerLogs =require('../models/logs')
const playerStockRouter= express.Router();


playerStockRouter.route('/')
.get((req,res,next)=>{

    if(!req.user)
    {
        res.render("landing",{event_started:true})
    }
    else{
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
    }
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

playerStockRouter.route('/logs')
.get((req,res,next)=>{
    playerLogs.find({})
    .then((logs)=>{
        res.statusCode=200
        res.setHeader('Content-Type','application/json');
        res.json(logs);
    })
    .catch((err)=>{
        console.log(err)
    })
})
.delete((req,res,next)=>{
    playerLogs.remove({})
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