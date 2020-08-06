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
    var start_date=req.body.start_date
    var start_time=req.body.start_time
    var end_date=req.body.end_date
    var end_time=req.body.end_time
    console.log(end_time)
    var startTime=Date.parse(start_date+'T'+start_time)+ 330 * 60000
    var endTime=Date.parse(end_date+'T'+end_time)+ 330 * 60000
    Timer.create({startTime,endTime})
    .then((resp)=>{
        console.log(resp," added");
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch(err=>next(err))
})

timerRouter.get('/entry',(req,res,next)=>{
    res.render("timer")
})

module.exports=timerRouter