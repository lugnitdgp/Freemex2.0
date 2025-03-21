var passport= require('passport');
var User= require('./models/users');
var GoogleStrategy=require('passport-google-oauth20');
var FacebookStrategy= require('passport-facebook').Strategy;
var GitHubStrategy=require('passport-github2').Strategy;

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
        callbackURL:`${process.env.DOMAIN_NAME}/auth/google/redirect`,
        clientID:process.env.google_client_id,
        clientSecret:process.env.google_client_secret
},(accessToken,refreshToken,profile,done)=>{
    console.log("profile:",profile._json.email)
    User.findOne({googleId:profile.id})
    .then((user)=>{
        if(user===null)
        {
            new User({
                username:profile.displayName,
                name:`${profile.name.givenName} ${profile.name.familyName}`,
                googleId:profile.id,
                email:profile._json.email,
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

// passport.use(new FacebookStrategy({
//     callbackURL:'/auth/facebook/redirect',
//     clientID:process.env.facebook_client_id,
//     clientSecret:process.env.facebook_client_secret,
//     profileFields: ['id', 'email', 'name','displayName'] 
// },(accessToken,refreshToken,profile,done)=>{
//     console.log("facebook profile", profile);
//     User.findOne({facebookId:profile.id})
//     .then((user)=>{
//         if(user===null)
//         {
//             new User({
//                 username:profile.displayName,
//                 facebookId:profile.id,
//                 name:`${profile.name.givenName} ${profile.name.familyName}`,
//             }).save()
//             .then((user)=>{
//                 console.log("new user created",user);
//                 done(null,user);
//             })
//             .catch((err)=>{
//                 console.log(err)
//             })
//         }
//         else{
//             console.log("already present");
//             done(null,user)
//         }
//     })
//     .catch((err)=>{
//         console.log(err)
//     })
// }))

passport.use(new GitHubStrategy({
    clientID: process.env.github_client_id,
    clientSecret: process.env.github_client_secret,
    callbackURL: `${process.env.DOMAIN_NAME}/auth/github/callback`,
    scope: ['user:email']
  },
  (accessToken,refreshToken,profile,done)=>{
    console.log("github profile", profile.emails[0].value);
    User.findOne({githubId:profile.id})
    .then((user)=>{
        if(user===null)
        {
            new User({
                username:profile.username,
                githubId:profile.id,
                name:`${profile.username}`,
                email:profile.emails[0].value,
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
  }));