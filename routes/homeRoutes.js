const express= require('express')
const Stocks= require('../models/stocks');
const playerStocks=require('../models/playerStock')
const Player=require('../models/users')
const Log= require('../models/logs')

const homeRouter= express.Router();

homeRouter.get('/',(req,res)=>{
    if(!req.user)
    {
        res.render("landing",{event_started:true})
    }
    else
    {   
        playerStocks.find({player:req.user.id})
        .populate('player')
        .populate('stock')
        .then((playerstocks)=>{
            res.render("portfolio",{player:req.user,player_stocks:playerstocks})
        })
        .catch(err=>console.log(err))
    }
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
        res.render("landing",{event_started: true});
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
    response_data=[]
    Player.find({})
    .then((players)=>{
        players.sort((a,b)=>((a.cash+a.value_in_stocks)<(b.cash+b.value_in_stocks))? 1 : -1)
        res.render("leaderboard",{players:players, message:''})
    })
})

module.exports=homeRouter