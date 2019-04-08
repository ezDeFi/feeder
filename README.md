This is price feeding for Endurio Stable Coin Algorithm. To start, just run `npm start`

To add more exchange as price feed, just add new file with name format: `_exchangename.js` under `modules/price` folder then use `_binance.js` as an output example, then setup approriate information in `modules/price/config.json`.

For development, when nUSD is not ready, please try with some pre-configured pair(s) and crawler's url: `http://localhost:3000/price/manual`

To fetch price, please use url: `http://localhost:3000/price/PAX_USDT`

Default password for update manual price: `crawler@nexty` with hash configured in `/routes/price.js` `dfc639c030af8bfc2566e8d9fd52cc63`