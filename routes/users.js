const express= require('express')
const Users= require('../models/users');
const userRouter= express.Router();
const passport= require('passport')

userRouter.get('/google',passport.authenticate('google',{scope:['profile','email']
}));

userRouter.get('/facebook',passport.authenticate('facebook'))

userRouter.get('/github', passport.authenticate('github', {scope:['user:email','user:profile']}))

userRouter.route('/logout')
.get((req,res,next)=>{
    if(req.user)
    req.logout();
    res.redirect('/')
});

userRouter.get('/google/redirect',passport.authenticate('google',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect('/')
});

userRouter.get('/facebook/redirect',passport.authenticate('facebook',{failureRedirect:'/login'}),(req,res)=>{
    res.redirect('/')
});

userRouter.get('/github/callback',passport.authenticate('github', { failureRedirect: '/login'}),(req,res)=>{
    res.redirect('/')
});

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

userRouter.get("/", verifyUser,(req,res,next)=>{
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
// .delete((req,res,next)=>{
//     Users.remove({})
//     .then((resp)=>{
//         res.statusCode=200;
//         res.setHeader("Content-Type","application/json");
//         res.json(resp);
//     })
//     .catch((err)=>{
//         next(err)
//     })
// })


module.exports=userRouter;