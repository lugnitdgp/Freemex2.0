var axios= require('axios');
require('dotenv').config()
var index=require('../index')
var stock_prices=[];

const get_stock_prices=(Stocks)=>{
    // console.log("inside updating function");
    var symbols=[];
    Stocks.find({})
    .then((stocks)=>{
        symbols=stocks.map((stock)=>stock.code)
        axios.get(`${process.env.API_URI}${symbols.join()}&types=quote&token=${process.env.API_TOKEN}`)
        .then((res)=>{
            // console.log("returning")
            // return(res.data)
            stock_prices=res.data
        })
        .catch((err)=>{
            console.log(err.response.data);
        })
    })
    .catch((err)=>{
        console.log(err)
    })
}

const update_stock_prices=(Stocks)=>{
    get_stock_prices(Stocks)
    if (stock_prices.length!==0)
    {
        Stocks.find({})
        .then((stocks)=>{
            var count=0;
            stocks.map((stock)=>{
                // console.log(stock)
                var code=stock.code;
                var latestPrice=stock_prices[`${code}`].quote.latestPrice;
                // console.log(code," ",stock_prices[`${code}`].quote.change)
                var change=stock_prices[`${code}`].quote.change;
                var changePerc=stock_prices[`${code}`].quote.changePercent;
                var latestUpdate=stock_prices[`${code}`].quote.latestUpdate;
                Stocks.findOneAndUpdate({code:code},{price:latestPrice.toString(),diff:change.toString(),diffPerc:changePerc,latestUpdate:new Date(latestUpdate)})
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
