var passport= require('passport');
var User= require('./models/users');
var GoogleStrategy=require('passport-google-oauth20');
var FacebookStrategy= require('passport-facebook').Strategy;

require('dotenv').config();

passport.serializeUser((user,done)=>{
    done(null,user.id);
});
passport.deserializeUser((id,done)=>{
    User.findById(id)
    .then((user)=>{
        done(null,user)
    });
});

passport.use(
    new GoogleStrategy({
        callbackURL:'/auth/google/redirect',
        clientID:process.env.google_client_id,
        clientSecret:process.env.google_client_secret
},(accessToken,refreshToken,profile,done)=>{
    // console.log(profile)
    User.findOne({googleId:profile.id})
    .then((user)=>{
        if(user===null)
        {
            new User({
                username:profile.displayName,
                googleId:profile.id
            }).save()
            .then((user)=>{
                // console.log("new user created",user)
                done(null,user)
            })
            .catch((err)=>{
                console.log(err);
            })
        }
        else{
            console.log("already present");
            done(null,user)
        }
    })
    .catch(err=>{
        console.log(err)
    })
}))

passport.use(new FacebookStrategy({
    callbackURL:'/auth/facebook/redirect',
    clientID:process.env.facebook_client_id,
    clientSecret:process.env.facebook_client_secret
},(accessToken,refreshToken,profile,done)=>{
    console.log("facebook profile", profile);
    User.findOne({facebookId:profile.id})
    .then((user)=>{
        if(user===null)
        {
            new User({
                username:profile.displayName,
                facebookId:profile.id
            }).save()
            .then((user)=>{
                console.log("new user created",user);
                done(null,user);
            })
            .catch((err)=>{
                console.log(err)
            })
        }
        else{
            console.log("already present");
            done(null,user)
        }
    })
    .catch((err)=>{
        console.log(err)
    })
}))