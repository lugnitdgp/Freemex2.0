const express= require('express')
const Stocks= require('../models/stocks');
const playerStocks=require('../models/playerStock')
const Player=require('../models/users')
const Log= require('../models/logs')
const Timer=require('../models/timer')
const updatePlayer=require('../utilities/utilities').update_player_assets

const homeRouter= express.Router();

homeRouter.get('/',(req,res,next)=>{
    Timer.find({})
    .then((resp)=>{
        // console.log(resp[resp.length-1])
        resp=resp[resp.length-1]
        var endTime= resp.endTime.toISOString()
        var startTime= resp.startTime.toISOString()
        // console.log(endTime,startTime)
        var now=new Date().toISOString()
        var EVENT_ENDED=now>=endTime
        var EVENT_STARTED= now>=startTime
        var context={}
        // console.log(EVENT_ENDED,parseInt(Date.parse(now)/1000),parseInt(Date.parse(endTime)/1000))
        context.startTime=startTime
        context.endTime=endTime

        if(EVENT_ENDED)
        {
            Player.find({})
            .then((players)=>{
                players.sort((a,b)=>((a.cash+a.value_in_stocks)<(b.cash+b.value_in_stocks))? 1 : -1)
                context.message={
                    'first': "The event has ended. Thanks for participating",
                    'second':"Congratulations to the winners and here is the leaderboard..."
                }
                context.players=players
                console.log("context",context)
                res.render("leaderboard",context)
            }) 
            .catch(err=>next(err))
        }

        else if(EVENT_STARTED && req.user)
        {
            // setInterval(()=>{updatePlayer(Player,playerStocks)}, 1000) 
            playerStocks.find({player:req.user.id})
            .populate('player')
            .populate('stock')
            .then((playerstocks)=>{
                context.player=req.user
                context.player_stocks=playerstocks
                res.render("portfolio",context)
            })
            .catch(err=>console.log(err))
        }
        else{
            context.event_started=EVENT_STARTED
            res.render("landing",context)
        }
    })
    .catch(err=>console.log(err))
});

homeRouter.post('/buystock/',(req,res,next)=>{
    response_data={}
    response_data.code=1;
    response_data.message='Some Error Occured'
    // console.log(response_data)
    try {
        var requestedStockCode=req.body.code;
        var requestedStockCount=parseInt(req.body.quantity);
        // console.log(requestedStockCode,requestedStockCount)
    } catch (error) {
        res.json(response_data)
    }
    Stocks.findOne({code:requestedStockCode})
    .then((stockObj)=>{
        Player.findById(req.user.id)
        .then((playerObj)=>{
            // console.log("player:",playerObj.cash)
            var availableMoney=playerObj.cash
            var stockPrice= stockObj.price
            // console.log("available ",availableMoney," stockprice",stockPrice)
            if(availableMoney>(stockPrice * requestedStockCount) && requestedStockCount>0)
            {
                try {
                    playerStocks.find({player:playerObj.id,stock:stockObj.id})
                    .populate('player')
                    .populate('stock')
                    .then((playerStockList)=>{
                        // console.log("playerstock",playerStockList)
                        if(playerStockList.length)
                        {
                            var playerStock = playerStockList[0]
                            playerStock.quantity=playerStock.quantity + requestedStockCount
                            playerStock.invested+=stockPrice * requestedStockCount
                            playerStock.save()
                            .then((resp)=>{
                                // console.log(res)
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
                                            console.log("added to transactions", resp);

                                            console.log("saved player stocks after buying",resp)
                                            response_data.code=0
                                            response_data.message='Transaction Successful'
                                            // console.log("cahnged:",response_data)
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
                            // console.log("creating playerStock: ",playerStock);
                            var oldInvested=playerStock.invested
                            var newInvested=oldInvested+stockPrice * requestedStockCount
                            playerStock.invested=newInvested
                            // console.log("creating playerStock after invest: ",playerStock);
                            playerStock.save()
                            .then(resp=>{
                                console.log("saved",resp)
                                       newAvailableMoney= availableMoney - (stockPrice * requestedStockCount)
                        playerObj.cash= newAvailableMoney
                        playerObj.value_in_stocks=0
                        playerStocks.find({player:playerObj.id})
                        .populate('player')
                        .populate('stock')
                        .then((playerstocks)=>{
                            playerstocks.map((playerstock)=>{
                                console.log("this",playerObj.value_in_stocks+playerstock.stock.price)
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
                                    console.log("added to transactions", resp);

                                    console.log("saved player stocks after buying",resp)
                                    response_data.code=0
                                    response_data.message='Transaction Successful'
                                    // console.log("cahnged:",response_data)
                                    res.json(response_data)
                                })
                                .catch((err)=>{
                                    console.log(err);
                                })

                                // console.log("saved player stocks after buying",resp)
                                // response_data.code=0
                                // response_data.message='Transaction Successful'
                                // // console.log("cahnged:",response_data)
                                // res.json(response_data)
                            }) 
                            .catch((err)=>next(err))  
                        })
                        .catch(err=>res.json(response_data))
                            })
                        }
                    })
                } catch (error) {
                    // console("err here")
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
})

homeRouter.post('/sellstock/', (req,res,next)=>{
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
                            console.log("saved",resp)
                            newAvailableMoney= availableMoney + (stockPrice * requestedStockCount)
                            playerObj.cash = newAvailableMoney

                            playerObj.value_in_stocks=0

                            playerStocks.find({player:playerObj.id})
                            .populate('player')
                            .populate('stock')
                            .then((playerstocks)=>{
                                console.log("here",playerstocks)
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
                                        console.log("log updated",resp)


                                        console.log("changing player stocks", resp);
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
})

homeRouter.get('/transactions', (req,res,next)=>{
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
                //sort resp acc to createdAt
                context.player=playerObj
                context.logs=resp
                console.log("context",context)
                res.render("transactions",context)
            })
        })
        .catch((err)=>{
            next(err)
        })
    }
})

homeRouter.get('/leaderboard',(req,res,next)=>{
    if(!req.user){
        res.redirect("/");
    }
    else{
        response_data=[]
        Player.find({})
        .then((players)=>{
            players.sort((a,b)=>((a.cash+a.value_in_stocks)<(b.cash+b.value_in_stocks))? 1 : -1)
            res.render("leaderboard",{players:players, message:''})
        })
    }
})

homeRouter.get('/engage',(req,res,next)=>{
    if(!req.user){
        res.redirect("/");
    }
    else
    res.render("engage")
})

homeRouter.get('/rules',(req,res,next)=>{
    if(!req.user){
        res.redirect("/");
    }
    else
    res.render("rules")
})

homeRouter.get('/get_users', (req,res,next)=>{
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
})

homeRouter.post('/change_username/',(req,res,next)=>{
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
})

module.exports=homeRouter 