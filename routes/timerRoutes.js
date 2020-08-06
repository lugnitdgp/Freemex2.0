const express= require('express')
const Timer= require('../models/timer');
const timerRouter= express.Router();

timerRouter.route('/')
.get((req,res,next)=>{
    Timer.find({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
        // console.log(timer);
    })
    .catch(err=>console.log(err))
})
.post((req,res,next)=>{
    Timer.create(req.body)
    .then((resp)=>{
        console.log(resp," added");
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch(err=>next(err))
})

module.exports=timerRouter