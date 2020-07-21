const express = require('express');
const morgan= require('morgan');
const mongoose = require('mongoose');
const cors= require('cors');
const errorHandler = require('./errorHandles/errorHandlers');
const stockRouter= require('./routes/stockRoutes')

require('dotenv').config();

const port = process.env.PORT || 8000;

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology:true, useFindAndModify:false})
.then((db)=>{
    console.log("connected to db")
})
. catch((err)=>{
    console.log(err)
})

const app=express();

app.use(morgan('common'));

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));

app.use(express.json());

app.get('/',(req,res)=>{
    res.json({
        message:'Freemex'
    });
});

app.use('/api/stocks',stockRouter );

app.use(errorHandler.notFound);
app.use(errorHandler.errorHandler);

app.listen(port, ()=>{
    console.log(`server running at port ${process.env.PORT}`)
})