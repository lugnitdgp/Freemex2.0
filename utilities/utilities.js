var axios= require('axios');
require('dotenv').config()
var index=require('../index')

var stock_prices={};
var symbols=['GOOG','AAPL','TXN','EBAY','NFLX']

const get_stock_prices=(Stocks)=>{
    //for premium
    if(process.env.testing==='false')
    {
        console.log("premium")
        Stocks.find({})
        .then((stocks)=>{
            // symbols=stocks.map((stock)=>stock.code)
            stocks.forEach((stock)=>{
                axios.get(`${process.env.API_URI}${stock.code}&apikey=${process.env.API_TOKEN}`)
                .then((res)=>{
                // console.log("api ",res.data)
                stock_prices[`${stock.code}`]=res.data['Global Quote']
                console.log(stock_prices)
                })
                .catch((err)=>{
                    console.log(err);
                })
            })
        })
        .catch((err)=>{
            console.log(err)
        })
    }

    //for testing
    else
    {
        symbols.forEach((symbol)=>{
            axios.get(`${process.env.API_URI}${symbol}&apikey=${process.env.API_TOKEN}`).then((res)=>{
                console.log("api ",res.data)
                stock_prices[`${symbol}`]=res.data['Global Quote']
        
                console.log(stock_prices)
            })
        })
    }
}

const update_stock_prices=async (Stocks)=>{
    get_stock_prices(Stocks)
    len=Object.keys(stock_prices).length
    console.log(len)
    //premium

    if(process.env.testing=="false")
    {
        if (len!==0)
        {
            Stocks.find({})
            .then((stocks)=>{
                var count=0;
                stocks.map((stock)=>{
                    var code=stock.code;
                    var latestPrice=stock_prices[`${code}`]['05. price'];
                    var change=stock_prices[`${code}`]['09. change'];
                    var changePerc=stock_prices[`${code}`]['10. change percent'];
                    // var latestUpdate=stock_prices[`${code}`].quote.latestUpdate;
                    Stocks.findOneAndUpdate({code:code},{price:latestPrice.toString(),diff:change.toString(),diffPerc:changePerc,latestUpdate:new Date()})
                    .then((updatedStock)=>{
                        ++count;
                        // console.log("updated",count)
                        if(count===19)
                        {
                            Stocks.find({})
                            .then((stocks)=>{
                                index.sendEventsToAll(stocks);
                            })
                            .catch((err)=>{
                                console.log(err);
                            })
                        }
                    })
                    .catch((err)=>{
                        console.log(err);
                    })
                })

            })
            .catch((err)=>{
                console.log(err);
            })
        }    
    }

    //testing
    else
    {
        console.log("testing")
        if(len!=0)
        {
            var count=0
            symbols.forEach((symbol)=>{
                var code=symbol;
                var latestPrice=stock_prices[`${code}`]['05. price'];
                var change=stock_prices[`${code}`]['09. change'];
                var changePerc=stock_prices[`${code}`]['10. change percent'];
                // var latestUpdate=stock_prices[`${code}`].quote.latestUpdate;
                Stocks.findOneAndUpdate({code:code},{price:latestPrice.toString(),diff:change.toString(),diffPerc:changePerc,latestUpdate:new Date()})
                .then((updatedStock)=>{
                    ++count;
                    // console.log("updated",count)
                    if(count===symbols.length)
                    {
                        Stocks.find({})
                        .then((stocks)=>{
                            index.sendEventsToAll(stocks);
                        })
                        .catch((err)=>{
                            console.log(err);
                        })
                    }
                })
                .catch((err)=>{
                    console.log(err);
                })
            })
        }
    }
}

const update_player_assets=(Player,PlayerStock)=>{
    Player.find({})
    .then((all_players)=>{
        all_players.map((playerObj)=>{
                playerObj.value_in_stocks=0
                PlayerStock.find({player:playerObj._id})
                .populate('player')
                .populate('stock')
                .then((playerstocks)=>{
                    playerstocks.forEach((playerstock)=>{
                        playerObj.value_in_stocks += playerstock.stock.price * playerstock.quantity
                    })
                    Player.findByIdAndUpdate(playerObj._id, playerObj)
                    .then((updatedPlayer)=>{
                        console.log("updated", updatedPlayer.name)
                    })
                })
            .catch(err=>console.log(err))
        })
    })
    .catch(err=>console.log(err))
}

module.exports={update_stock_prices, update_player_assets}
