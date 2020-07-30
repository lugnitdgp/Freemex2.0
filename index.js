const express = require('express');
const morgan= require('morgan');
const mongoose = require('mongoose');
const cors= require('cors');
const cookieSession= require('cookie-session');
var bodyParser=require('body-parser');

const stockRouter= require('./routes/stockRoutes')
const marketRouter= require('./routes/marketRoutes');
const userRouter=require('./routes/users')
const playerStocksRouter=require('./routes/playerStocksRouter')
const homeRouter=require('./routes/homeRoutes')

const errorHandler = require('./errorHandles/errorHandlers');

const passportSetup=require('./authenticate');
const passport=require('passport');

let clients=[]
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
app.set('view engine','ejs');
app.use(express.static(__dirname + "/public"));

app.use(cookieSession({
    maxAge:5*24*60*60*1000,
    keys:[process.env.cookieKey]
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(cors({
    origin: process.env.CORS_ORIGIN,
}));

// app.use(express.json());
// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
let id=0;
const eventsHandler=(req,res,next)=>{
    id+=1;
    // console.log("listener added",id);
    const headers={
        'Content-Type':'text/event-stream',
        'Connection':'keep-alive',
        'Cache-Control':'no-cache'
    };
    res.writeHead(200,headers);
    res.write('\n');
    const newClient={
        id,
        res
    };
    clients.push(newClient);
    
    // const newClient={
    //     id,
    //     res
    // }
    // // clients[id]=res;
    // clients.push(newClient)
    // console.log("new client")
    // var interval=setInterval(()=>{
    //     Stocks.find({})
    //     .then((stocks)=>{
    //         // console.log(stocks)
    //         res.write(`data:${JSON.stringify(stocks)}\n\n`)
    //     })
    //     .catch((err)=>next(err))
    // },1000)

    req.on('close',()=>{
        console.log("closed connection");
        // clearInterval(interval)
        // res.end()
        clients=clients.filter(c=>c.id!==id);
    });
}

module.exports.sendEventsToAll = function sendEventsToAll(updateStocks){
    console.log("updated:",updateStocks)
    clients.forEach(c=>{
        console.log("updating frontend client ",c.id);
        return c.res.write(`data: ${JSON.stringify(updateStocks)}\n\n`)
    })
}


app.use('/api/stocks',stockRouter );
app.use('/market',marketRouter );
app.use('/auth',userRouter);
app.use('/playerStocks',playerStocksRouter)
app.use('/',homeRouter)

app.get('/events',eventsHandler);
app.get('/status', (req, res) => res.json({clients:clients.length}));

app.use(errorHandler.notFound);
app.use(errorHandler.errorHandler);

app.listen(port, ()=>{
    console.log(`server running at port ${process.env.PORT}`)
})