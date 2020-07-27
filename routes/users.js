const express= require('express')
const Users= require('../models/users');
const userRouter= express.Router();
const passport= require('passport')

userRouter.get('/google',passport.authenticate('google',{scope:['profile']
}));

userRouter.route('/logout')
.get((req,res,next)=>{
    if(req.user)
    req.logout();
    res.redirect('/')
});

userRouter.get('/google/redirect',passport.authenticate('google'),(req,res)=>{
    res.redirect('/')
});

userRouter.route("/")
.get((req,res,next)=>{
    Users.find({})
    .then((users)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(users);
    })
    .catch((err)=>{
        next(err);
    })
})
.delete((req,res,next)=>{
    Users.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader("Content-Type","application/json");
        res.json(resp);
    })
    .catch((err)=>{
        next(err)
    })
})


module.exports=userRouter;