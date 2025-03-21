var axios = require('axios');
require('dotenv').config();
var index = require('../index');
var stock_prices = [];

const symbols = "GOOG,AAPL,META,ORCL,BIDU,QCOM,ADBE,INFY,CTSH,MSFT,AMZN,INTC,CSCO,EBAY,TXN,TSLA,NFLX,NVDA,EA";

const get_stock_prices = async (Stocks) => {
    try {
        const stocks = await Stocks.find({});
        const tickers = symbols.toLowerCase();
        console.log('API Token : ', process.env.APIToken);
        console.log('API URI : ', process.env.API_URI);
        const res = await axios.get(`${process.env.API_URI}?tickers=${tickers}&token=${process.env.APIToken}`);
        console.log(res.data);
        stock_prices = res.data;
    } catch (err) {
        console.log(err.response ? err.response.data : err);
    }
};

const update_stock_prices = async (Stocks) => {
    await get_stock_prices(Stocks);
    if (stock_prices.length !== 0) {
        try {
            const stocks = await Stocks.find({});
            var count = 0;
            stock_prices.map(async (stock) => {
                var code = stock.ticker;
                var latestPrice = stock.tngoLast;
                var change = stock.tngoLast - stock.prevClose;
                var changePerc = (stock.tngoLast === 0 ? 0 : ((change / stock.tngoLast) * 100).toFixed(2));
                var latestUpdate = stock.timestamp;

                if (isNaN(Date.parse(latestUpdate))) {
                    console.error(`Invalid date for stock ${code}: ${latestUpdate}`);
                    return;
                }

                var updatedStock = {
                    price: latestPrice,
                    diff: change,
                    diffPerc: changePerc,
                    latestUpdate: new Date(latestUpdate)
                };

                console.log("updating", code);
                console.log(updatedStock);

                try {
                    await Stocks.findOneAndUpdate({ code: code }, updatedStock);
                    ++count;
                    if (count === 19) {
                        const updatedStocks = await Stocks.find({});
                        index.sendEventsToAll(updatedStocks);
                    }
                } catch (err) {
                    console.log(err);
                }
            });
        } catch (err) {
            console.log(err);
        }
    }
};

const update_player_assets = (Player, PlayerStock) => {
    Player.find({})
        .then((all_players) => {
            all_players.map((playerObj) => {
                playerObj.value_in_stocks = 0;
                PlayerStock.find({ player: playerObj._id })
                    .populate('player')
                    .populate('stock')
                    .then((playerstocks) => {
                        playerstocks.forEach((playerstock) => {
                            playerObj.value_in_stocks += playerstock.stock.price * playerstock.quantity;
                        });
                        Player.findByIdAndUpdate(playerObj._id, playerObj)
                            .then((updatedPlayer) => {
                                console.log("updated", updatedPlayer.name);
                            });
                    })
                    .catch(err => console.log(err));
            });
        })
        .catch(err => console.log(err));
};

module.exports = { update_stock_prices, update_player_assets };