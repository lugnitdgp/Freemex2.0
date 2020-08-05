var axios= require('axios');
require('dotenv').config()
var index=require('../index')
var stock_prices=[];

const get_stock_prices=(Stocks)=>{
    console.log("inside updating function");
    var symbols=[];
    Stocks.find({})
    .then((stocks)=>{
        symbols=stocks.map((stock)=>stock.code)
        axios.get(`https://cloud.iexapis.com/stable/stock/market/batch?symbols=${symbols.join()}&types=quote&token=${process.env.API_TOKEN}`)
        .then((res)=>{
            // console.log("returning")
            // return(res.data)
            stock_prices=res.data
        })
        .catch((err)=>{
            console.log(err);
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
                var code=stock.code;
                var latestPrice=stock_prices[`${code}`].quote.latestPrice;
                // console.log(latestPrice)
                var change=stock_prices[`${code}`].quote.change;
                Stocks.findOneAndUpdate({code:code},{price:latestPrice.toString(),diff:change.toString()})
                .then((updatedStock)=>{
                    ++count;
                    console.log("updated",count)
                    if(count===20)
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
        all_players.map((player)=>{
            Player.findById(player._id)
            .then((playerObj)=>{
                playerObj.value_in_stocks=0
                PlayerStock.find({player:playerObj._id})
                .populate('player')
                .populate('stock')
                .then((playerstocks)=>{
                    playerstocks.map((playerstock)=>{
                        playerObj.value_in_stocks += playerstock.stock.price * playerstock.quantity
                        playerObj.save()
                        .then((resp)=>{
                            console.log("updated player stocks", resp)
                            return 
                        })
                    })
                })
                .catch((err)=>console.log(err))
            })
            .catch(err=>console.log(err))
        })
    })
    .catch(err=>console.log(err))
}

module.exports={update_stock_prices, update_player_assets}
