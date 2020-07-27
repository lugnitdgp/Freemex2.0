var mongoose = require('mongoose');
var {Schema}=mongoose;

var UserSchema= new Schema({
    username:{
        type:String,
        default:''
    },
    facebookId: String,
    googleId:String,
    admin:{
        type:Boolean,
        default:false
    }
});

module.exports=mongoose.model('User',UserSchema);