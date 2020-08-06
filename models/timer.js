const mongoose = require('mongoose');
const {Schema}= mongoose;

const TimerSchema=new Schema({
    startTime:{
        type:Date,
        default: new Date()
    },
    endTime:{
        type:Date,
        default: new Date().setMinutes(100)
    }
})

module.exports=mongoose.model('timer',TimerSchema)