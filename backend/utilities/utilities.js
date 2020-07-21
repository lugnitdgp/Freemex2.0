var axios= require('axios');
require('dotenv').config()
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
            stocks.map((stock)=>{
                var code=stock.code;
                var latestPrice=stock_prices[`${code}`].quote.latestPrice;
                // console.log(latestPrice)
                var change=stock_prices[`${code}`].quote.change;
                Stocks.findOneAndUpdate({code:code},{price:latestPrice.toString(),diff:change.toString()})
                .then((updatedStock)=>{
                    console.log("updated")
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

module.exports=update_stock_prices
