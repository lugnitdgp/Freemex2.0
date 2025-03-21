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
    console.log(startTime)
    console.log(endTime)
    Timer.create({startTime,endTime})
    .then((resp)=>{
        console.log(resp," added");
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    })
    .catch(err=>next(err))
})

const verifyUser=(req,res,next)=>{
    console.log(req.headers);
    var authHeader= req.headers.authorization;

    if(!authHeader)
    {
        var err = new Error('You are not authenticated')
        res.setHeader('WWW-Authenticate', 'Basic');
        res.statusCode=401
        return next(err);
    }
    var auth= new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':')

    var username= auth[0]
    var password= auth[1]

    if(username===process.env.username && password===process.env.password)
    next();
    else{
        var err = new Error('You are not authenticated')
        res.setHeader('WWW-Authenticate', 'Basic');
        res.statusCode=401
        return next(err);
    }
}

timerRouter.get('/entry', verifyUser,(req,res,next)=>{
    res.render("timer")
})

module.exports=timerRouter