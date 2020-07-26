var mongoose = require('mongoose');
var {Schema}=mongoose;
var passportLocalMongoose= require('passport-local-mongoose')

var UserSchema= new Schema({
    firstname:{
        type:String,
        default:''
    },
    lastname:{
        type:String,
        default:''
    },
    facebookId: String,
    admin:{
        type:Boolean,
        default:false
    }
});

UserSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model('User',UserSchema);