var passport= require('passport');
var User= require('./models/users');
var FacebookTokenStrategy=require('passport-google');

require('dotenv').config();

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.facebookPassport=passport.use(new FacebookTokenStrategy({
    clientID:process.env.clientId,
    clientSecret:process.env.clientSecret
},(accessToken,refreshToken,profile,done)=>{
    User.findOne({facebookId:profile.id},(err,user)=>{
        if(err){
            return done(err,false)
        }
        if(!err & user!=null)
        {
            return done(null.user)
        }
        else{
            user=new User({username:profile.displayName});
            user.facebookId=profile.id;
            user.firstname=profile.name.givenName;
            user.lastname=profile.name.familyName;
            user.save((err,user)=>{
                if(err)
                return done(err,false);
                else return done(null,user); 
            })
        }
    })
}))