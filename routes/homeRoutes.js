const express= require('express');
const Stocks= require('../models/stocks');
const playerStocks=require('../models/playerStock');
const Player=require('../models/users');
const Log= require('../models/logs');
const Timer=require('../models/timer');
const updatePlayer=require('../utilities/utilities').update_player_assets;
const moment=require('moment');
const User=require('../models/users')

const homeRouter= express.Router();

const checkTime= async ()=>{
    context={}
    resp= await Timer.find({})
        resp=resp[resp.length-1];

        var endTime= resp.endTime.toISOString()
        var startTime= resp.startTime.toISOString()

        var now=new Date()
        now.setMinutes(now.getMinutes() + 330)
        now = now.toISOString()

        var EVENT_ENDED= Math.ceil(Date.parse(now)/1000) >= Date.parse(endTime)/1000
        var EVENT_STARTED= Math.ceil(Date.parse(now)/1000) >= Date.parse(startTime)/1000

        context.endTime=endTime
        context.startTime=startTime
        context.EVENT_ENDED=EVENT_ENDED
        context.EVENT_STARTED=EVENT_STARTED
        return context
}

homeRouter.get('/',async (req,res,next)=>{
    getTime= await checkTime()
        context={}
        context.startTime=getTime.startTime
        context.endTime=getTime.endTime
        if (getTime.EVENT_ENDED)
        {
            Player.find({})
            .then((players)=>{
                players.sort((a,b)=>((a.cash+a.value_in_stocks)<(b.cash+b.value_in_stocks))? 1 : -1)
                context.message={
                    'first': "The event has ended. Thanks for participating",
                    'second':"Congratulations to the winners and here is the leaderboard..."
                }
                context.players=players
                res.render("leaderboard",context)
            }) 
            .catch(err=>next(err))
        }

        else if(getTime.EVENT_STARTED && req.user)
        { 
            setInterval(()=>{updatePlayer(Player,playerStocks)}, 1000)
            playerStocks.find({player:req.user.id})
            .populate('player')
            .populate('stock')
            .then((playerstocks)=>{
                context.player=req.user
                context.player_stocks=playerstocks
                context.moment=moment
                res.render("portfolio",context)
            })
            .catch(err=>console.log(err))
        }
        else{
            context.player=-1
            if(req.user)
            context.player=req.user;
            context.event_started=getTime.EVENT_STARTED
            res.render("landing",context)
        }
});

homeRouter.get('/market', async (req,res,next)=>{
    var getTime=await checkTime()
    if(!req.user || !getTime.EVENT_STARTED || getTime.EVENT_ENDED)
    {
        return res.redirect("/")
    }
    else{
        Stocks.find({})
        .then((stocks)=>{
            res.statusCode=200;
            res.render("market",{stocks:stocks,player:req.user,startTime:getTime.startTime,endTime:getTime.endTime,moment});
        })
        .catch((err)=>{
            next(err);
        })
    }
})

homeRouter.post('/buystock/',async (req,res,next)=>{
    var getTime=await checkTime()
    if(req.user && getTime.EVENT_STARTED && !getTime.EVENT_ENDED)
    {
        // console.log(req.user)
        // console.log(req.body)
        response_data={}
        response_data.code=1;
        response_data.message='Some Error Occured'
       
        try {
            var requestedStockCode=req.body.code;
            var requestedStockCount=parseInt(req.body.quantity);
        } catch (error) {
            res.json(response_data)
        }
        Stocks.findOne({code:requestedStockCode})
        .then((stockObj)=>{
            Player.findById(req.user.id)
            .then((playerObj)=>{
               
                var availableMoney=playerObj.cash
                var stockPrice= stockObj.price
                if(availableMoney>(stockPrice * requestedStockCount) && requestedStockCount>0)
                {
                    try {
                        playerStocks.find({player:playerObj.id,stock:stockObj.id})
                        .populate('player')
                        .populate('stock')
                        .then((playerStockList)=>{
                            if(playerStockList.length) //if first stock of this company
                            {
                                var playerStock = playerStockList[0]
                                playerStock.quantity=playerStock.quantity + requestedStockCount
                                playerStock.invested+=stockPrice * requestedStockCount
                                playerStock.save()
                                .then((resp)=>{
                                    newAvailableMoney= availableMoney - (stockPrice * requestedStockCount)
                                    playerObj.cash= newAvailableMoney
                                    playerObj.value_in_stocks=0
                                    playerStocks.find({player:playerObj.id})
                                    .populate('player')
                                    .populate('stock')
                                    .then((playerstocks)=>{
                                        playerstocks.map((playerstock)=>{
                                            playerObj.value_in_stocks+=playerstock.stock.price * playerstock.quantity
                                        })
                                        playerObj.save()
                                        .then(resp=>{

                                            //add to log
                                            log= new Log({
                                                player:playerObj._id,
                                                stock:stockObj._id,
                                                quantity:requestedStockCount,
                                                price:stockPrice,
                                                isBought:true,
                                                change:0
                                            })
                                            log.save()
                                            .then((resp)=>{
                                                console.log("Stocks bought. Response: ")
                                                console.log(resp);
                                                response_data.code=0
                                                response_data.message='Transaction Successful'
                                               
                                                res.json(response_data)
                                            })
                                            .catch((err)=>{
                                                console.log(err);
                                            })
                                        }) 
                                        .catch((err)=>next(err))
                                    })
                                    .catch(err=>res.json(response_data))
                                })
                            }
                            else
                            {
                                var playerStock= new playerStocks({
                                    player:playerObj.id,
                                    stock:stockObj.id,
                                    quantity:requestedStockCount,
                                })
                              
                                var oldInvested=playerStock.invested
                                var newInvested=oldInvested+stockPrice * requestedStockCount
                                playerStock.invested=newInvested
                             
                                playerStock.save()
                                .then(resp=>{
                                    // console.log("Bought more. Response: ")
                                    // console.log(resp)
                                    newAvailableMoney= availableMoney - (stockPrice * requestedStockCount)
                                    playerObj.cash= newAvailableMoney
                                    playerObj.value_in_stocks=0
                                    playerStocks.find({player:playerObj.id})
                                    .populate('player')
                                    .populate('stock')
                                    .then((playerstocks)=>{
                                        playerstocks.map((playerstock)=>{
                                            // console.log("this",playerObj.value_in_stocks+playerstock.stock.price)
                                            playerObj.value_in_stocks+=playerstock.stock.price * playerstock.quantity
                                        })
                                        playerObj.save()
                                        .then(resp=>{

                                            log= new Log({
                                                player:playerObj._id,
                                                stock:stockObj._id,
                                                quantity:requestedStockCount,
                                                price:stockPrice,
                                                isBought:true,
                                                change:0
                                            })
                                            log.save()
                                            .then((resp)=>{
                                                console.log("Bought more. Response: ")
                                                console.log(resp);

                                                response_data.code=0
                                                response_data.message='Transaction Successful'
                                                res.json(response_data)
                                            })
                                            .catch((err)=>{
                                                console.log(err);
                                            })
                                        }) 
                                        .catch((err)=>next(err))  
                                    })
                                    .catch(err=>res.json(response_data))
                                        })
                            }
                        })
                    } catch (error) {
                        res.json(response_data)
                    }
                }
                else{
                    response_data.code=1;
                    response_data.message="Not enough cash"
                    res.json(response_data)
                }
            })
        })
        .catch(err=>(next(err)))
    }
    else
    {
        return res.redirect('/')
    }
})

homeRouter.post('/sellstock/', async (req,res,next)=>{
    var getTime= await checkTime()
    if(req.user && getTime.EVENT_STARTED && !getTime.EVENT_ENDED)
    {
        response_data={}
        response_data.code=1
        response_data.message='Some Error Occurred'

        try {
            requestedStockCode=req.body.code
            requestedStockCount=parseInt(req.body.quantity)
        } catch (error) {
            res.json(response_data);
            next(error);
        }
        Stocks.findOne({code:requestedStockCode})
        .then((stockObj)=>{
            Player.findById(req.user.id)
            .then((playerObj)=>{
                var availableMoney =playerObj.cash
                var stockPrice= stockObj.price

                playerStocks.find({player:playerObj.id,stock:stockObj.id})
                .populate('player')
                .populate('stock')
                .then((playerStockList)=>{
                    if(playerStockList.length && requestedStockCount <= playerStockList[0].quantity)
                    {
                        try {
                            var playerStock= playerStockList[0]
                            var initial_investment = playerStock.invested

                            playerStock.quantity = playerStock.quantity - requestedStockCount
                            playerStock.invested= stockPrice * playerStock.quantity
                            playerStock.save()
                            .then((resp)=>{
                                // console.log("Sold. Response:")
                                // console.log(resp)
                                newAvailableMoney= availableMoney + (stockPrice * requestedStockCount)
                                playerObj.cash = newAvailableMoney

                                playerObj.value_in_stocks=0

                                playerStocks.find({player:playerObj.id})
                                .populate('player')
                                .populate('stock')
                                .then((playerstocks)=>{
                                    // console.log("here",playerstocks)
                                    playerstocks.map((playerstock)=>{
                                        console.log("price:",playerstock.stock.price ,"qty:",playerstock.quantity)
                                        playerObj.value_in_stocks += playerstock.stock.price * playerstock.quantity
                                    })
                                    playerObj.save()
                                    .then((resp)=>{

                                        //log update
                                        log= new Log({
                                            player:playerObj._id,
                                            stock:stockObj._id,
                                            quantity:requestedStockCount,
                                            price:stockPrice,
                                            isBought:false,
                                            change:playerStock.invested + stockPrice * requestedStockCount - initial_investment
                                        })

                                        log.save()
                                        .then((resp)=>{
                                            console.log("Sold. Response:")
                                            console.log(resp)

                                            response_data.code=0
                                            response_data.message="Transaction Successful"
                                            res.json(response_data)
                                        })
                                        .catch((err)=>{
                                            console.log(err)
                                        })
                                    })
                                    .catch((err)=>{
                                        console.log(err)
                                        next(err);
                                    })
                                })
                                .catch(err=>{
                                    console.log(err)
                                    next(err)
                                })
                            });
                        } catch (error) {
                            console.log(err)
                            res.json(response_data)
                            next(err)
                        }
                    }
                    else
                    {
                        response_data.code=1
                        response_data.message= "Cannot sell more than what you have!"
                        
                        console.log(err)
                        res.json(response_data);
                    }
                })
            })
        })
        .catch((err)=>{
            console.log(err)
            res.json(response_data)
            next(err)
        })
    }
    else
    return res.redirect('/')
})

homeRouter.get('/transactions',async (req,res,next)=>{
    var getTime= await checkTime()
    if(req.user && getTime.EVENT_STARTED && !getTime.EVENT_ENDED)
    {
        if(!req.user){
            res.redirect("/");
        }
        else{
            context=[]
            Player.findById(req.user.id)
            .then((resp)=>{
                playerObj=resp
                Log.find({player:playerObj._id})
                .populate('player')
                .populate('stock')
                .then((resp)=>{
                    resp.sort((a,b)=>(a.createdAt<b.createdAt)? 1:-1)
                    context.player=playerObj
                    context.logs=resp
                    // console.log("context",context)
                    context.startTime=getTime.startTime
                    context.endTime=getTime.endTime
                    res.render("transactions",context)
                })
            })
            .catch((err)=>{
                next(err)
            })
        }
    }
    else{
        return res.redirect('/')
    }
})

homeRouter.get('/leaderboard',async (req,res,next)=>{
    var getTime= await checkTime()
    if(!req.user || !getTime.EVENT_STARTED || getTime.EVENT_ENDED){
        res.redirect("/");
    }
    else{
        response_data=[]
        Player.find({})
        .then((players)=>{
            players.sort((a,b)=>((a.cash+a.value_in_stocks)<(b.cash+b.value_in_stocks))? 1 : -1)
            res.render("leaderboard",{players:players, message:'', startTime:getTime.startTime, endTime:getTime.endTime})
        })
    }
})

homeRouter.get('/engage',async (req,res,next)=>{
    var getTime= await checkTime()
    if(!req.user || !getTime.EVENT_STARTED || getTime.EVENT_ENDED){
        res.redirect("/");
    }
    else
    {
        context={}
        context.startTime=getTime.startTime
        context.endTime=getTime.endTime
        res.render("engage",context)
    }
})

homeRouter.get('/rules',async (req,res,next)=>{
    var getTime= await checkTime()
    if(!req.user || !getTime.EVENT_STARTED || getTime.EVENT_ENDED){
        res.redirect("/");
    }
    else
    {
        context={}
        context.startTime=getTime.startTime
        context.endTime=getTime.endTime
        res.render("rules",context)
    }
})

homeRouter.get('/get_users', async (req,res,next)=>{
    var getTime= await checkTime()
    if(req.user && getTime.EVENT_STARTED&& !getTime.EVENT_ENDED)
    Player.find({})
    .then((users)=>{
        players=[]
        response_data={}
        users.map((user)=>{
            players.push(user.username)
        })
        response_data.users=players
        res.statusCode=200
        res.setHeader('Content-Type','application/json')
        res.json(response_data);
    })
    .catch((err)=>next(err))
    else
    return res.redirect('/');
})

homeRouter.post('/change_username/',async (req,res,next)=>{
    var getTime= await checkTime()
    if(req.user && getTime.EVENT_STARTED && !getTime.EVENT_ENDED)
    {
        response_data={}
        response_data.code=0
        response_data.message='Some error occurred'

        try {
            var old_username= req.body.current_username
            var new_username= req.body.username
        } catch (error) {
            response_data.message='Error in form data'
            res.setHeader('Content-Type','application/json')
            res.json(response_data)
        }
        console.log("usernames",old_username,new_username)
        Player.findOne({username:old_username})
        .then((user)=>{
            if(user!=null)
            {
                var user_instance= user
                user_instance.username= new_username
                user_instance.save()
                .then((new_user)=>{
                    response_data.code=0
                    response_data.message='Username changed successfully'
                    res.statusCode=200
                    res.setHeader('Content-Type','application/json')
                    res.json(response_data)
                })
            }
            else{
                response_data.message='User does not exist'
                res.json(response_data)
            }
        })
        .catch(err=>
            {
                console.log(err)
                res.json(response_data)
            })
        }
        else
        {
            return res.redirect('/')
        }
})

module.exports=homeRouter 