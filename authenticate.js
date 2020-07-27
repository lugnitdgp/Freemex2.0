var passport= require('passport');
var User= require('./models/users');
var GoogleStrategy=require('passport-google-oauth20');

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

// exports.facebookPassport=passport.use(new FacebookTokenStrategy({
//     clientID:process.env.clientId,
//     clientSecret:process.env.clientSecret
// },(accessToken,refreshToken,profile,done)=>{
//     User.findOne({facebookId:profile.id},(err,user)=>{
//         if(err){
//             return done(err,false)
//         }
//         if(!err & user!=null)
//         {
//             return done(null.user)
//         }
//         else{
//             user=new User({username:profile.displayName});
//             user.facebookId=profile.id;
//             user.firstname=profile.name.givenName;
//             user.lastname=profile.name.familyName;
//             user.save((err,user)=>{
//                 if(err)
//                 return done(err,false);
//                 else return done(null,user); 
//             })
//         }
//     })
// }))